export default function HeroBanner() {
  return (
    <section
      className="text-white py-10 sm:py-14 px-4 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #00AAB5 0%, #0098a3 50%, #5785C5 100%)",
      }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 tracking-wider">
            WORLD FIRST
          </span>
          <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 tracking-wider">
            PROACTIVE AI CARE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3">
          AI가 먼저 찾아가는,<br />
          세계 최초 능동형 심리안전 케어 시스템
        </h1>
        <p className="text-white/80 text-base mt-3">
          인천공항 AI-PORT 아이디어 공모전 세션1 &nbsp;|&nbsp; 제출일: 2026.03.30
        </p>
      </div>
    </section>
  );
}
