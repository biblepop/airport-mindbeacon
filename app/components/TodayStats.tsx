const stats = [
  {
    label: "총 감지 건수",
    value: "359",
    unit: "건",
    color: "#5785C5",
    icon: "📊",
  },
  {
    label: "케어 완료",
    value: "312",
    unit: "건",
    color: "#00AAB5",
    icon: "✅",
    sub: "완료율 86.9%",
  },
  {
    label: "평균 응답 시간",
    value: "1.8",
    unit: "분",
    color: "#F99D1B",
    icon: "⚡",
    sub: "AI 감지 → 개입",
  },
  {
    label: "작업자 알림",
    value: "28",
    unit: "건",
    color: "#221E1F",
    icon: "🔔",
    sub: "휴식·교대 권고",
  },
];

export default function TodayStats() {
  return (
    <section className="max-w-screen-xl mx-auto px-6 pb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-airport-black">오늘의 통계</h2>
        <span className="text-sm text-gray-400 font-medium">2026.03.23 기준</span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {stats.map((s) => (
            <div key={s.label} className="p-6 flex flex-col items-center text-center">
              <span className="text-2xl mb-2">{s.icon}</span>
              <div className="text-sm text-gray-500 mb-1">{s.label}</div>
              <div className="flex items-end gap-1">
                <span
                  className="text-4xl font-bold tabular-nums"
                  style={{ color: s.color }}
                >
                  {s.value}
                </span>
                <span className="text-sm text-gray-400 mb-1">{s.unit}</span>
              </div>
              {s.sub && (
                <span className="text-xs text-gray-400 mt-1">{s.sub}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
