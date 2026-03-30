"use client";

import { useEffect, useRef, useState } from "react";

interface GateItem {
  gateId?: string;
  terminalId?: string;
  waitTime?: string;
  waitLength?: string;
}

type EventType = "관찰중" | "불안감지" | "앱푸시발송" | "직원파견" | "케어중" | "케어완료";
type StaffStatus = "대기중" | "이동중" | "케어중";

interface FeedEvent {
  id: number;
  time: string;
  gate: string;
  type: EventType;
  message: string;
  subMessage?: string; // 파견 요청 2행 메시지
}

interface Staff {
  id: number;
  x: number;        // SVG 좌표 (0–640)
  y: number;        // SVG 좌표 (0–358)
  status: StaffStatus;
  location: string;
  targetGate?: string;
}

// ── 상수 ──────────────────────────────────────────────────────
const EVENT_META: Record<EventType, { color: string; bg: string }> = {
  관찰중:     { color: "#5785C5", bg: "rgba(87,133,197,0.1)"  },
  불안감지:   { color: "#F99D1B", bg: "rgba(249,157,27,0.1)"  },
  앱푸시발송: { color: "#00AAB5", bg: "rgba(0,170,181,0.1)"   },
  직원파견:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  케어중:     { color: "#9333ea", bg: "rgba(147,51,234,0.1)"  },
  케어완료:   { color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
};

const STAFF_EMOJI: Record<StaffStatus, string> = {
  대기중: "👮",
  이동중: "🚶",
  케어중: "🤝",
};

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

const STAFF_COLOR: Record<StaffStatus, string> = {
  대기중: "#22c55e",
  이동중: "#F99D1B",
  케어중: "#ef4444",
};

const MOCK_T1: GateItem[] = [
  { gateId:"DG1_E", waitTime:"5",  waitLength:"12" },
  { gateId:"DG2_E", waitTime:"12", waitLength:"35" },
  { gateId:"DG3_E", waitTime:"22", waitLength:"68" },
  { gateId:"DG4_W", waitTime:"3",  waitLength:"8"  },
  { gateId:"DG5_W", waitTime:"15", waitLength:"42" },
  { gateId:"DG6_W", waitTime:"7",  waitLength:"20" },
];

const ANXIETY_GATES = ["DG2_E", "DG5_W"];
const ALL_GATE_IDS  = ["DG1_E","DG2_E","DG3_E","DG4_W","DG5_W","DG6_W"];

const GATE_LAYOUT = [
  { id:"DG1_E", x:20,  cx:62  },
  { id:"DG2_E", x:118, cx:160 },
  { id:"DG3_E", x:216, cx:258 },
  { id:"DG4_W", x:335, cx:377 },
  { id:"DG5_W", x:433, cx:475 },
  { id:"DG6_W", x:531, cx:573 },
];

// SVG 640×358 기준 게이트 진입 좌표
const GATE_ENTRY: Record<string, { x: number; y: number }> = {
  DG1_E:{ x:62,  y:110 }, DG2_E:{ x:160, y:110 }, DG3_E:{ x:258, y:110 },
  DG4_W:{ x:377, y:110 }, DG5_W:{ x:475, y:110 }, DG6_W:{ x:573, y:110 },
};

const PATROLS = [
  { x:80,  y:140, loc:"DG1_E 구역" },
  { x:190, y:168, loc:"면세구역 서측" },
  { x:265, y:148, loc:"면세구역 중앙" },
  { x:370, y:155, loc:"심리안정실 근처" },
  { x:435, y:168, loc:"면세구역 동측" },
  { x:558, y:138, loc:"DG6_W 구역" },
  { x:148, y:258, loc:"보안검색대 서측" },
  { x:320, y:268, loc:"보안검색대 중앙" },
  { x:492, y:258, loc:"보안검색대 동측" },
];

const INITIAL_STAFF: Staff[] = [
  { id:1, x:80,  y:140, status:"대기중", location:"DG1_E 구역" },
  { id:2, x:190, y:168, status:"대기중", location:"면세구역 서측" },
  { id:3, x:370, y:155, status:"대기중", location:"심리안정실 근처" },
  { id:4, x:558, y:138, status:"대기중", location:"DG6_W 구역" },
  { id:5, x:320, y:268, status:"대기중", location:"보안검색대 중앙" },
];

// SVG 크기 상수 (비율 계산용)
const SVG_W = 640, SVG_H = 358;

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

// ── T1 터미널 SVG 플로어맵 + 직원 HTML 오버레이 ───────────────
// SVG 내부에서 hooks를 가진 컴포넌트를 렌더링하면 브라우저에 따라
// 아이콘이 보이지 않을 수 있으므로, 직원은 HTML position:absolute로 렌더링
function TerminalFloorMap({
  gates, selectedGateId, onSelectGate,
  staffList, selectedStaffId, onSelectStaff,
}: {
  gates: GateItem[];
  selectedGateId: string | null;
  onSelectGate: (gate: GateItem | null) => void;
  staffList: Staff[];
  selectedStaffId: number | null;
  onSelectStaff: (id: number | null) => void;
}) {
  function getGate(id: string): GateItem {
    return gates.find(g => g.gateId === id) ?? { gateId:id, waitTime:"0", waitLength:"0" };
  }

  return (
    <div style={{ position: "relative" }}>
      {/* ── SVG 도면 (직원 마커 제외) ── */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ display:"block", maxHeight:SVG_H }}
        aria-label="T1 터미널 플로어맵">
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#f8fafc" rx="8" />

        {/* 구역 레이블 */}
        <text x="160" y="12" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600" fontFamily="system-ui,sans-serif">동측 게이트 (EAST)</text>
        <text x="476" y="12" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600" fontFamily="system-ui,sans-serif">서측 게이트 (WEST)</text>
        <line x1="305" y1="15" x2="305" y2="88" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,3" />

        {/* 탑승교 */}
        {GATE_LAYOUT.map(gl => (
          <rect key={`jw-${gl.id}`} x={gl.cx-10} y={67} width={20} height={21} fill="#e2e8f0" rx="3" />
        ))}

        {/* 터미널 건물 */}
        <rect x="5" y="85" width="630" height="253" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />

        {/* 면세구역 */}
        <rect x="12" y="92" width="616" height="108" rx="6" fill="rgba(0,170,181,0.04)" stroke="rgba(0,170,181,0.25)" strokeWidth="1" strokeDasharray="5,3" />
        <text x="108" y="117" textAnchor="middle" fontSize="9.5" fill="#00AAB5" fontWeight="700" fontFamily="system-ui,sans-serif" opacity="0.7">면세구역</text>
        <text x="108" y="130" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui,sans-serif">Duty-Free</text>
        <text x="530" y="117" textAnchor="middle" fontSize="9.5" fill="#00AAB5" fontWeight="700" fontFamily="system-ui,sans-serif" opacity="0.7">면세구역</text>
        <text x="530" y="130" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui,sans-serif">Duty-Free</text>

        {/* 심리안정실 */}
        <circle cx="320" cy="148" r="18" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" />
        <text x="320" y="153" textAnchor="middle" fontSize="14" fontFamily="system-ui,sans-serif">🧘</text>
        <text x="320" y="170" textAnchor="middle" fontSize="8" fill="#16a34a" fontWeight="700" fontFamily="system-ui,sans-serif">심리안정실</text>

        {/* 구역 구분선 */}
        <line x1="18" y1="203" x2="622" y2="203" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="6,4" />

        {/* 보안검색대 */}
        <text x="320" y="223" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600" fontFamily="system-ui,sans-serif">보안검색대</text>
        {[30,125,220,315,410,505].map((lx,i) => (
          <g key={`lane-${i}`}>
            <rect x={lx} y="231" width="75" height="88" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
            {[0,1,2,3].map(li => (
              <line key={li} x1={lx+13+li*13} y1="238" x2={lx+13+li*13} y2="310" stroke="#e5e7eb" strokeWidth="0.8" />
            ))}
            <rect x={lx+8} y="237" width="59" height="8" rx="2" fill="#e2e8f0" />
            <text x={lx+37} y="328" textAnchor="middle" fontSize="7" fill="#9ca3af" fontFamily="system-ui,sans-serif">레인{i+1}</text>
          </g>
        ))}

        {/* 게이트 블록 */}
        {GATE_LAYOUT.map(gl => {
          const gate = getGate(gl.id);
          const st = gateStatus(gate.waitTime);
          const color = STATUS_COLOR[st];
          const bg = STATUS_BG[st];
          const isSel = selectedGateId === gl.id;
          const isCongested = st === "혼잡";
          const hasAnxiety = ANXIETY_GATES.includes(gl.id);
          return (
            <g key={gl.id} style={{ cursor:"pointer" }} onClick={() => onSelectGate(isSel ? null : gate)}>
              {isCongested && (
                <circle cx={gl.cx} cy={40} r="36" fill={color} opacity="0">
                  <animate attributeName="r" from="36" to="52" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.2" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {isSel && <rect x={gl.x-3} y="12" width="90" height="57" rx="8" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" />}
              <rect x={gl.x} y="15" width="84" height="52" rx="6" fill={bg} stroke={isSel ? color : `${color}80`} strokeWidth={isSel ? 2 : 1.5} />
              <text x={gl.cx} y="30" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="system-ui,sans-serif">{gl.id}</text>
              <text x={gl.cx} y="47" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1f2937" fontFamily="system-ui,sans-serif">{gate.waitLength ?? "0"}</text>
              <text x={gl.cx} y="61" textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="system-ui,sans-serif">명 · {gate.waitTime ?? "0"}분</text>
              {hasAnxiety && (
                <g>
                  <circle cx={gl.x+78} cy={20} r="4" fill="#ef4444" opacity="0">
                    <animate attributeName="r" from="4" to="11" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.65" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={gl.x+78} cy={20} r="4" fill="#ef4444">
                    <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}
            </g>
          );
        })}

        {/* 범례 행 1 */}
        {[{label:"원활",color:"#00AAB5",x:20},{label:"보통",color:"#F99D1B",x:72},{label:"혼잡",color:"#ef4444",x:124}].map(l => (
          <g key={l.label}>
            <rect x={l.x} y="335" width="8" height="8" rx="2" fill={l.color} />
            <text x={l.x+11} y="343" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">{l.label}</text>
          </g>
        ))}
        <circle cx="202" cy="339" r="4" fill="#ef4444">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <text x="210" y="343" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">불안감지</text>
        <circle cx="272" cy="339" r="5" fill="rgba(34,197,94,0.25)" stroke="rgba(34,197,94,0.6)" strokeWidth="1" />
        <text x="272" y="339" textAnchor="middle" fontSize="7" fontFamily="system-ui,sans-serif">🧘</text>
        <text x="282" y="343" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">심리안정실</text>

        {/* 범례 행 2: 직원 */}
        <text x="20" y="356" fontSize="8" fill="#9ca3af" fontFamily="system-ui,sans-serif">직원:</text>
        {[{label:"대기중",color:"#22c55e",x:48},{label:"이동중",color:"#F99D1B",x:102},{label:"케어중",color:"#ef4444",x:156}].map(l => (
          <g key={`sl-${l.label}`}>
            <circle cx={l.x+4} cy="352" r="4.5" fill={l.color} />
            <text x={l.x+12} y="356" fontSize="8" fill="#6b7280" fontFamily="system-ui,sans-serif">{l.label}</text>
          </g>
        ))}
      </svg>

      {/* ── 직원 HTML 오버레이 ──
          SVG 좌표를 %(비율)로 변환 → position:absolute로 렌더링
          CSS transition(left/top)으로 이동 애니메이션 처리
          이 방식은 viewBox 스케일과 무관하게 정확한 위치 보장 */}
      {staffList.map(staff => {
        const color = STAFF_COLOR[staff.status];
        const emoji = STAFF_EMOJI[staff.status];
        const isSel = selectedStaffId === staff.id;
        const leftPct = (staff.x / SVG_W) * 100;
        const topPct  = (staff.y / SVG_H) * 100;
        const moveDur = staff.status === "이동중" ? "4s" : "1.2s";

        return (
          <div
            key={`staff-${staff.id}`}
            style={{
              position: "absolute",
              left: `${leftPct}%`,
              top:  `${topPct}%`,
              transform: "translate(-50%, -50%)",
              // left/top transition → CSS percent는 viewBox 스케일과 동일하게 동작
              transition: `left ${moveDur} ease-in-out, top ${moveDur} ease-in-out`,
              zIndex: 20,
              cursor: "pointer",
              userSelect: "none",
              textAlign: "center",
            }}
            onClick={(e) => { e.stopPropagation(); onSelectStaff(isSel ? null : staff.id); }}
          >
            {/* 이동중 ping 링 */}
            {staff.status === "이동중" && (
              <span
                className="animate-ping"
                style={{
                  position: "absolute",
                  top: "50%", left: "50%",
                  width: 36, height: 36,
                  borderRadius: "50%",
                  backgroundColor: color,
                  opacity: 0.35,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* 메인 원형 아이콘 */}
            <div style={{
              width: 34, height: 34,
              borderRadius: "50%",
              backgroundColor: color,
              border: isSel ? `3px solid white` : "2.5px solid white",
              boxShadow: isSel
                ? `0 0 0 3px ${color}70, 0 4px 12px rgba(0,0,0,0.35)`
                : "0 2px 6px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}>
              {emoji}
            </div>

            {/* 이름 라벨 */}
            <div style={{
              fontSize: 9, fontWeight: 700,
              color,
              marginTop: 2,
              lineHeight: 1,
              textShadow: "0 0 4px white, 0 0 4px white, 0 0 4px white",
              whiteSpace: "nowrap",
            }}>
              직원{staff.id}
            </div>

            {/* 선택 시 툴팁 */}
            {isSel && (
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(17,24,39,0.95)",
                color: "white",
                padding: "5px 10px",
                borderRadius: 7,
                fontSize: 11,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                zIndex: 30,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  직원 {staff.id} · {staff.status}
                </div>
                <div style={{ color:"#94a3b8", fontSize:10 }}>
                  {staff.location}
                </div>
                {/* 툴팁 꼬리 */}
                <div style={{
                  position:"absolute", top:"100%", left:"50%",
                  transform:"translateX(-50%)",
                  width:0, height:0,
                  borderLeft:"5px solid transparent",
                  borderRight:"5px solid transparent",
                  borderTop:"5px solid rgba(17,24,39,0.95)",
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 게이트 상세 패널 ──────────────────────────────────────────
function GateDetailCard({ gate, onClose }: { gate: GateItem; onClose: () => void }) {
  const st = gateStatus(gate.waitTime);
  const hasAnxiety = ANXIETY_GATES.includes(gate.gateId ?? "");
  return (
    <div className="mt-3 rounded-xl p-4 border flex items-center gap-4"
      style={{ backgroundColor:STATUS_BG[st], borderColor:`${STATUS_COLOR[st]}40` }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gray-800">{gate.gateId}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color:STATUS_COLOR[st], backgroundColor:`${STATUS_COLOR[st]}20` }}>{st}</span>
          {hasAnxiety && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color:"#ef4444", backgroundColor:"rgba(239,68,68,0.1)" }}>🔴 불안 감지 (시뮬)</span>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">대기 인원 <b className="text-gray-800">{gate.waitLength ?? 0}명</b></span>
          <span className="text-gray-600">예상 대기 <b className="text-gray-800">{gate.waitTime ?? 0}분</b></span>
        </div>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
    </div>
  );
}

// ── 카드형 히트맵 블록 ────────────────────────────────────────
function GateBlock({ gate, isPulsing }: { gate: GateItem; isPulsing: boolean }) {
  const st = gateStatus(gate.waitTime);
  return (
    <div className={`relative rounded-xl p-3 border ${isPulsing ? "ring-2 ring-offset-1" : ""}`}
      style={{ backgroundColor:STATUS_BG[st], borderColor:`${STATUS_COLOR[st]}40` }}>
      {isPulsing && (
        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full animate-ping"
          style={{ backgroundColor:STATUS_COLOR[st], opacity:0.7 }} />
      )}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700 truncate">{gate.gateId ?? "게이트"}</span>
        <span className="text-[10px] font-bold" style={{ color:STATUS_COLOR[st] }}>{st}</span>
      </div>
      <div className="text-lg font-bold tabular-nums text-gray-800 leading-none">
        {parseInt(gate.waitLength ?? "0",10)}<span className="text-[10px] font-normal text-gray-400 ml-0.5">명</span>
      </div>
      <div className="text-[10px] text-gray-400 mt-1">{parseInt(gate.waitTime ?? "0",10)}분 대기</div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function AICarePanel({ onCalmRoom }: { onCalmRoom?: () => void }) {
  const [depT1, setDepT1] = useState<GateItem[]>([]);
  const [totalPax, setTotalPax] = useState(0);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [pushIdx, setPushIdx] = useState(0);
  const [pushGate, setPushGate] = useState("DG4_W");
  const [selectedGate, setSelectedGate] = useState<GateItem | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  // 직원용 알림: 최근 파견 정보
  const [pushMode, setPushMode] = useState<"여객" | "직원">("여객");
  const [lastDispatch, setLastDispatch] = useState<{ staffId: number; gateId: string } | null>(null);

  const idRef = useRef(0);
  const gateIdxRef = useRef(0);
  const allGatesRef = useRef<GateItem[]>([]);
  const staffRef = useRef<Staff[]>(INITIAL_STAFF);
  staffRef.current = staffList;

  // ── 피드 이벤트 추가 ─────────────────────────────────────
  const addFeedEventRef = useRef<(type: EventType, gate: string, msg: string, sub?: string) => void>(() => {});
  const addFeedEvent = (type: EventType, gate: string, msg: string, sub?: string) => {
    idRef.current += 1;
    setFeed(prev => [{ id: idRef.current, time: nowStr(), gate, type, message: msg, subMessage: sub }, ...prev.slice(0, 14)]);
  };
  addFeedEventRef.current = addFeedEvent;

  // ── 직원 파견 (가장 가까운 대기중 직원) ───────────────────
  const dispatchRef = useRef<(gateId: string) => number | null>(() => null);
  const dispatchNearestStaff = (gateId: string): number | null => {
    const target = GATE_ENTRY[gateId];
    if (!target) return null;
    const cur = staffRef.current;
    let nearestIdx = -1, minD = Infinity;
    cur.forEach((s, i) => {
      if (s.status === "대기중") {
        const d = Math.hypot(s.x - target.x, s.y - target.y);
        if (d < minD) { minD = d; nearestIdx = i; }
      }
    });
    if (nearestIdx < 0) return null;
    const sid = cur[nearestIdx].id;
    setStaffList(prev => prev.map(s =>
      s.id === sid
        ? { ...s, x: target.x, y: target.y, status:"이동중", location:`${gateId}로 이동 중`, targetGate: gateId }
        : s
    ));
    return sid;
  };
  dispatchRef.current = dispatchNearestStaff;

  // ── 인시던트 시퀀스: 관찰중 → 불안감지 → 앱푸시 → 직원파견 → 케어중 → 케어완료
  const triggerRef = useRef<(gateId: string) => void>(() => {});
  const triggerIncident = (gateId: string) => {
    const ae = addFeedEventRef.current;
    const dp = dispatchRef.current;

    ae("불안감지", gateId, "불안 행동 패턴 감지됨");

    setTimeout(() => {
      ae("앱푸시발송", gateId, "인천공항+ 앱 푸시 발송 완료");

      setTimeout(() => {
        const sid = dp(gateId);
        if (sid === null) return;

        // 파견 요청 피드: 2행 메시지
        ae(
          "직원파견", gateId,
          `⚡ [파견요청] 직원${sid}님 → ${gateId} 즉시 이동 요청`,
          `불안 징후 여객 1명 케어 필요`
        );
        // 직원용 앱 알림 상태 업데이트
        setLastDispatch({ staffId: sid, gateId });
        setPushMode("직원");

        // 6초 후: 직원 도착 → 케어중
        setTimeout(() => {
          setStaffList(prev => prev.map(s =>
            s.id === sid && s.status === "이동중"
              ? { ...s, status:"케어중", location:`${gateId} 케어 중` }
              : s
          ));
          ae("케어중", gateId, `직원${sid} ${gateId} 케어 중`);

          // 10초 후: 케어완료 → 대기중 복귀
          setTimeout(() => {
            const p = PATROLS[Math.floor(Math.random() * PATROLS.length)];
            setStaffList(prev => prev.map(s =>
              s.id === sid && s.status === "케어중"
                ? { ...s, x: p.x, y: p.y, status:"대기중", location: p.loc, targetGate: undefined }
                : s
            ));
            ae("케어완료", gateId, "케어 완료 · 정상 이동 확인");
            // 여객 알림으로 복귀
            setPushMode("여객");
          }, 10000);
        }, 6000);
      }, 3000);
    }, 3000);
  };
  triggerRef.current = triggerIncident;

  // ── 출국장 데이터 fetch ────────────────────────────────────
  useEffect(() => {
    function fetchGates() {
      fetch("/api/congestion").then(r => r.json()).then(data => {
        const t1: GateItem[] = data?.t1Items ?? [];
        if (t1.length > 0) setDepT1(t1);
        setTotalPax(data?.totalPax ?? 0);
      }).catch(() => {});
    }
    fetchGates();
    const id = setInterval(fetchGates, 60000);
    return () => clearInterval(id);
  }, []);

  const displayT1 = depT1.length > 0 ? depT1 : MOCK_T1;
  allGatesRef.current = displayT1;

  // ── 초기 피드 ────────────────────────────────────────────
  useEffect(() => {
    const initial: FeedEvent[] = ALL_GATE_IDS.map((id, i) => ({
      id: i, time: nowStr(), gate: id,
      type: "관찰중", message: "AI 비전 분석 모니터링 중",
    }));
    setFeed(initial);
    idRef.current = ALL_GATE_IDS.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 관찰중 ticker: 4초 주기 게이트 순환 ───────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const gates = allGatesRef.current.length > 0 ? allGatesRef.current : MOCK_T1;
      const gate = gates[gateIdxRef.current % gates.length];
      gateIdxRef.current++;
      addFeedEventRef.current("관찰중", gate.gateId ?? "게이트", "AI 비전 분석 모니터링 중");
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ── 인시던트 트리거: 초기 6초 후 1회 + 35초 주기 ─────────
  useEffect(() => {
    const first = setTimeout(() => triggerRef.current(pick(ANXIETY_GATES)), 6000);
    const recurring = setInterval(() => {
      triggerRef.current(ALL_GATE_IDS[Math.floor(Math.random() * ALL_GATE_IDS.length)]);
    }, 35000);
    return () => { clearTimeout(first); clearInterval(recurring); };
  }, []);

  // ── 30초마다 대기중 직원 순찰 이동 ───────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setStaffList(prev => prev.map(s => {
        if (s.status !== "대기중") return s;
        const p = PATROLS[Math.floor(Math.random() * PATROLS.length)];
        return { ...s, x: p.x, y: p.y, location: p.loc };
      }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ── 앱 푸시 업데이트 ──────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setPushIdx(i => (i + 1) % PUSH_TEXTS.length);
      const gates = allGatesRef.current.length > 0 ? allGatesRef.current : MOCK_T1;
      setPushGate(pick(gates).gateId ?? "DG4_W");
    }, 3000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monitoringPax = Math.max(1, Math.round((totalPax > 0 ? totalPax : 303) * 0.003));
  const staffOnDuty   = staffList.filter(s => s.status !== "대기중").length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── 요약 카드 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { icon:"👥", label:"현재 모니터링 인원", value:(totalPax > 0 ? totalPax : 303).toLocaleString(), unit:"명", sub:"T1·T2 출국장 합산", color:"#00AAB5" },
          { icon:"🔍", label:"AI 불안 감지 중",    value:monitoringPax, unit:"명",                        sub:"AI 비전 0.3% 감지율", color:"#5785C5" },
          { icon:"👮", label:"직원 현황",           value:`${staffOnDuty} / ${staffList.length}`, unit:"명", sub:"케어·이동 중", color:"#F99D1B" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex sm:block items-center gap-3">
            <div className="hidden sm:flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color:c.color }}>
                <span className="w-1.5 h-1.5 rounded-full animate-blink inline-block" style={{ backgroundColor:c.color }} />LIVE
              </span>
            </div>
            <span className="sm:hidden text-2xl flex-shrink-0">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 mb-1 leading-tight">{c.label}</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color:c.color }}>{c.value}</span>
                <span className="text-sm sm:text-base text-gray-400 mb-0.5">{c.unit}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── T1 터미널 플로어맵 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <div className="flex items-start sm:items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">T1 터미널 플로어맵</h3>
            <p className="text-xs text-gray-400 mt-0.5">게이트/직원 클릭 → 상세 · AI 피드 연동</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1">
              {staffList.map(s => (
                <span key={s.id}
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-500"
                  style={{ backgroundColor: STAFF_COLOR[s.status] }}
                  title={`직원${s.id} ${s.status}`} />
              ))}
              <span className="text-xs text-gray-400 ml-0.5">직원 5명</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color:"#ef4444" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ backgroundColor:"#ef4444" }} />
              불안 {ANXIETY_GATES.length}건
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 340 }}>
            <TerminalFloorMap
              gates={displayT1}
              selectedGateId={selectedGate?.gateId ?? null}
              onSelectGate={(g) => { setSelectedGate(g); setSelectedStaffId(null); }}
              staffList={staffList}
              selectedStaffId={selectedStaffId}
              onSelectStaff={(id) => { setSelectedStaffId(id); setSelectedGate(null); }}
            />
          </div>
        </div>
        {selectedGate && <GateDetailCard gate={selectedGate} onClose={() => setSelectedGate(null)} />}
      </div>

      {/* ── 터미널 히트맵 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">터미널 히트맵</h3>
          <span className="text-xs text-gray-400">waitTime 기준 실시간</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {displayT1.map((g, i) => (
            <GateBlock key={`t1-${i}`} gate={g} isPulsing={gateStatus(g.waitTime) === "혼잡"} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-xs text-gray-500">
          {[{label:"원활 (0–9분)",color:"#00AAB5"},{label:"보통 (10–19분)",color:"#F99D1B"},{label:"혼잡 (20분+)",color:"#ef4444"}].map(l=>(
            <span key={l.label} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{background:l.color}}/>{l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 피드 + 앱 푸시 ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* 실시간 AI 개입 피드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">실시간 AI 개입 피드</h3>
              <p className="text-xs text-gray-400 mt-0.5">관찰중 → 불안감지 → 직원파견 → 케어완료</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold" style={{color:"#00AAB5"}}>
              <span className="w-1.5 h-1.5 rounded-full animate-blink inline-block" style={{backgroundColor:"#00AAB5"}}/>실시간
            </span>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {feed.map(evt => (
              <div key={evt.id} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs tabular-nums text-gray-400 whitespace-nowrap mt-0.5 w-16 flex-shrink-0">{evt.time}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0"
                  style={{ color: EVENT_META[evt.type].color, backgroundColor: EVENT_META[evt.type].bg }}>
                  {evt.type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700">{evt.gate}</span>
                    <span className="text-xs text-gray-500">{evt.message}</span>
                  </div>
                  {evt.subMessage && (
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                      {evt.subMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 앱 푸시 미리보기: 여객용 / 직원용 탭 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">인천공항+ 앱 푸시 미리보기</h3>
            {/* 여객/직원 토글 */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["여객","직원"] as const).map(mode => (
                <button key={mode}
                  onClick={() => setPushMode(mode)}
                  className="text-xs font-semibold px-3 py-1 rounded-md transition-colors"
                  style={{
                    backgroundColor: pushMode === mode ? "#00AAB5" : "transparent",
                    color: pushMode === mode ? "white" : "#6b7280",
                  }}>
                  {mode === "여객" ? "👤 여객용" : "👮 직원용"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            {pushMode === "여객" ? (
              /* 여객용 알림 */
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{backgroundColor:"#00AAB5"}}>AI</div>
                  <div>
                    <div className="text-xs font-bold text-gray-700">인천공항+</div>
                    <div className="text-xs text-gray-400">방금 전</div>
                  </div>
                  <span className="ml-auto text-[10px] text-gray-400 bg-white rounded-full px-2 py-0.5 border border-gray-200">
                    {pushGate} 근처
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">안녕하세요, {PUSH_TEXTS[pushIdx]}</div>
                <div className="text-xs text-gray-500 leading-relaxed mb-3">
                  인천공항 마음안정실이 가까이 있어요.<br/>잠깐의 휴식이 여행을 더 편안하게 만들어 드려요.
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs font-semibold py-2 rounded-lg text-white transition-opacity hover:opacity-80"
                    style={{backgroundColor:"#00AAB5"}} onClick={onCalmRoom}>안내 보기</button>
                  <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">나중에</button>
                </div>
              </>
            ) : (
              /* 직원용 알림 */
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{backgroundColor:"#ef4444"}}>⚡</div>
                  <div>
                    <div className="text-xs font-bold text-gray-700">직원 케어 요청</div>
                    <div className="text-xs text-gray-400">
                      {lastDispatch ? `직원 ${lastDispatch.staffId}` : "케어팀"}
                    </div>
                  </div>
                  {lastDispatch && (
                    <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-500 rounded-full px-2 py-0.5 border border-red-100">
                      {lastDispatch.gateId}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-gray-800 mb-1" style={{color:"#ef4444"}}>
                  ⚡ {lastDispatch ? lastDispatch.gateId : pushGate} 케어 요청
                </div>
                <div className="text-xs text-gray-700 font-semibold mb-1">즉시 이동 바랍니다</div>
                <div className="text-xs text-gray-500 leading-relaxed mb-3">
                  불안 징후 여객 1명이 감지되었습니다.<br/>
                  {lastDispatch ? `직원 ${lastDispatch.staffId}님` : "해당 직원"}이 현장 케어를 요청받았습니다.
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs font-bold py-2 rounded-lg text-white transition-opacity hover:opacity-80"
                    style={{backgroundColor:"#ef4444"}}>
                    이동 확인
                  </button>
                  <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                    상황 보고
                  </button>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            {pushMode === "여객" ? "AI 감지 → 위치 기반 맞춤 메시지 · 3초마다 업데이트" : "불안 감지 → 자동 파견 요청 · 실시간 연동"}
          </p>
        </div>

      </div>
    </div>
  );
}
