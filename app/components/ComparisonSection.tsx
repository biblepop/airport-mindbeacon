export default function ComparisonSection() {
  return (
    <section className="max-w-screen-xl mx-auto px-6 pb-8">
      <h2 className="text-xl font-bold text-airport-black mb-5">
        기존 방식 vs AI 마음등대
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Before */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
              기존
            </span>
            <h3 className="font-bold text-gray-700">기존 심리지원 방식</h3>
          </div>
          <ul className="space-y-3">
            {[
              "승객이 직접 심리안정실을 찾아가야 함",
              "심리적 고통을 인지하고 스스로 도움 요청",
              "직원이 순찰 중 우연히 발견",
              "공항 규모 대비 인력 부족으로 사각지대 발생",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-red-100 text-red-400 flex items-center justify-center text-xs flex-shrink-0">
                  ✕
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-5 py-2 px-3 bg-gray-50 rounded-lg text-center text-sm font-semibold text-gray-500">
            수동 · 사후 대응
          </div>
        </div>

        {/* After */}
        <div
          className="rounded-2xl border-2 p-6"
          style={{ borderColor: "#00AAB5", background: "rgba(0,170,181,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: "#00AAB5" }}
            >
              AI
            </span>
            <h3 className="font-bold" style={{ color: "#00AAB5" }}>
              AI 마음등대
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              "AI 비전 카메라가 이상행동 패턴 자동 감지",
              "불안 징후 감지 즉시 AI가 먼저 케어 메시지 전송",
              "인천공항+ 앱으로 맞춤형 심리안정 콘텐츠 제공",
              "필요 시 가장 가까운 직원 즉시 파견",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-gray-700">
                <span
                  className="mt-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center text-xs flex-shrink-0"
                  style={{ backgroundColor: "#00AAB5" }}
                >
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div
            className="mt-5 py-2 px-3 rounded-lg text-center text-sm font-semibold text-white"
            style={{ backgroundColor: "#00AAB5" }}
          >
            능동 · 선제 대응
          </div>
        </div>
      </div>
    </section>
  );
}
