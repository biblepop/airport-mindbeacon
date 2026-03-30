const steps = [
  {
    num: "①",
    title: "감지",
    sub: "비전 AI",
    desc: "CCTV 영상 실시간 분석\n배회·웅크림·과호흡 등\n이상행동 패턴 탐지",
    icon: "📷",
    color: "#5785C5",
  },
  {
    num: "②",
    title: "분류",
    sub: "이상행동 모델",
    desc: "Edge AI 온디바이스 추론\n불안 수준 3단계 분류\n(관찰 / 주의 / 즉각 개입)",
    icon: "🧠",
    color: "#00AAB5",
  },
  {
    num: "③",
    title: "개입",
    sub: "앱 푸시 + 직원 파견",
    desc: "인천공항+ 앱 푸시 알림\n심리안정 콘텐츠 제공\n직원 위치 기반 즉시 파견",
    icon: "💬",
    color: "#F99D1B",
  },
];

export default function FlowSection() {
  return (
    <section className="max-w-screen-xl mx-auto px-3 sm:px-6 pb-8">
      <h2 className="text-xl font-bold text-airport-black mb-5">AI 작동 흐름도</h2>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {steps.map((step, i) => (
            <>
              <div key={step.num} className="flex-1 flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  {step.icon}
                </div>
                <div
                  className="text-xs font-bold tracking-widest mb-1"
                  style={{ color: step.color }}
                >
                  {step.num} {step.title}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {step.sub}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                  {step.desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  key={`arrow-${i}`}
                  className="hidden md:block text-2xl font-thin"
                  style={{ color: "#00AAB5" }}
                >
                  →
                </div>
              )}
            </>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3 justify-center">
          {["Edge AI 온디바이스", "비식별화 처리", "자발적 동의 기반", "개인정보 보호"].map(
            (tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full border"
                style={{ borderColor: "#00AAB5", color: "#00AAB5" }}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
