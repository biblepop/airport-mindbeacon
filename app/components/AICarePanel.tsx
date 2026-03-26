"use client";

import { useEffect, useRef, useState } from "react";

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

type EventType = "관찰중" | "불안감지" | "앱푸시발송" | "케어완료" | "직원파견";

interface FeedEvent {
  id: number;
  time: string;
  gate: string;
  type: EventType;
  message: string;
}

// ── 상수 ──────────────────────────────────────────────────────
const EVENT_META: Record<EventType, { color: string; bg: string; message: string }> = {
  관찰중:     { color: "#5785C5", bg: "rgba(87,133,197,0.1)",   message: "AI 비전 분석 모니터링 중" },
  불안감지:   { color: "#F99D1B", bg: "rgba(249,157,27,0.1)",   message: "불안 행동 패턴 감지됨" },
  앱푸시발송: { color: "#00AAB5", bg: "rgba(0,170,181,0.1)",    message: "인천공항+ 앱 푸시 발송 완료" },
  케어완료:   { color: "#22c55e", bg: "rgba(34,197,94,0.1)",    message: "케어 완료 · 정상 이동 확인" },
  직원파견:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    message: "현장 직원 파견 요청" },
};

// 가중치 순서 (빈도 반영)
const EVENT_SEQUENCE: EventType[] = [
  "관찰중","관찰중","관찰중","불안감지","앱푸시발송","케어완료","관찰중","직원파견","케어완료","관찰중",
];

const PUSH_TEXTS = [
  "잠깐 쉬어가시는 건 어떨까요? 🌿",
  "출발 전 마음의 여유를 가져보세요 ✈",
  "가까운 심리안정실을 안내해 드릴게요 😊",
  "탑승까지 여유가 있어요. 편히 쉬어가세요 🛋️",
  "잠시 휴식이 도움이 될 것 같아요. 저희가 함께해요",
];

const STATUS_COLOR: Record<string, string> = { 원활:"#00AAB5", 보통:"#F99D1B", 혼잡:"#ef4444" };
const STATUS_BG:    Record<string, string> = {
  원활:"rgba(0,170,181,0.10)", 보통:"rgba(249,157,27,0.12)", 혼잡:"rgba(239,68,68,0.12)",
};

const MOCK_T1: GateItem[] = [
  { gateId:"DG1_E", waitTime:"5",  waitLength:"12" },
  { gateId:"DG2_E", waitTime:"12", waitLength:"35" },
  { gateId:"DG3_E", waitTime:"22", waitLength:"68" },
  { gateId:"DG4_W", waitTime:"3",  waitLength:"8"  },
  { gateId:"DG5_W", waitTime:"15", waitLength:"42" },
  { gateId:"DG6_W", waitTime:"7",  waitLength:"20" },
];
const MOCK_T2: GateItem[] = [
  { gateId:"DG1_E", waitTime:"6",  waitLength:"18" },
  { gateId:"DG2_E", waitTime:"14", waitLength:"44" },
  { gateId:"DG3_W", waitTime:"9",  waitLength:"25" },
  { gateId:"DG4_W", waitTime:"11", waitLength:"31" },
];

// ── 유틸 ──────────────────────────────────────────────────────
function gateStatus(waitTime?: string): "원활" | "보통" | "혼잡" {
  const t = parseInt(waitTime ?? "0", 10);
  if (t >= 20) return "혼잡";
  if (t >= 10) return "보통";
  return "원활";
}

function nowStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function makeEvent(id: number, gates: GateItem[]): FeedEvent {
  const gate = pick(gates.length > 0 ? gates : MOCK_T1);
  const type = EVENT_SEQUENCE[id % EVENT_SEQUENCE.length];
  return { id, time: nowStr(), gate: gate.gateId ?? "게이트", type, message: EVENT_META[type].message };
}

// ── 서브컴포넌트 ─────────────────────────────────────────────
function SummaryCard({ icon, label, value, unit, sub, color }: {
  icon: string; label: string; value: string | number; unit: string; sub: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full animate-blink inline-block" style={{ backgroundColor: color }} />
          LIVE
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>{value}</span>
        <span className="text-base text-gray-400 mb-0.5">{unit}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function GateBlock({ gate, isPulsing }: { gate: GateItem; isPulsing: boolean }) {
  const st = gateStatus(gate.waitTime);
  const waitLen = parseInt(gate.waitLength ?? "0", 10);
  const waitT   = parseInt(gate.waitTime   ?? "0", 10);
  return (
    <div
      className={`relative rounded-xl p-3 border transition-all duration-300 ${isPulsing ? "ring-2 ring-offset-1" : ""}`}
      style={{
        backgroundColor: STATUS_BG[st],
        borderColor: `${STATUS_COLOR[st]}40`,
        outlineColor: isPulsing ? STATUS_COLOR[st] : undefined,
      }}
    >
      {isPulsing && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full animate-ping"
          style={{ backgroundColor: STATUS_COLOR[st], opacity: 0.7 }} />
      )}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700 truncate">{gate.gateId ?? "게이트"}</span>
        <span className="text-[10px] font-bold" style={{ color: STATUS_COLOR[st] }}>{st}</span>
      </div>
      <div className="text-lg font-bold tabular-nums text-gray-800 leading-none">
        {waitLen}<span className="text-[10px] font-normal text-gray-400 ml-0.5">명</span>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">{waitT}분 대기</div>
      {st !== "원활" && (
        <div className="mt-2 text-[10px] font-medium rounded-full px-1.5 py-0.5 text-center"
          style={{ backgroundColor: `${STATUS_COLOR[st]}20`, color: STATUS_COLOR[st] }}>
          AI 모니터링 중
        </div>
      )}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function AICarePanel({ onCalmRoom }: { onCalmRoom?: () => void }) {
  const [depT1, setDepT1] = useState<GateItem[]>([]);
  const [depT2, setDepT2] = useState<GateItem[]>([]);
  const [totalPax, setTotalPax] = useState(0);
  const [feed, setFeed]   = useState<FeedEvent[]>([]);
  const [pushIdx, setPushIdx] = useState(0);
  const [pushGate, setPushGate] = useState("DG4_W");
  const idRef = useRef(0);
  const allGatesRef = useRef<GateItem[]>([]);

  // 출국장 데이터 fetch
  useEffect(() => {
    function fetchGates() {
      fetch("/api/congestion")
        .then(r => r.json())
        .then(data => {
          const t1: GateItem[] = data?.t1Items ?? [];
          const t2: GateItem[] = data?.t2Items ?? [];
          if (t1.length > 0) setDepT1(t1);
          if (t2.length > 0) setDepT2(t2);
          setTotalPax(data?.totalPax ?? 0);
        })
        .catch(() => {});
    }
    fetchGates();
    const id = setInterval(fetchGates, 60000);
    return () => clearInterval(id);
  }, []);

  const displayT1 = depT1.length > 0 ? depT1 : MOCK_T1;
  const displayT2 = depT2.length > 0 ? depT2 : MOCK_T2;
  const allGates  = [...displayT1, ...displayT2];

  // ref를 항상 최신 gates로 유지
  allGatesRef.current = allGates;

  // 초기 피드
  useEffect(() => {
    const initial = Array.from({ length: 8 }, (_, i) => makeEvent(i, allGatesRef.current));
    setFeed(initial);
    idRef.current = 8;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3초마다 이벤트 추가 (ref 사용 → 항상 현재 gates + 현재 시각)
  useEffect(() => {
    const timer = setInterval(() => {
      idRef.current += 1;
      const evt = makeEvent(idRef.current, allGatesRef.current);
      setFeed(prev => [evt, ...prev.slice(0, 11)]);
    }, 3000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3초마다 앱 푸시 메시지 업데이트 (ref 사용)
  useEffect(() => {
    const timer = setInterval(() => {
      setPushIdx(i => (i + 1) % PUSH_TEXTS.length);
      const g = pick(allGatesRef.current);
      setPushGate(g.gateId ?? "DG4_W");
    }, 3000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monitoringPax = Math.max(1, Math.round((totalPax > 0 ? totalPax : 303) * 0.003));

  return (
    <div className="flex flex-col gap-5">

      {/* ── 요약 카드 3개 ── */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          icon="👥" label="현재 모니터링 인원"
          value={(totalPax > 0 ? totalPax : 303).toLocaleString()} unit="명"
          sub="T1·T2 출국장 합산" color="#00AAB5"
        />
        <SummaryCard
          icon="🔍" label="AI 불안 감지 중"
          value={monitoringPax} unit="명"
          sub="AI 비전 0.3% 감지율" color="#5785C5"
        />
        <SummaryCard
          icon="✅" label="오늘 케어 완료"
          value={38} unit="건"
          sub="앱푸시 + 직원 케어" color="#22c55e"
        />
      </div>

      {/* ── 터미널 히트맵 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">터미널 히트맵</h3>
          <span className="text-xs text-gray-400">waitTime 기준 실시간 색상</span>
        </div>
        <p className="text-xs font-semibold text-gray-400 mb-2">T1 출국장</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {displayT1.map((g, i) => (
            <GateBlock key={`t1-${i}`} gate={g} isPulsing={gateStatus(g.waitTime) === "혼잡"} />
          ))}
        </div>
        <p className="text-xs font-semibold text-gray-400 mb-2">T2 출국장</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {displayT2.map((g, i) => (
            <GateBlock key={`t2-${i}`} gate={g} isPulsing={gateStatus(g.waitTime) === "혼잡"} />
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          {[{label:"원활 (0–9분)",color:"#00AAB5"},{label:"보통 (10–19분)",color:"#F99D1B"},{label:"혼잡 (20분+)",color:"#ef4444"}].map(l=>(
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:l.color}}/>
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 피드 + 앱 푸시 ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* 실시간 AI 개입 피드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">실시간 AI 개입 피드</h3>
            <span className="flex items-center gap-1 text-xs font-semibold" style={{color:"#00AAB5"}}>
              <span className="w-1.5 h-1.5 rounded-full animate-blink inline-block" style={{backgroundColor:"#00AAB5"}}/>
              실시간
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {feed.map(evt => (
              <div key={evt.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs tabular-nums text-gray-400 whitespace-nowrap mt-0.5 w-16 flex-shrink-0">
                  {evt.time}
                </span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0"
                  style={{ color: EVENT_META[evt.type].color, backgroundColor: EVENT_META[evt.type].bg }}
                >
                  {evt.type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700">{evt.gate}</div>
                  <div className="text-xs text-gray-400">{evt.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 앱 푸시 미리보기 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-4">인천공항+ 앱 푸시 미리보기</h3>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            {/* 알림 헤더 */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{backgroundColor:"#00AAB5"}}
              >
                AI
              </div>
              <div>
                <div className="text-xs font-bold text-gray-700">인천공항+</div>
                <div className="text-xs text-gray-400">방금 전</div>
              </div>
              <span className="ml-auto text-[10px] text-gray-400 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                {pushGate} 근처
              </span>
            </div>
            {/* 알림 본문 */}
            <div className="text-sm font-semibold text-gray-800 mb-1">
              안녕하세요, {PUSH_TEXTS[pushIdx]}
            </div>
            <div className="text-xs text-gray-500 leading-relaxed mb-3">
              인천공항 마음안정실이 가까이 있어요.<br />
              잠깐의 휴식이 여행을 더 편안하게 만들어 드려요.
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 text-xs font-semibold py-2 rounded-lg text-white transition-opacity hover:opacity-80"
                style={{backgroundColor:"#00AAB5"}}
                onClick={onCalmRoom}
              >
                안내 보기
              </button>
              <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                나중에
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            AI 감지 → 위치 기반 맞춤 메시지 · 3초마다 업데이트
          </p>
        </div>

      </div>
    </div>
  );
}
