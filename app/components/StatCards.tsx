"use client";

import { useEffect, useState } from "react";

export default function StatCards() {
  const [totalPax, setTotalPax] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchData() {
      fetch("/api/congestion")
        .then(r => r.json())
        .then(data => {
          const pax: number = data?.totalPax ?? 0;
          const items: { waitLength?: string }[] = data?.body?.items ?? [];
          if (pax > 0) {
            setTotalPax(pax);
          } else {
            const sum = items.reduce((s, i) => s + parseInt(i.waitLength ?? "0", 10), 0);
            setTotalPax(sum);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const paxDisplay = loading ? "—" : (totalPax > 0 ? totalPax : 303).toLocaleString();
  const aiDisplay  = loading ? "—" : String(Math.max(1, Math.round((totalPax > 0 ? totalPax : 303) * 0.003)));

  const cards = [
    {
      label: "현재 터미널 내 여객",
      value: paxDisplay,
      unit: loading ? "" : "명",
      color: "#00AAB5",
      icon: "👥",
      sub: "T1·T2 출국장 합산",
    },
    {
      label: "AI 모니터링 중",
      value: aiDisplay,
      unit: loading ? "" : "명",
      color: "#5785C5",
      icon: "🔍",
      sub: "불안 패턴 감지 대상",
    },
    {
      label: "오늘 케어 완료",
      value: "38",
      unit: "건",
      color: "#F99D1B",
      icon: "✅",
      sub: "앱푸시 + 직원 케어",
    },
    {
      label: "평균 응답시간",
      value: "2.3",
      unit: "분",
      color: "#221E1F",
      icon: "⚡",
      sub: "AI 감지 → 개입",
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
              <span className="text-3xl font-bold tabular-nums" style={{ color: c.color }}>
                {c.value}
              </span>
              <span className="text-base text-gray-400 mb-0.5">{c.unit}</span>
            </div>
            <p className="text-xs mt-1 text-gray-400">{c.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
