"use client";

import { useEffect, useState } from "react";


interface GateItem {
  waitLength?: string;
  waitTime?: string;
  gateId?: string;
}

export default function StatCards() {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [displayUnit, setDisplayUnit] = useState<string>("명");
  const [cardLabel, setCardLabel] = useState<string>("출국장 대기 인원");
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchData() {
      fetch("/api/congestion")
        .then((r) => r.json())
        .then((data) => {
          console.log("[StatCards] raw API response:", data);

          setIsMock(data?._mock === true);

          // route.ts가 미리 계산한 totalPax 우선 사용
          const totalPax: number = data?.totalPax ?? 0;
          const items: GateItem[] = data?.body?.items ?? [];

          // totalPax > 0 이면 인원(명) 표시
          if (totalPax > 0) {
            setDisplayValue(totalPax);
            setDisplayUnit("명");
            setCardLabel("출국장 대기 인원");
          } else {
            // 폴백: items에서 waitLength 합산
            const totalWaitLength = items.reduce(
              (s, item) => s + parseInt(item.waitLength ?? "0", 10),
              0
            );
            if (totalWaitLength > 0) {
              setDisplayValue(totalWaitLength);
              setDisplayUnit("명");
              setCardLabel("출국장 대기 인원");
            } else {
              // 최종 폴백: waitTime 평균(분)
              const times = items
                .map((item) => parseInt(item.waitTime ?? "0", 10))
                .filter((t) => t > 0);
              const avg =
                times.length > 0
                  ? Math.round(times.reduce((s, t) => s + t, 0) / times.length)
                  : 0;
              setDisplayValue(avg);
              setDisplayUnit("분");
              setCardLabel("출국장 평균 대기시간");
            }
          }

          console.log("[StatCards] items:", items.length, "개 / totalPax:", totalPax);
        })
        .catch((err) => {
          console.error("[StatCards] fetch failed:", err);
        })
        .finally(() => setLoading(false));
    }

    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const waitDisplay = loading ? "—" : String(displayValue);
  const waitSub = loading
    ? "조회 중…"
    : isMock
    ? "⚠ 시뮬레이션 데이터"
    : "실시간 API 데이터";

  const cards = [
    {
      label: cardLabel,
      value: waitDisplay,
      unit: loading ? "" : displayUnit,
      color: "#00AAB5",
      icon: "✈",
      sub: waitSub,
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
