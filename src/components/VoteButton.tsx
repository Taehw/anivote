// src/components/VoteButton.tsx
'use client'; // 👈 이게 있어야 클릭 이벤트 처리 가능!

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  animeId: number;
  initialVotes: number;
};

export default function VoteButton({ animeId, initialVotes }: Props) {
  const [votes, setVotes] = useState(initialVotes);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    // 1. 중복 클릭 방지
    if (isVoting) return;
    setIsVoting(true);

    try {
      // 2. [낙관적 업데이트] DB 기다리지 말고 일단 화면 숫자부터 올림 (반응속도 0.001초처럼 보이게)
      setVotes((prev) => prev + 1);

      // 3. 진짜 DB 업데이트 (현재 투표수 + 1)
      // 주의: MVP라 간단히 구현함. 동시성 이슈는 나중에 RPC로 해결.
      const { error } = await supabase
        .from('animations')
        .update({ vote_count: votes + 1 })
        .eq('id', animeId);

      if (error) throw error;

      // 4. (선택) 로그 테이블에도 기록 남기기
      await supabase.from('vote_logs').insert({
        animation_id: animeId,
        voter_identifier: 'mvp-user', // 나중에 IP나 UUID로 교체
      });

      alert('투표 완료! 🔥');
      
    } catch (error) {
      console.error('투표 실패:', error);
      setVotes((prev) => prev - 1); // 에러나면 숫자 원상복구
      alert('에러가 났어요 ㅠㅠ');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isVoting}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-colors text-sm disabled:opacity-50"
    >
      {isVoting ? '처리 중...' : `🔥 투표하기 (${votes})`}
    </button>
  );
}