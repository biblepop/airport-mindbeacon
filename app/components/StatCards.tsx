"use client";

import { useEffect, useState } from "react";

interface CongestionItem {
  aicpName?: string;
  congestNm?: string;
  passengerNum?: number;
}

export default function StatCards() {
  const [totalPax, setTotalPax] = useState<number | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/congestion")
      .then((r) => r.json())
      .then((data) => {
        console.log("[StatCards] raw API response:", data);

        const isMockData = data?._mock === true;
        setIsMock(isMockData);

        if (data?._error) {
          console.warn("[StatCards] API error flag:", data._error);
          setError(data._error);
        }

        const items: CongestionItem[] =
          data?.response?.body?.items?.item ||
          data?.items ||
          [];

        console.log("[StatCards] parsed items:", items);

        const total = items.reduce(
          (sum: number, item: CongestionItem) => sum + (item.passengerNum ?? 0),
          0
        );

        console.log("[StatCards] total passengers:", total, "| isMock:", isMockData);
        setTotalPax(total);
      })
      .catch((err) => {
        console.error("[StatCards] fetch failed:", err);
        setError(String(err));
        setTotalPax(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const paxDisplay = loading ? "—" : totalPax === null ? "오류" : totalPax.toLocaleString();

  const cards = [
    {
      label: "현재 터미널 내 여객",
      value: paxDisplay,
      unit: "명",
      color: "#00AAB5",
      icon: "✈",
      sub: loading
        ? "조회 중…"
        : error && totalPax === null
        ? "API 오류"
        : isMock
        ? "⚠ 시뮬레이션 데이터"
        : "실시간 API 데이터",
      subColor: isMock && !loading ? "#F99D1B" : undefined,
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
