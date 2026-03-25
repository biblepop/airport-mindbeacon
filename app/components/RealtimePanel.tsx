"use client";

import { useEffect, useState } from "react";

interface CongestionItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
  occurtime?: string;
}

interface HourlyItem {
  hour: string;
  t1Passenger: number;
  t2Passenger: number;
}

const STATUS_COLOR: Record<string, string> = {
  원활: "#00AAB5",
  보통: "#F99D1B",
  혼잡: "#ef4444",
};

const STATUS_BG: Record<string, string> = {
  원활: "rgba(0,170,181,0.08)",
  보통: "rgba(249,157,27,0.1)",
  혼잡: "rgba(239,68,68,0.08)",
};

function getStatus(waitTime: string | undefined): string {
  const t = parseInt(waitTime ?? "0", 10);
  if (t >= 20) return "혼잡";
  if (t >= 10) return "보통";
  return "원활";
}

const MOCK_ZONES: CongestionItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5", waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3", waitLength: "8" },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7", waitLength: "20" },
];

export default function RealtimePanel() {
  const [zones, setZones] = useState<CongestionItem[]>([]);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setRefreshing(true);
      try {
        const [cRes, pRes] = await Promise.all([
          fetch("/api/congestion"),
          fetch("/api/passenger"),
        ]);
        const cData = await cRes.json();
        const pData = await pRes.json();

        // route.ts 응답 구조: { body: { items: [...] } }
        const items: CongestionItem[] = cData?.body?.items ?? [];
        console.log("[RealtimePanel] congestion items:", items.length, "개");
        if (items.length > 0) setZones(items.slice(0, 6));

        const hourlyItems: HourlyItem[] = pData?.items || [];
        if (hourlyItems.length > 0) setHourly(hourlyItems);
      } catch {
        // fallback to mock
      } finally {
        setRefreshing(false);
      }
    }

    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const displayZones = zones.length > 0 ? zones : MOCK_ZONES;

  const mockHourly: HourlyItem[] = Array.from({ length: 12 }, (_, i) => ({
    hour: `${String(i * 2).padStart(2, "0")}:00`,
    t1Passenger: Math.floor(800 + Math.random() * 3500),
    t2Passenger: Math.floor(600 + Math.random() * 2800),
  }));
  const displayHourly = hourly.length > 0 ? hourly.slice(0, 12) : mockHourly;
  const maxPax = Math.max(
    ...displayHourly.map((h) => h.t1Passenger + h.t2Passenger),
    1
  );

  return (
    <div className="flex flex-col gap-5">
      {/* CCTV 구역 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">출국장 대기 현황</h3>
          <span className="text-xs text-gray-400">T1 게이트 · 1분 갱신</span>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-300 ${refreshing ? "opacity-50" : "opacity-100"}`}>
          {displayZones.map((z, i) => {
            const status = getStatus(z.waitTime);
            const waitLen = parseInt(z.waitLength ?? "0", 10);
            const waitT = parseInt(z.waitTime ?? "0", 10);
            return (
              <div
                key={i}
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: STATUS_BG[status] || "rgba(0,170,181,0.05)",
                  borderColor: `${STATUS_COLOR[status] || "#00AAB5"}30`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 truncate">
                    {z.gateId || `게이트 ${i + 1}`}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: STATUS_COLOR[status] || "#00AAB5" }}
                  >
                    {status}
                  </span>
                </div>
                <div className="text-xl font-bold tabular-nums text-gray-800">
                  {waitLen.toLocaleString()}
                  <span className="text-xs font-normal text-gray-400 ml-1">명</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  대기 {waitT}분
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 시간대별 혼잡도 차트 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">시간대별 혼잡도</h3>
          <span className="text-xs text-gray-400">2026.03.25 기준</span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 128 }}>
          {displayHourly.map((h, i) => {
            const total = h.t1Passenger + h.t2Passenger;
            const pct = Math.round((total / maxPax) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full flex flex-col items-center justify-end"
                  style={{ height: 104 }}
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${pct}%`,
                      backgroundColor:
                        pct > 70 ? "#ef4444" : pct > 40 ? "#F99D1B" : "#00AAB5",
                    }}
                  />
                </div>
                <span className="text-[8px] text-gray-400 tabular-nums leading-none">
                  {h.hour}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          {[
            { label: "원활", color: "#00AAB5" },
            { label: "보통", color: "#F99D1B" },
            { label: "혼잡", color: "#ef4444" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-sm inline-block flex-shrink-0"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
