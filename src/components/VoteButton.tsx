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

// 💡 2. Supabase 대신, 방금 만든 API Route로 요청을 보냅니다.
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ animation_id: animeId }),
        });

        if (response.status === 403) {
            // 💡 3. 이미 투표한 경우의 에러 처리
            alert('🚫 이미 이 명장면에 투표하셨어요! 다른 짤에 투표해 주세요.');
            setVotes((prev) => prev - 1); // 숫자 원상복구
            throw new Error('Duplicate vote detected.');
        }

        if (!response.ok) {
            throw new Error('Vote failed on the server.');
        }

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