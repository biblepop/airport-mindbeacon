"use client";

import { useEffect, useState } from "react";

interface Worker {
  role: string;
  icon: string;
  score: number;
  status: "정상" | "휴식권장" | "교대권고";
}

const BASE_WORKERS: Worker[] = [
  { role: "항공관제사", icon: "🎧", score: 72, status: "정상" },
  { role: "보안요원", icon: "🛡", score: 85, status: "휴식권장" },
  { role: "지상조업 A팀", icon: "⚙️", score: 91, status: "교대권고" },
  { role: "입국심사관", icon: "🪪", score: 58, status: "정상" },
  { role: "수하물 처리팀", icon: "🧳", score: 77, status: "휴식권장" },
  { role: "안내 데스크", icon: "💁", score: 45, status: "정상" },
];

const STATUS_CONFIG = {
  정상: { color: "#00AAB5", bg: "rgba(0,170,181,0.08)", bar: "#00AAB5" },
  휴식권장: { color: "#F99D1B", bg: "rgba(249,157,27,0.1)", bar: "#F99D1B" },
  교대권고: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", bar: "#ef4444" },
};

export default function WorkerMonitor() {
  const [workers, setWorkers] = useState<Worker[]>(BASE_WORKERS);

  useEffect(() => {
    const id = setInterval(() => {
      setWorkers((prev) =>
        prev.map((w) => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const newScore = Math.min(100, Math.max(0, w.score + delta));
          const status: Worker["status"] =
            newScore >= 85 ? "교대권고" : newScore >= 70 ? "휴식권장" : "정상";
          return { ...w, score: newScore, status };
        })
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="max-w-screen-xl mx-auto px-6 pb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-airport-black">
          작업자 심리안전 모니터링
        </h2>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#00AAB5" }} />
          모든 데이터 익명 처리
        </span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="grid md:grid-cols-2 gap-3">
          {workers.map((w) => {
            const cfg = STATUS_CONFIG[w.status];
            return (
              <div
                key={w.role}
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: cfg.bg,
                  borderColor: `${cfg.color}25`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{w.icon}</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {w.role}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: cfg.color }}
                  >
                    {w.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${w.score}%`,
                        backgroundColor: cfg.bar,
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold tabular-nums w-8 text-right"
                    style={{ color: cfg.color }}
                  >
                    {w.score}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">스트레스 지수 (익명)</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-700">개인정보 보호:</span> 모든 데이터는 비식별화 처리 후 집계
          </span>
          <span>
            <span className="font-semibold text-gray-700">자발적 동의:</span> 사전 동의한 직원에 한해 수집
          </span>
          <span>
            <span className="font-semibold text-gray-700">데이터 보존:</span> 24시간 후 자동 삭제
          </span>
        </div>
      </div>
    </section>
  );
}
