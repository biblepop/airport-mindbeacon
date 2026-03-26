"use client";

import { useEffect, useState } from "react";

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

interface HourlyItem {
  hour: string;
  t1Passenger: number;
  t2Passenger: number;
}

interface ParkingItem {
  name: string;
  total: number;
  used: number;
  usageRate: number;
  status: "원활" | "보통" | "혼잡";
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

function SourceBadge({ isMock }: { isMock: boolean }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        color: isMock ? "#F99D1B" : "#00AAB5",
        backgroundColor: isMock ? "rgba(249,157,27,0.1)" : "rgba(0,170,181,0.1)",
      }}
    >
      {isMock ? "시뮬레이션" : "실시간 API"}
    </span>
  );
}

function GateCard({ z, idx }: { z: GateItem; idx: number }) {
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

// ── Mock 데이터 ──────────────────────────────────────────────────
const MOCK_DEP_T1: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P01", waitTime: "5",  waitLength: "12" },
  { gateId: "DG2_E", terminalId: "P01", waitTime: "12", waitLength: "35" },
  { gateId: "DG3_E", terminalId: "P01", waitTime: "22", waitLength: "68" },
  { gateId: "DG4_W", terminalId: "P01", waitTime: "3",  waitLength: "8"  },
  { gateId: "DG5_W", terminalId: "P01", waitTime: "15", waitLength: "42" },
  { gateId: "DG6_W", terminalId: "P01", waitTime: "7",  waitLength: "20" },
];
const MOCK_DEP_T2: GateItem[] = [
  { gateId: "DG1_E", terminalId: "P02", waitTime: "6",  waitLength: "18" },
  { gateId: "DG2_E", terminalId: "P02", waitTime: "14", waitLength: "44" },
  { gateId: "DG3_W", terminalId: "P02", waitTime: "9",  waitLength: "25" },
  { gateId: "DG4_W", terminalId: "P02", waitTime: "11", waitLength: "31" },
];
const MOCK_ARR_T1: GateItem[] = [
  { gateId: "AG1_E", terminalId: "P01", waitTime: "4",  waitLength: "8"  },
  { gateId: "AG2_E", terminalId: "P01", waitTime: "9",  waitLength: "25" },
  { gateId: "AG3_W", terminalId: "P01", waitTime: "16", waitLength: "45" },
  { gateId: "AG4_W", terminalId: "P01", waitTime: "6",  waitLength: "12" },
];
const MOCK_ARR_T2: GateItem[] = [
  { gateId: "AG1_E", terminalId: "P02", waitTime: "7",  waitLength: "18" },
  { gateId: "AG2_W", terminalId: "P02", waitTime: "11", waitLength: "32" },
];
const MOCK_PARKING: ParkingItem[] = [
  { name: "T1 단기주차장", total: 3200, used: 2240, usageRate: 70, status: "보통" },
  { name: "T1 장기주차장", total: 5100, used: 2856, usageRate: 56, status: "원활" },
  { name: "T2 단기주차장", total: 2400, used: 1920, usageRate: 80, status: "혼잡" },
  { name: "T2 장기주차장", total: 3800, used: 1900, usageRate: 50, status: "원활" },
  { name: "화물터미널",    total:  800, used:  480, usageRate: 60, status: "보통" },
];

// ── 컴포넌트 ────────────────────────────────────────────────────
export default function RealtimePanel() {
  const [depT1, setDepT1] = useState<GateItem[]>([]);
  const [depT2, setDepT2] = useState<GateItem[]>([]);
  const [arrT1, setArrT1] = useState<GateItem[]>([]);
  const [arrT2, setArrT2] = useState<GateItem[]>([]);
  const [parking, setParking] = useState<ParkingItem[]>([]);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);

  const [isMockDep, setIsMockDep] = useState(true);
  const [isMockArr, setIsMockArr] = useState(true);
  const [isMockPark, setIsMockPark] = useState(true);
  const [isMockPax, setIsMockPax] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setRefreshing(true);
      try {
        const [cRes, pRes, aRes, pkRes] = await Promise.all([
          fetch("/api/congestion"),
          fetch("/api/passenger"),
          fetch("/api/arrivals"),
          fetch("/api/parking"),
        ]);
        const [cData, pData, aData, pkData] = await Promise.all([
          cRes.json(), pRes.json(), aRes.json(), pkRes.json(),
        ]);

        // 출국장
        const t1: GateItem[] = cData?.t1Items ?? [];
        const t2: GateItem[] = cData?.t2Items ?? [];
        if (t1.length > 0) setDepT1(t1);
        if (t2.length > 0) setDepT2(t2);
        setIsMockDep(cData?._mock !== false);

        // 시간대별
        const hourlyItems: HourlyItem[] = pData?.items || [];
        if (hourlyItems.length > 0) setHourly(hourlyItems);
        setIsMockPax(pData?._mock !== false);

        // 입국장
        const at1: GateItem[] = aData?.t1Items ?? [];
        const at2: GateItem[] = aData?.t2Items ?? [];
        if (at1.length > 0) setArrT1(at1);
        if (at2.length > 0) setArrT2(at2);
        setIsMockArr(aData?._mock !== false);

        // 주차장
        const pkItems: ParkingItem[] = pkData?.items ?? [];
        if (pkItems.length > 0) setParking(pkItems);
        setIsMockPark(pkData?._mock !== false);
      } catch {
        // 상태 유지 (mock fallback)
      } finally {
        setRefreshing(false);
      }
    }

    fetchAll();
    const id = setInterval(fetchAll, 60000);
    return () => clearInterval(id);
  }, []);

  const displayDepT1 = depT1.length > 0 ? depT1 : MOCK_DEP_T1;
  const displayDepT2 = depT2.length > 0 ? depT2 : MOCK_DEP_T2;
  const displayArrT1 = arrT1.length > 0 ? arrT1 : MOCK_ARR_T1;
  const displayArrT2 = arrT2.length > 0 ? arrT2 : MOCK_ARR_T2;
  const displayParking = parking.length > 0 ? parking : MOCK_PARKING;

  // 현재 시각 이후 시간대 제외
  const currentHour = new Date().getHours();
  const rawHourly = hourly.length > 0 ? hourly : [];
  const displayHourly = (rawHourly.length > 0 ? rawHourly : MOCK_HOURLY_FALLBACK).filter(
    (item) => parseInt(item.hour.split(":")[0], 10) <= currentHour
  );
  const maxPax = Math.max(...displayHourly.map((h) => h.t1Passenger + h.t2Passenger), 1);

  const opacity = refreshing ? "opacity-50" : "opacity-100";

  return (
    <div className="flex flex-col gap-5">

      {/* ── 출국장 대기 현황 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">출국장 대기 현황</h3>
          <div className="flex items-center gap-2">
            <SourceBadge isMock={isMockDep} />
            <span className="text-xs text-gray-400">T1·T2 게이트 · 1분 갱신</span>
          </div>
        </div>
        <div className={`transition-opacity duration-300 ${opacity}`}>
          <p className="text-xs font-semibold text-gray-400 mb-2">T1 게이트</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {displayDepT1.map((z, i) => <GateCard key={`dep-t1-${i}`} z={z} idx={i} />)}
          </div>
          <p className="text-xs font-semibold text-gray-400 mb-2">T2 게이트</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayDepT2.map((z, i) => <GateCard key={`dep-t2-${i}`} z={z} idx={i} />)}
          </div>
        </div>
      </div>

      {/* ── 입국장 현황 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">입국장 혼잡도</h3>
          <div className="flex items-center gap-2">
            <SourceBadge isMock={isMockArr} />
            <span className="text-xs text-gray-400">T1·T2 · 1분 갱신</span>
          </div>
        </div>
        <div className={`transition-opacity duration-300 ${opacity}`}>
          <p className="text-xs font-semibold text-gray-400 mb-2">T1 입국장</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {displayArrT1.map((z, i) => <GateCard key={`arr-t1-${i}`} z={z} idx={i} />)}
          </div>
          <p className="text-xs font-semibold text-gray-400 mb-2">T2 입국장</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayArrT2.map((z, i) => <GateCard key={`arr-t2-${i}`} z={z} idx={i} />)}
          </div>
        </div>
      </div>

      {/* ── 주차장 현황 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">주차장 현황</h3>
          <div className="flex items-center gap-2">
            <SourceBadge isMock={isMockPark} />
            <span className="text-xs text-gray-400">실시간 잔여</span>
          </div>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 transition-opacity duration-300 ${opacity}`}>
          {displayParking.map((p, i) => (
            <div
              key={i}
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: STATUS_BG[p.status] || "rgba(0,170,181,0.05)",
                borderColor: `${STATUS_COLOR[p.status] || "#00AAB5"}30`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 truncate">{p.name}</span>
                <span className="text-xs font-bold" style={{ color: STATUS_COLOR[p.status] }}>
                  {p.status}
                </span>
              </div>
              {/* 사용률 바 */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${p.usageRate}%`,
                    backgroundColor: STATUS_COLOR[p.status],
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>사용 {p.used.toLocaleString()}면</span>
                <span className="font-semibold" style={{ color: STATUS_COLOR[p.status] }}>
                  {p.usageRate}%
                </span>
                <span>전체 {p.total.toLocaleString()}면</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 시간대별 혼잡도 차트 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">시간대별 혼잡도</h3>
          <div className="flex items-center gap-2">
            <SourceBadge isMock={isMockPax} />
            <span className="text-xs text-gray-400">
              {(() => {
                const d = new Date();
                return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} 기준`;
              })()}
            </span>
          </div>
        </div>
        <div className="flex items-end gap-1" style={{ height: 128 }}>
          {displayHourly.map((h, i) => {
            const total = h.t1Passenger + h.t2Passenger;
            const pct = Math.round((total / maxPax) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: 104 }}>
                  <div
                    className="w-full rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${pct}%`,
                      backgroundColor: pct > 70 ? "#ef4444" : pct > 40 ? "#F99D1B" : "#00AAB5",
                    }}
                  />
                </div>
                <span className="text-[8px] text-gray-400 tabular-nums leading-none">{h.hour}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          {[{ label: "원활", color: "#00AAB5" }, { label: "보통", color: "#F99D1B" }, { label: "혼잡", color: "#ef4444" }].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 컴포넌트 외부 상수 (mock hourly fallback)
const MOCK_HOURLY_FALLBACK: HourlyItem[] = [
  { hour: "00:00", t1Passenger:  320, t2Passenger:  280 },
  { hour: "01:00", t1Passenger:  180, t2Passenger:  150 },
  { hour: "02:00", t1Passenger:  120, t2Passenger:   90 },
  { hour: "03:00", t1Passenger:   95, t2Passenger:   75 },
  { hour: "04:00", t1Passenger:  420, t2Passenger:  350 },
  { hour: "05:00", t1Passenger: 1200, t2Passenger:  980 },
  { hour: "06:00", t1Passenger: 2100, t2Passenger: 1750 },
  { hour: "07:00", t1Passenger: 2800, t2Passenger: 2300 },
  { hour: "08:00", t1Passenger: 2650, t2Passenger: 2100 },
  { hour: "09:00", t1Passenger: 2200, t2Passenger: 1850 },
  { hour: "10:00", t1Passenger: 1800, t2Passenger: 1500 },
  { hour: "11:00", t1Passenger: 1650, t2Passenger: 1380 },
  { hour: "12:00", t1Passenger: 1900, t2Passenger: 1600 },
  { hour: "13:00", t1Passenger: 2050, t2Passenger: 1720 },
  { hour: "14:00", t1Passenger: 2300, t2Passenger: 1950 },
  { hour: "15:00", t1Passenger: 2500, t2Passenger: 2100 },
  { hour: "16:00", t1Passenger: 2700, t2Passenger: 2250 },
  { hour: "17:00", t1Passenger: 2900, t2Passenger: 2400 },
  { hour: "18:00", t1Passenger: 3100, t2Passenger: 2600 },
  { hour: "19:00", t1Passenger: 2850, t2Passenger: 2380 },
  { hour: "20:00", t1Passenger: 2400, t2Passenger: 2000 },
  { hour: "21:00", t1Passenger: 1950, t2Passenger: 1630 },
  { hour: "22:00", t1Passenger: 1400, t2Passenger: 1180 },
  { hour: "23:00", t1Passenger:  750, t2Passenger:  620 },
];
