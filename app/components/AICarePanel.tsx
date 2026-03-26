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

// 불안 감지 시뮬레이션 게이트
const ANXIETY_GATES = ["DG2_E", "DG5_W"];

// 플로어맵 게이트 레이아웃 (viewBox 0 0 640 340 기준)
const GATE_LAYOUT = [
  { id: "DG1_E", x: 20,  cx: 62,  side: "동" },
  { id: "DG2_E", x: 118, cx: 160, side: "동" },
  { id: "DG3_E", x: 216, cx: 258, side: "동" },
  { id: "DG4_W", x: 335, cx: 377, side: "서" },
  { id: "DG5_W", x: 433, cx: 475, side: "서" },
  { id: "DG6_W", x: 531, cx: 573, side: "서" },
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

/** 선택된 게이트 상세 패널 */
function GateDetailCard({ gate, onClose }: { gate: GateItem; onClose: () => void }) {
  const st = gateStatus(gate.waitTime);
  const hasAnxiety = ANXIETY_GATES.includes(gate.gateId ?? "");
  return (
    <div
      className="mt-3 rounded-xl p-4 border flex items-center gap-4"
      style={{ backgroundColor: STATUS_BG[st], borderColor: `${STATUS_COLOR[st]}40` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gray-800">{gate.gateId}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: STATUS_COLOR[st], backgroundColor: `${STATUS_COLOR[st]}20` }}>
            {st}
          </span>
          {hasAnxiety && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}>
              🔴 불안 감지 중 (시뮬레이션)
            </span>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">대기 인원 <b className="text-gray-800">{gate.waitLength ?? 0}명</b></span>
          <span className="text-gray-600">예상 대기 <b className="text-gray-800">{gate.waitTime ?? 0}분</b></span>
        </div>
        {hasAnxiety && (
          <p className="text-xs text-gray-500 mt-1.5">AI 비전 분석 → 불안 행동 패턴 감지 · 앱 푸시 발송 대기 중</p>
        )}
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
    </div>
  );
}

/** T1 터미널 SVG 플로어맵 */
function TerminalFloorMap({
  gates,
  selectedGateId,
  onSelectGate,
}: {
  gates: GateItem[];
  selectedGateId: string | null;
  onSelectGate: (gate: GateItem | null) => void;
}) {
  function getGate(id: string): GateItem {
    return gates.find(g => g.gateId === id) ?? { gateId: id, waitTime: "0", waitLength: "0" };
  }

  return (
    <svg
      viewBox="0 0 640 340"
      className="w-full"
      style={{ display: "block", maxHeight: 340 }}
      aria-label="T1 터미널 플로어맵"
    >
      {/* 배경 */}
      <rect x="0" y="0" width="640" height="340" fill="#f8fafc" rx="8" />

      {/* 구역 레이블 */}
      <text x="160" y="12" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600" fontFamily="system-ui,sans-serif">
        동측 게이트 (EAST)
      </text>
      <text x="476" y="12" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600" fontFamily="system-ui,sans-serif">
        서측 게이트 (WEST)
      </text>
      {/* 동/서 구분선 */}
      <line x1="305" y1="15" x2="305" y2="88" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />

      {/* 탑승교 (jetway) 커넥터 */}
      {GATE_LAYOUT.map(gl => (
        <rect key={`jw-${gl.id}`} x={gl.cx - 10} y={67} width={20} height={21} fill="#e2e8f0" rx="3" />
      ))}

      {/* 메인 터미널 건물 */}
      <rect x="5" y="85" width="630" height="250" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />

      {/* 면세구역 통로 */}
      <rect x="12" y="92" width="616" height="108" rx="6"
        fill="rgba(0,170,181,0.04)" stroke="rgba(0,170,181,0.25)" strokeWidth="1" strokeDasharray="5,3" />
      <text x="108" y="117" textAnchor="middle" fontSize="9.5" fill="#00AAB5" fontWeight="700" fontFamily="system-ui,sans-serif" opacity="0.7">
        면세구역
      </text>
      <text x="108" y="130" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui,sans-serif">
        Duty-Free
      </text>
      <text x="530" y="117" textAnchor="middle" fontSize="9.5" fill="#00AAB5" fontWeight="700" fontFamily="system-ui,sans-serif" opacity="0.7">
        면세구역
      </text>
      <text x="530" y="130" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui,sans-serif">
        Duty-Free
      </text>

      {/* 심리안정실 마커 */}
      <circle cx="320" cy="148" r="18" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" />
      <text x="320" y="153" textAnchor="middle" fontSize="14" fontFamily="system-ui,sans-serif">🧘</text>
      <text x="320" y="168" textAnchor="middle" fontSize="8" fill="#16a34a" fontWeight="700" fontFamily="system-ui,sans-serif">
        심리안정실
      </text>

      {/* 구역 구분선 */}
      <line x1="18" y1="203" x2="622" y2="203" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="6,4" />

      {/* 보안검색대 영역 */}
      <text x="320" y="223" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600" fontFamily="system-ui,sans-serif">
        보안검색대
      </text>
      {/* 보안 레인 6개 */}
      {[30, 125, 220, 315, 410, 505].map((lx, i) => (
        <g key={`lane-${i}`}>
          <rect x={lx} y="231" width="75" height="88" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
          {[0,1,2,3].map(li => (
            <line key={li} x1={lx+13+li*13} y1="238" x2={lx+13+li*13} y2="310" stroke="#e5e7eb" strokeWidth="0.8" />
          ))}
          <rect x={lx+8} y="237" width="59" height="8" rx="2" fill="#e2e8f0" />
          <text x={lx+37} y="327" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="system-ui,sans-serif">
            레인{i+1}
          </text>
        </g>
      ))}

      {/* 게이트 블록 */}
      {GATE_LAYOUT.map(gl => {
        const gate = getGate(gl.id);
        const st = gateStatus(gate.waitTime);
        const color = STATUS_COLOR[st];
        const bg = STATUS_BG[st];
        const isSelected = selectedGateId === gl.id;
        const isCongested = st === "혼잡";
        const hasAnxiety = ANXIETY_GATES.includes(gl.id);

        return (
          <g key={gl.id} style={{ cursor: "pointer" }} onClick={() => onSelectGate(isSelected ? null : gate)}>
            {/* 혼잡 게이트 pulse 링 */}
            {isCongested && (
              <circle cx={gl.cx} cy={40} r="36" fill={color} opacity="0">
                <animate attributeName="r" from="36" to="52" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.2" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* 선택 강조 테두리 */}
            {isSelected && (
              <rect x={gl.x - 3} y="12" width="90" height="57" rx="8"
                fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" />
            )}

            {/* 게이트 사각형 */}
            <rect x={gl.x} y="15" width="84" height="52" rx="6"
              fill={bg}
              stroke={isSelected ? color : `${color}80`}
              strokeWidth={isSelected ? 2 : 1.5}
            />

            {/* 게이트 ID */}
            <text x={gl.cx} y="30" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="system-ui,sans-serif">
              {gl.id}
            </text>
            {/* 대기 인원 */}
            <text x={gl.cx} y="47" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1f2937" fontFamily="system-ui,sans-serif">
              {gate.waitLength ?? "0"}
            </text>
            {/* 단위 + 대기시간 */}
            <text x={gl.cx} y="61" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui,sans-serif">
              명 · {gate.waitTime ?? "0"}분
            </text>

            {/* 불안 감지 마커 (시뮬레이션) */}
            {hasAnxiety && (
              <g>
                {/* 확장 링 */}
                <circle cx={gl.x + 78} cy={20} r="4" fill="#ef4444" opacity="0">
                  <animate attributeName="r" from="4" to="11" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.65" to="0" dur="1.2s" repeatCount="indefinite" />
                </circle>
                {/* 중심 점 */}
                <circle cx={gl.x + 78} cy={20} r="4" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        );
      })}

      {/* 범례 */}
      {[
        { label: "원활", color: "#00AAB5", x: 20 },
        { label: "보통", color: "#F99D1B", x: 72 },
        { label: "혼잡", color: "#ef4444", x: 124 },
      ].map(l => (
        <g key={l.label}>
          <rect x={l.x} y="325" width="8" height="8" rx="2" fill={l.color} />
          <text x={l.x + 11} y="333" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">{l.label}</text>
        </g>
      ))}
      <circle cx="200" cy="329" r="4" fill="#ef4444">
        <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <text x="208" y="333" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">불안감지(시뮬)</text>
      <circle cx="282" cy="329" r="5" fill="rgba(34,197,94,0.3)" stroke="rgba(34,197,94,0.7)" strokeWidth="1" />
      <text x="280" y="329" textAnchor="middle" fontSize="7" fontFamily="system-ui,sans-serif">🧘</text>
      <text x="292" y="333" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">심리안정실</text>
    </svg>
  );
}

/** 기존 카드형 히트맵 게이트 블록 */
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
  const [totalPax, setTotalPax] = useState(0);
  const [feed, setFeed]   = useState<FeedEvent[]>([]);
  const [pushIdx, setPushIdx] = useState(0);
  const [pushGate, setPushGate] = useState("DG4_W");
  const [selectedGate, setSelectedGate] = useState<GateItem | null>(null);
  const idRef = useRef(0);
  const allGatesRef = useRef<GateItem[]>([]);

  useEffect(() => {
    function fetchGates() {
      fetch("/api/congestion")
        .then(r => r.json())
        .then(data => {
          const t1: GateItem[] = data?.t1Items ?? [];
          if (t1.length > 0) setDepT1(t1);
          setTotalPax(data?.totalPax ?? 0);
        })
        .catch(() => {});
    }
    fetchGates();
    const id = setInterval(fetchGates, 60000);
    return () => clearInterval(id);
  }, []);

  const displayT1 = depT1.length > 0 ? depT1 : MOCK_T1;
  allGatesRef.current = displayT1;

  useEffect(() => {
    const initial = Array.from({ length: 8 }, (_, i) => makeEvent(i, allGatesRef.current));
    setFeed(initial);
    idRef.current = 8;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      idRef.current += 1;
      const evt = makeEvent(idRef.current, allGatesRef.current);
      setFeed(prev => [evt, ...prev.slice(0, 11)]);
    }, 3000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {/* ── T1 터미널 플로어맵 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800">T1 터미널 플로어맵</h3>
            <p className="text-xs text-gray-400 mt-0.5">출국장 도면 · 게이트 클릭 시 상세 정보</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#ef4444" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ backgroundColor: "#ef4444" }} />
              불안 감지 {ANXIETY_GATES.length}건
            </span>
            <span className="text-xs text-gray-400">시뮬레이션</span>
          </div>
        </div>
        <TerminalFloorMap
          gates={displayT1}
          selectedGateId={selectedGate?.gateId ?? null}
          onSelectGate={setSelectedGate}
        />
        {selectedGate && (
          <GateDetailCard gate={selectedGate} onClose={() => setSelectedGate(null)} />
        )}
      </div>

      {/* ── 터미널 히트맵 (지도 아래로 이동) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">터미널 히트맵</h3>
          <span className="text-xs text-gray-400">waitTime 기준 실시간 색상</span>
        </div>
        <p className="text-xs font-semibold text-gray-400 mb-2">T1 출국장 (실시간 API)</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {displayT1.map((g, i) => (
            <GateBlock key={`t1-${i}`} gate={g} isPulsing={gateStatus(g.waitTime) === "혼잡"} />
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
