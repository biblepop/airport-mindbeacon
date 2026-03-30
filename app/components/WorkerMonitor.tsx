"use client";

import { useEffect, useRef, useState } from "react";

interface Worker {
  role: string;
  icon: string;
  score: number;
  hours: number;
  status: "정상" | "휴식권장" | "교대권고";
}

interface FeedItem {
  id: number;
  text: string;
  type: "info" | "warn" | "danger";
  time: string;
}

const BASE_WORKERS: Worker[] = [
  { role: "항공관제사",   icon: "🎧", score: 72, hours: 5.5, status: "휴식권장" },
  { role: "보안요원",     icon: "🛡️", score: 85, hours: 7.0, status: "교대권고" },
  { role: "지상조업 A팀", icon: "⚙️", score: 91, hours: 8.5, status: "교대권고" },
  { role: "입국심사관",   icon: "🪪", score: 58, hours: 3.0, status: "정상" },
  { role: "수하물 처리팀",icon: "🧳", score: 77, hours: 6.5, status: "휴식권장" },
  { role: "안내 데스크",  icon: "💁", score: 45, hours: 4.0, status: "정상" },
];

// 히트맵 구역 → worker 인덱스 매핑
const ZONE_MAP = [
  { zone: "관제탑",    workerIdx: 0 },
  { zone: "보안검색",  workerIdx: 1 },
  { zone: "수하물처리",workerIdx: 4 },
  { zone: "입국심사",  workerIdx: 3 },
  { zone: "지상조업",  workerIdx: 2 },
  { zone: "안내데스크",workerIdx: 5 },
];

const STATUS_CONFIG = {
  정상:   { color: "#00AAB5", bg: "rgba(0,170,181,0.08)",   bar: "#00AAB5",  label: "정상 근무 중",                       labelColor: "#00AAB5" },
  휴식권장:{ color: "#F99D1B", bg: "rgba(249,157,27,0.10)",  bar: "#F99D1B",  label: "⚠️ 30분 내 휴식 권고 알림 발송",     labelColor: "#d97706" },
  교대권고:{ color: "#ef4444", bg: "rgba(239,68,68,0.08)",   bar: "#ef4444",  label: "🚨 관리자 교대 요청 자동 발송",       labelColor: "#dc2626" },
};

const FEED_TEMPLATES = [
  { text: "항공관제사 스트레스 82 → 휴식 권고 알림 발송",       type: "warn"   as const },
  { text: "수하물 처리팀 교대 요청 → 관리자 승인 대기",         type: "danger" as const },
  { text: "입국심사관 정상 복귀 확인",                          type: "info"   as const },
  { text: "지상조업 A팀 스트레스 91 → 즉시 교대 요청 발송",     type: "danger" as const },
  { text: "보안요원 연속 근무 7시간 → 휴식 권고 알림 발송",     type: "warn"   as const },
  { text: "안내 데스크 스트레스 정상 범위 유지",                type: "info"   as const },
  { text: "항공관제사 20분 휴식 후 정상 복귀",                  type: "info"   as const },
  { text: "지상조업 A팀 교대 완료 — 스트레스 58로 감소",        type: "info"   as const },
];

function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function WorkerMonitor() {
  const [workers, setWorkers] = useState<Worker[]>(BASE_WORKERS);
  const [feed, setFeed]       = useState<FeedItem[]>([]);
  const feedIdRef = useRef(0);
  const feedIndexRef = useRef(0);

  // 스트레스 점수 갱신
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

  // 실시간 알림 피드
  useEffect(() => {
    const id = setInterval(() => {
      const tpl = FEED_TEMPLATES[feedIndexRef.current % FEED_TEMPLATES.length];
      feedIndexRef.current += 1;
      const item: FeedItem = { id: feedIdRef.current++, text: tpl.text, type: tpl.type, time: nowTime() };
      setFeed((prev) => [item, ...prev].slice(0, 30));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const monitoring = 47;
  const restAdvised = workers.filter((w) => w.status !== "정상").length + 1; // 3명 고정감
  const prevented = 8;

  const SUMMARY_CARDS = [
    { label: "현재 모니터링 직원 수", value: `${monitoring}명`, color: "#00AAB5", icon: "👷" },
    { label: "휴식 권고 중",          value: `${restAdvised}명`, sub: "스트레스 80 이상", color: "#F99D1B", icon: "⚠️" },
    { label: "오늘 사고 예방 기여",   value: `${prevented}건`, color: "#6366f1", icon: "🛡️" },
  ];

  const FEED_DOT: Record<FeedItem["type"], string> = { info: "#00AAB5", warn: "#F99D1B", danger: "#ef4444" };

  return (
    <section className="max-w-screen-xl mx-auto px-3 sm:px-6 pb-10">
      {/* 헤더 */}
      <div className="flex items-start sm:items-center justify-between mb-5 gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">작업자 심리안전 모니터링</h2>
          <p className="text-sm text-gray-500 mt-0.5">AI 기반 실시간 스트레스 감지 · 자동 개입 시스템</p>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: "#00AAB5" }} />
          <span className="hidden sm:inline">모든 데이터 익명 처리</span>
          <span className="sm:hidden">익명 처리</span>
        </span>
      </div>

      {/* 상단 요약 카드 3개 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {SUMMARY_CARDS.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{c.icon}</span>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 leading-tight">{c.label}</div>
              {c.sub && <div className="text-[10px] text-gray-400">{c.sub}</div>}
              <div className="text-xl font-bold mt-0.5" style={{ color: c.color }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 구역 히트맵 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">구역별 스트레스 히트맵</span>
          <span className="text-[11px] text-gray-400">3초마다 자동 갱신</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {ZONE_MAP.map(({ zone, workerIdx }) => {
            const w = workers[workerIdx];
            const isRed    = w.score >= 85;
            const isOrange = w.score >= 70 && w.score < 85;
            const bg    = isRed ? "rgba(239,68,68,0.12)"     : isOrange ? "rgba(249,157,27,0.12)"    : "rgba(0,170,181,0.10)";
            const border= isRed ? "rgba(239,68,68,0.35)"     : isOrange ? "rgba(249,157,27,0.35)"    : "rgba(0,170,181,0.30)";
            const textC = isRed ? "#dc2626"                  : isOrange ? "#d97706"                  : "#00AAB5";
            return (
              <div
                key={zone}
                className={`relative rounded-xl p-3 border flex flex-col items-center gap-1 transition-all duration-700${isRed ? " animate-pulse" : ""}`}
                style={{ backgroundColor: bg, borderColor: border }}
              >
                {/* 교대 필요 뱃지 */}
                {isRed && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-red-500 text-white px-1 py-0.5 rounded-full whitespace-nowrap leading-tight">
                    ⚡교대
                  </span>
                )}
                <span className="text-lg sm:text-xl mt-1">{w.icon}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 text-center leading-tight">{zone}</span>
                <span className="text-xl sm:text-2xl font-black tabular-nums" style={{ color: textC }}>{w.score}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-400">{w.status}</span>
              </div>
            );
          })}
        </div>
        {/* 범례 */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(0,170,181,0.5)" }} />정상 (70 미만)</span>
          <span className="flex items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(249,157,27,0.6)" }} />휴식권장 (70–84)</span>
          <span className="flex items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.55)" }} />교대권고 (85+) · 깜빡임</span>
        </div>
      </div>

      {/* 메인: 직군 카드 + 알림 피드 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 직군별 카드 */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="grid md:grid-cols-2 gap-3">
            {workers.map((w) => {
              const cfg = STATUS_CONFIG[w.status];
              return (
                <div
                  key={w.role}
                  className="rounded-xl p-4 border"
                  style={{ backgroundColor: cfg.bg, borderColor: `${cfg.color}25` }}
                >
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg sm:text-xl flex-shrink-0">{w.icon}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{w.role}</span>
                    </div>
                    <span
                      className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {w.status}
                    </span>
                  </div>

                  {/* 스트레스 바 */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${w.score}%`, backgroundColor: cfg.bar }}
                      />
                    </div>
                    <span className="text-sm font-bold tabular-nums w-8 text-right" style={{ color: cfg.color }}>
                      {w.score}
                    </span>
                  </div>

                  {/* 연속 근무 시간 */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>스트레스 지수 (익명)</span>
                    <span className="font-medium text-gray-500">⏱ 연속 {w.hours}시간 근무</span>
                  </div>

                  {/* 자동 조치 */}
                  <div className="text-xs font-medium mt-1" style={{ color: cfg.labelColor }}>
                    {cfg.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 개인정보 안내 */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs text-gray-500">
            <span><span className="font-semibold text-gray-700">개인정보 보호:</span> 모든 데이터는 비식별화 처리 후 집계</span>
            <span><span className="font-semibold text-gray-700">자발적 동의:</span> 사전 동의한 직원에 한해 수집</span>
            <span><span className="font-semibold text-gray-700">데이터 보존:</span> 24시간 후 자동 삭제</span>
          </div>
        </div>

        {/* 실시간 알림 피드 */}
        <div className="w-full md:w-72 md:flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">실시간 알림 피드</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1" style={{ scrollbarWidth: "thin" }}>
            {feed.length === 0 && (
              <div className="text-xs text-gray-400 text-center mt-8">이벤트 대기 중...</div>
            )}
            {feed.map((item) => (
              <div key={item.id} className="flex gap-2 items-start animate-fadeIn">
                <span
                  className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: FEED_DOT[item.type] }}
                />
                <div>
                  <div className="text-xs text-gray-700 leading-snug">{item.text}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 안전 효과 섹션 */}
      <div className="mt-5 bg-gradient-to-r from-[#00AAB5]/10 to-[#6366f1]/10 rounded-2xl border border-[#00AAB5]/20 p-4 sm:p-5">
        <div className="text-sm font-bold text-gray-800 mb-3">AI 모니터링 도입 시 예상 효과</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">인적 오류 감소율 목표</div>
            <div className="text-2xl font-bold text-[#00AAB5]">30%</div>
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-[#00AAB5]" style={{ width: "30%" }} />
            </div>
            <div className="text-[11px] text-gray-400 mt-1.5">
              AI 조기 개입 → 피로 누적 전 휴식·교대 유도
            </div>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">ICAO 기준 인적 오류 항공사고 기여율</div>
            <div className="text-2xl font-bold text-[#6366f1]">70–80%</div>
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-[#6366f1]" style={{ width: "75%" }} />
            </div>
            <div className="text-[11px] text-gray-400 mt-1.5">
              작업자 심리안전 관리가 항공안전의 핵심 과제
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
