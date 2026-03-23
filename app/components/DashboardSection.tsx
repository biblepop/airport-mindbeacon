"use client";

import { useEffect, useState, useCallback } from "react";

interface CongestionItem {
  aicpName?: string;
  congestNm?: string;
  passengerNum?: number;
}

interface HourlyItem {
  hour: string;
  t1Passenger: number;
  t2Passenger: number;
}

interface LogEntry {
  id: number;
  time: string;
  zone: string;
  level: "관찰" | "주의" | "즉각";
  action: string;
}

const STATUS_COLOR: Record<string, string> = {
  원활: "#00AAB5",
  보통: "#F99D1B",
  혼잡: "#ef4444",
  정상: "#00AAB5",
};

const STATUS_BG: Record<string, string> = {
  원활: "rgba(0,170,181,0.08)",
  보통: "rgba(249,157,27,0.1)",
  혼잡: "rgba(239,68,68,0.08)",
};

const LEVEL_COLOR: Record<string, string> = {
  관찰: "#5785C5",
  주의: "#F99D1B",
  즉각: "#ef4444",
};

function generateLog(id: number): LogEntry {
  const zones = [
    "T1 출국장 1구역",
    "T1 출국장 2구역",
    "T1 출국장 3구역",
    "T2 출국장 1구역",
    "T2 면세구역",
    "T2 탑승구역",
  ];
  const levels: LogEntry["level"][] = ["관찰", "주의", "즉각"];
  const actions = [
    "앱 푸시 전송 완료",
    "직원 파견 요청",
    "심리안정 콘텐츠 제공",
    "케어 완료 확인",
    "AI 모니터링 중",
  ];
  const now = new Date();
  const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return {
    id,
    time: t,
    zone: zones[Math.floor(Math.random() * zones.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
  };
}

function initLogs(): LogEntry[] {
  return Array.from({ length: 8 }, (_, i) => generateLog(i));
}

export default function DashboardSection() {
  const [zones, setZones] = useState<CongestionItem[]>([]);
  const [hourly, setHourly] = useState<HourlyItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [, setLogId] = useState(100);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/congestion"),
        fetch("/api/passenger"),
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();

      const items: CongestionItem[] =
        cData?.response?.body?.items?.item || cData?.items || [];
      if (items.length > 0) setZones(items.slice(0, 6));

      const hourlyItems: HourlyItem[] = pData?.items || [];
      if (hourlyItems.length > 0) setHourly(hourlyItems);
    } catch {
      // use fallback
    }
  }, []);

  useEffect(() => {
    setLogs(initLogs());
    fetchData();
    const dataInterval = setInterval(fetchData, 60000);
    const logInterval = setInterval(() => {
      setLogId((prev) => {
        const newId = prev + 1;
        setLogs((l) => [generateLog(newId), ...l.slice(0, 11)]);
        return newId;
      });
    }, 4000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(logInterval);
    };
  }, [fetchData]);

  const mockZones: CongestionItem[] = [
    { aicpName: "T1 출국장 1구역", congestNm: "원활", passengerNum: 1240 },
    { aicpName: "T1 출국장 2구역", congestNm: "보통", passengerNum: 2180 },
    { aicpName: "T1 출국장 3구역", congestNm: "혼잡", passengerNum: 3450 },
    { aicpName: "T2 출국장 1구역", congestNm: "원활", passengerNum: 980 },
    { aicpName: "T2 출국장 2구역", congestNm: "보통", passengerNum: 1760 },
    { aicpName: "T2 출국장 3구역", congestNm: "원활", passengerNum: 820 },
  ];
  const displayZones = zones.length > 0 ? zones : mockZones;

  const mockHourly: HourlyItem[] = Array.from({ length: 12 }, (_, i) => ({
    hour: `${String(i * 2).padStart(2, "0")}:00`,
    t1Passenger: Math.floor(800 + Math.random() * 3500),
    t2Passenger: Math.floor(600 + Math.random() * 2800),
  }));
  const displayHourly = hourly.length > 0 ? hourly.slice(0, 12) : mockHourly;
  const maxPax = Math.max(...displayHourly.map((h) => h.t1Passenger + h.t2Passenger));

  const aiLogs = logs.length > 0 ? logs : initLogs();

  return (
    <section className="max-w-screen-xl mx-auto px-6 pb-8">
      <h2 className="text-xl font-bold text-airport-black mb-5">실시간 대시보드</h2>
      <div className="grid md:grid-cols-2 gap-5">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* CCTV zones */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">CCTV 감지 구역 현황</h3>
              <span className="text-xs text-gray-400">6개 구역</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {displayZones.map((z, i) => {
                const status = z.congestNm || "원활";
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3 border"
                    style={{
                      backgroundColor: STATUS_BG[status] || "rgba(0,170,181,0.05)",
                      borderColor: `${STATUS_COLOR[status] || "#00AAB5"}30`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 truncate">
                        {z.aicpName || `구역 ${i + 1}`}
                      </span>
                      <span
                        className="text-xs font-bold ml-1"
                        style={{ color: STATUS_COLOR[status] || "#00AAB5" }}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-lg font-bold tabular-nums text-gray-800">
                      {(z.passengerNum || 0).toLocaleString()}
                      <span className="text-xs font-normal text-gray-400 ml-1">명</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">
                시간대별 혼잡도
              </h3>
              <span className="text-xs text-gray-400">2026.03.23 기준</span>
            </div>
            <div className="flex items-end gap-1 h-28">
              {displayHourly.map((h, i) => {
                const total = h.t1Passenger + h.t2Passenger;
                const pct = Math.round((total / maxPax) * 100);
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="w-full flex flex-col items-center justify-end h-20">
                      <div
                        className="w-full rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: pct > 70 ? "#ef4444" : pct > 40 ? "#F99D1B" : "#00AAB5",
                        }}
                      />
                    </div>
                    <span className="text-[8px] text-gray-400 tabular-nums">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#00AAB5" }} /> 원활
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#F99D1B" }} /> 보통
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#ef4444" }} /> 혼잡
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {/* AI log */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">AI 개입 로그</h3>
              <span
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: "#00AAB5" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-blink inline-block" style={{ backgroundColor: "#00AAB5" }} />
                실시간
              </span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {aiLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-xs tabular-nums text-gray-400 whitespace-nowrap mt-0.5">
                    {log.time}
                  </span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap"
                    style={{
                      color: LEVEL_COLOR[log.level],
                      backgroundColor: `${LEVEL_COLOR[log.level]}15`,
                    }}
                  >
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {log.zone}
                    </div>
                    <div className="text-xs text-gray-400">{log.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App push preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 text-sm mb-4">
              인천공항+ 앱 푸시 미리보기
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: "#00AAB5" }}
                >
                  AI
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">인천공항+</div>
                  <div className="text-xs text-gray-400">방금 전</div>
                </div>
              </div>
              <div
                className="text-sm font-semibold text-gray-800 mb-1"
                style={{ color: "#221E1F" }}
              >
                안녕하세요, 잠시 쉬어가는 건 어떨까요? 🌿
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                인천공항 마음안정실이 가까이 있어요. 잠깐의 휴식이 여행을 더 편안하게 만들어 드려요.
                <span
                  className="block mt-1 font-medium"
                  style={{ color: "#00AAB5" }}
                >
                  → 3층 중앙구역 심리안정실 안내 보기
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
