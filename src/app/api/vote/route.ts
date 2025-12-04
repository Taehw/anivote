import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 투표는 POST 요청으로 처리합니다.
export async function POST(req: NextRequest) {
    
    // 1. 요청 본문에서 animation_id를 추출합니다.
    const { animation_id: animeId } = await req.json();

    if (!animeId) {
        return NextResponse.json({ error: 'Missing animation_id' }, { status: 400 });
    }
    
    // 2. 💡 Vercel 환경에서 클라이언트의 IP 주소를 가져옵니다.
    // 'x-forwarded-for'는 Vercel이 실제 유저 IP를 담아주는 헤더입니다.
    const clientIpList = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const clientIp = clientIpList.split(',')[0].trim(); // 리스트일 경우 첫 번째 IP만 사용

    // 3. 💡 중복 투표를 확인합니다: 이 IP가 이 애니에 이미 투표했는지 확인합니다.
    const { data: existingVotes, error: selectError } = await supabase
        .from('vote_logs')
        .select('id')
        .eq('voter_identifier', clientIp) // 👈 IP로 식별
        .eq('animation_id', animeId);

    if (selectError) {
        console.error('DB 쿼리 에러:', selectError);
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    if (existingVotes && existingVotes.length > 0) {
        // 이미 투표함: 403 에러 반환
        return NextResponse.json({ error: 'Already voted from this device/IP.' }, { status: 403 });
    }

    // --- 중복이 없으므로 투표 처리 ---

    // 4. animations 테이블에서 현재 투표 수를 가져옵니다.
    const { data: animationData, error: fetchError } = await supabase
        .from('animations')
        .select('vote_count')
        .eq('id', animeId)
        .single();
    
    if (fetchError || !animationData) {
        return NextResponse.json({ error: 'Animation not found.' }, { status: 404 });
    }

    const currentCount = animationData.vote_count;
    
    // 5. 투표 수 +1 업데이트
    const { error: updateError } = await supabase
        .from('animations')
        .update({ vote_count: currentCount + 1 })
        .eq('id', animeId);

    // 6. 💡 vote_logs 테이블에 IP 주소를 기록합니다. (핵심)
    const { error: logError } = await supabase
        .from('vote_logs')
        .insert({ 
            animation_id: animeId, 
            voter_identifier: clientIp // 👈 IP 주소로 저장
        });

    if (updateError || logError) {
        console.error('투표 저장 실패:', updateError || logError);
        return NextResponse.json({ error: 'Failed to record vote.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vote recorded successfully.' });
}