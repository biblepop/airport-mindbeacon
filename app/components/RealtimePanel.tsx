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

function GateCard({ z, idx }: { z: CongestionItem; idx: number }) {
  const status = getStatus(z.waitTime);
  const waitLen = parseInt(z.waitLength ?? "0", 10);
  const waitT = parseInt(z.waitTime ?? "0", 10);
  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        backgroundColor: STATUS_BG[status] || "rgba(0,170,181,0.05)",
        borderColor: `${STATUS_COLOR[status] || "#00AAB5"}30`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 truncate">
          {z.gateId || `게이트 ${idx + 1}`}
        </span>
        <span className="text-xs font-bold" style={{ color: STATUS_COLOR[status] || "#00AAB5" }}>
          {status}
        </span>
      </div>
      <div className="text-xl font-bold tabular-nums text-gray-800">
        {waitLen}
        <span className="text-xs font-normal text-gray-400 ml-1">명</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">대기시간 {waitT}분</div>
    </div>
  );
}

const MOCK_T1: CongestionItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5",  waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3",  waitLength: "8"  },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7",  waitLength: "20" },
];

const MOCK_T2: CongestionItem[] = [
  { gateId: "DG1_E", terminalId: "P02", waitTime: "6",  waitLength: "18" },
  { gateId: "DG2_E", terminalId: "P02", waitTime: "14", waitLength: "44" },
  { gateId: "DG3_W", terminalId: "P02", waitTime: "9",  waitLength: "25" },
  { gateId: "DG4_W", terminalId: "P02", waitTime: "11", waitLength: "31" },
];

export default function RealtimePanel() {
  const [t1Zones, setT1Zones] = useState<CongestionItem[]>([]);
  const [t2Zones, setT2Zones] = useState<CongestionItem[]>([]);
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

        const t1: CongestionItem[] = cData?.t1Items ?? [];
        const t2: CongestionItem[] = cData?.t2Items ?? [];
        console.log("[RealtimePanel] T1:", t1.length, "개 / T2:", t2.length, "개");
        if (t1.length > 0) setT1Zones(t1);
        if (t2.length > 0) setT2Zones(t2);

        console.log("[RealtimePanel] passenger 응답 전체:", JSON.stringify(pData, null, 2));

        const hourlyItems: HourlyItem[] = pData?.items || [];
        console.log("[RealtimePanel] hourlyItems:", hourlyItems.length, "개", hourlyItems);
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

  const displayT1 = t1Zones.length > 0 ? t1Zones : MOCK_T1;
  const displayT2 = t2Zones.length > 0 ? t2Zones : MOCK_T2;

  // 현재 시각 이후 시간대 제외
  const currentHour = new Date().getHours();
  function filterPastHours(items: HourlyItem[]): HourlyItem[] {
    return items.filter((item) => {
      const h = parseInt(item.hour.split(":")[0], 10);
      return h <= currentHour;
    });
  }

  const mockHourly: HourlyItem[] = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    t1Passenger: Math.floor(800 + Math.random() * 3500),
    t2Passenger: Math.floor(600 + Math.random() * 2800),
  }));

  const rawHourly = hourly.length > 0 ? hourly : mockHourly;
  const displayHourly = filterPastHours(rawHourly);
  const maxPax = Math.max(
    ...displayHourly.map((h) => h.t1Passenger + h.t2Passenger),
    1
  );

  return (
    <div className="flex flex-col gap-5">
      {/* 출국장 대기 현황 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">출국장 대기 현황</h3>
          <span className="text-xs text-gray-400">T1·T2 게이트 · 1분 갱신</span>
        </div>
        <div className={`transition-opacity duration-300 ${refreshing ? "opacity-50" : "opacity-100"}`}>
          {/* T1 */}
          <p className="text-xs font-semibold text-gray-400 mb-2">T1 게이트</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {displayT1.map((z, i) => <GateCard key={`t1-${i}`} z={z} idx={i} />)}
          </div>
          {/* T2 */}
          <p className="text-xs font-semibold text-gray-400 mb-2">T2 게이트</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayT2.map((z, i) => <GateCard key={`t2-${i}`} z={z} idx={i} />)}
          </div>
        </div>
      </div>

      {/* 시간대별 혼잡도 차트 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">시간대별 혼잡도</h3>
          <span className="text-xs text-gray-400">{(() => { const d = new Date(); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} 기준`; })()}</span>
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
