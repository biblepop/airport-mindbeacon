export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-4">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://ko.wikipedia.org/wiki/Special:Redirect/file/Incheon_Airport_Logo.svg"
                alt="인천국제공항"
                height={20}
                style={{ height: 20, opacity: 0.7 }}
              />
              <span className="text-sm font-bold text-gray-600">AI 마음등대</span>
            </div>
            <p className="text-xs text-gray-400">
              인천공항 AI-PORT 아이디어 공모전 세션1 &nbsp;|&nbsp; 2026년 제출
            </p>
          </div>
          <div className="text-xs text-gray-400 space-y-1 text-right">
            <p>데이터 출처: 인천국제공항공사 공공데이터 API</p>
            <p>비식별 처리 · 개인정보 보호 · 자발적 동의 기반 운영</p>
            <p className="flex items-center gap-3 justify-end mt-2">
              <span
                className="px-2 py-0.5 rounded text-white text-xs font-semibold"
                style={{ backgroundColor: "#00AAB5" }}
              >
                Airport Green
              </span>
              <span
                className="px-2 py-0.5 rounded text-white text-xs font-semibold"
                style={{ backgroundColor: "#5785C5" }}
              >
                Airport Blue
              </span>
              <span
                className="px-2 py-0.5 rounded text-white text-xs font-semibold"
                style={{ backgroundColor: "#F99D1B" }}
              >
                Airport Yellow
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
