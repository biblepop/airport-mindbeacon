"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  time: string;
  zone: string;
  level: "관찰" | "주의" | "즉각";
  action: string;
}

interface Props {
  onCalmRoom: () => void;
}

const LEVEL_COLOR: Record<string, string> = {
  관찰: "#5785C5",
  주의: "#F99D1B",
  즉각: "#ef4444",
};

const ZONES = [
  "T1 출국장 1구역",
  "T1 출국장 2구역",
  "T1 출국장 3구역",
  "T2 출국장 1구역",
  "T2 면세구역",
  "T2 탑승구역",
];
const LEVELS: LogEntry["level"][] = ["관찰", "주의", "즉각"];
const ACTIONS = [
  "앱 푸시 전송 완료",
  "직원 파견 요청",
  "심리안정 콘텐츠 제공",
  "심리안정실 안내",
  "케어 완료 확인",
  "AI 모니터링 중",
];

function makeLog(id: number): LogEntry {
  const now = new Date();
  return {
    id,
    time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
    zone: ZONES[Math.floor(Math.random() * ZONES.length)],
    level: LEVELS[Math.floor(Math.random() * LEVELS.length)],
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
  };
}

export default function AILogPanel({ onCalmRoom }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    Array.from({ length: 10 }, (_, i) => makeLog(i))
  );
  const [, setCounter] = useState(100);

  useEffect(() => {
    const id = setInterval(() => {
      setCounter((prev) => {
        const newId = prev + 1;
        setLogs((l) => [makeLog(newId), ...l.slice(0, 19)]);
        return newId;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* AI 개입 로그 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">AI 개입 로그</h3>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "#00AAB5" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-blink inline-block"
              style={{ backgroundColor: "#00AAB5" }}
            />
            실시간
          </span>
        </div>
        <div className="space-y-0 divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-2.5 first:pt-0"
            >
              <span className="text-xs tabular-nums text-gray-400 whitespace-nowrap mt-0.5 w-16 flex-shrink-0">
                {log.time}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0"
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
                {log.action === "심리안정실 안내" ? (
                  <button
                    onClick={onCalmRoom}
                    className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity text-left"
                    style={{ color: "#00AAB5" }}
                  >
                    📍 심리안정실 안내 →
                  </button>
                ) : (
                  <div className="text-xs text-gray-400">{log.action}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 앱 푸시 미리보기 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">인천공항+ 앱 푸시 미리보기</h3>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "#00AAB5" }}
            >
              AI
            </div>
            <div>
              <div className="text-xs font-bold text-gray-700">인천공항+</div>
              <div className="text-xs text-gray-400">방금 전</div>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            안녕하세요, 잠시 쉬어가는 건 어떨까요? 🌿
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            인천공항 마음안정실이 가까이 있어요. 잠깐의 휴식이 여행을 더 편안하게 만들어 드려요.
          </p>
          <button
            onClick={onCalmRoom}
            className="block mt-2 text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity text-left"
            style={{ color: "#00AAB5" }}
          >
            → T2 3층 심리안정실 위치 안내 보기
          </button>
        </div>
      </div>
    </div>
  );
}
