"use client";

import { useEffect, useState } from "react";

interface CongestionItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
  occurtime?: string;
}

export default function StatCards() {
  const [totalWaitLength, setTotalWaitLength] = useState<number | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isOffHours, setIsOffHours] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/congestion")
      .then((r) => r.json())
      .then((data) => {
        console.log("[StatCards] raw API response:", data);

        setIsMock(data?._mock === true);
        setIsOffHours(data?._offHours === true);

        if (data?._error) setError(data._error);

        const total: number = data?.totalWaitLength ?? 0;
        console.log("[StatCards] totalWaitLength:", total, "| isMock:", data?._mock);
        setTotalWaitLength(total);
      })
      .catch((err) => {
        console.error("[StatCards] fetch failed:", err);
        setError(String(err));
        setTotalWaitLength(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const paxDisplay = loading
    ? "—"
    : isOffHours
    ? "—"
    : totalWaitLength === null
    ? "오류"
    : totalWaitLength.toLocaleString();

  const paxSub = loading
    ? "조회 중…"
    : isOffHours
    ? "운영 외 시간"
    : error && totalWaitLength === null
    ? "API 오류"
    : isMock
    ? "⚠ 시뮬레이션 데이터"
    : "실시간 API 데이터";

  const cards = [
    {
      label: "현재 출국장 대기 인원",
      value: paxDisplay,
      unit: paxDisplay === "—" ? "" : "명",
      color: "#00AAB5",
      icon: "✈",
      sub: paxSub,
      subColor: isMock && !loading ? "#F99D1B" : isOffHours ? "#9ca3af" : undefined,
    },
    {
      label: "불안 감지 여객",
      value: "47",
      unit: "명",
      color: "#5785C5",
      icon: "🔍",
      sub: "AI 비전 분석 중",
    },
    {
      label: "케어 완료 건수",
      value: "312",
      unit: "건",
      color: "#F99D1B",
      icon: "✓",
      sub: "오늘 누적",
    },
    {
      label: "비식별 처리율",
      value: "98.7",
      unit: "%",
      color: "#221E1F",
      icon: "🔒",
      sub: "개인정보 보호",
    },
  ];

  return (
    <section className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: c.color }}
              >
                LIVE
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{c.label}</p>
            <div className="flex items-end gap-1">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: c.color }}
              >
                {c.value}
              </span>
              <span className="text-base text-gray-400 mb-0.5">{c.unit}</span>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: c.subColor ?? "#9ca3af" }}
            >
              {c.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
