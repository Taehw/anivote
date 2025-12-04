export const dynamic = 'force-dynamic'; //강제 동적 렌더링 설정

import { supabase } from '@/lib/supabase';
import VoteButton from '@/components/VoteButton'; // 👈 새로 만든 컴포넌트 불러오기

// 1. 데이터 타입 정의 (TypeScript니까!)
type Animation = {
  id: number;
  title: string;
  image_url: string;
  vote_count: number;
};

// 2. 서버 컴포넌트 (async 필수)
export default async function Home() {
  // Supabase에서 데이터 가져오기 (투표 많은 순 정렬)
  const { data: animations, error } = await supabase
    .from('animations')
    .select('*')
    .order('vote_count', { ascending: false });

  // 에러 나면 콘솔에 찍어주기 (실무에선 에러 페이지 보여줌)
  if (error) {
    console.error('데이터 가져오기 실패:', error);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      {/* 헤더 */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">🏆 애니Vote MVP</h1>
        <p className="text-gray-400">당신의 '최애' 명장면에 투표하세요!</p>
      </header>

      {/* 그리드 리스트 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {animations?.map((ani: Animation) => (
          <div key={ani.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
            {/* 움짤 영역 (MVP니까 Next/Image 대신 그냥 img 태그 써서 복잡함 줄임) */}
            <div className="aspect-video relative">
              <img 
                src={ani.image_url} 
                alt={ani.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-bold text-yellow-400">
                {ani.vote_count}표
              </div>
            </div>

            {/* 정보 및 버튼 영역 */}
            <div className="p-3">
              <h2 className="font-semibold truncate mb-2">{ani.title}</h2>
              <VoteButton animeId={ani.id} initialVotes={ani.vote_count} />
              
            </div>
          </div>
        ))}
      </div>
      
      {/* 데이터 없을 때 안내 */}
      {(!animations || animations.length === 0) && (
        <div className="text-center py-20 text-gray-500">
          아직 등록된 명장면이 없어요. <br/> DB에 데이터를 넣어주세요!
        </div>
      )}
    </main>
  );
}