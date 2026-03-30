export default function CalmRoomSection() {
  return (
    <section
      className="max-w-screen-xl mx-auto px-3 sm:px-6 pb-8"
    >
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-xl font-bold text-airport-black">
          심리안정실 위치 안내
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: "#00AAB5" }}
        >
          AI 연계
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 지도 SVG */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">
              T2 3층 플로어맵 — 심리안정실 위치
            </h3>
            <span className="text-xs text-gray-400">제2터미널 · 3층 출국장</span>
          </div>

          {/* SVG Floor Map */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 560 280"
              className="w-full max-w-full"
              style={{ minWidth: 320 }}
              aria-label="T2 3층 심리안정실 위치 플로어맵"
            >
              {/* 배경 */}
              <rect width="560" height="280" fill="#f5f8fa" rx="12" />

              {/* ── 메인 복도 (가로) ── */}
              <rect x="40" y="110" width="480" height="60" fill="#e8f4f5" stroke="#00AAB5" strokeWidth="1.5" rx="4" />
              <text x="280" y="143" textAnchor="middle" fontSize="11" fill="#00AAB5" fontWeight="600">
                출국장 메인 복도 (3F)
              </text>

              {/* ── 상단 탑승구 ── */}
              {/* G229 */}
              <rect x="80" y="50" width="64" height="58" fill="#fff" stroke="#cbd5e1" strokeWidth="1" rx="4" />
              <text x="112" y="76" textAnchor="middle" fontSize="10" fill="#64748b">탑승구</text>
              <text x="112" y="91" textAnchor="middle" fontSize="13" fill="#334155" fontWeight="700">229</text>
              <line x1="112" y1="108" x2="112" y2="110" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* G230 */}
              <rect x="168" y="50" width="64" height="58" fill="#fff" stroke="#cbd5e1" strokeWidth="1" rx="4" />
              <text x="200" y="76" textAnchor="middle" fontSize="10" fill="#64748b">탑승구</text>
              <text x="200" y="91" textAnchor="middle" fontSize="13" fill="#334155" fontWeight="700">230</text>
              <line x1="200" y1="108" x2="200" y2="110" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* G231 — 심리안정실 인근 (강조) */}
              <rect x="256" y="44" width="72" height="64" fill="#e0f7f8" stroke="#00AAB5" strokeWidth="2" rx="6" />
              <text x="292" y="70" textAnchor="middle" fontSize="10" fill="#00838c">탑승구</text>
              <text x="292" y="86" textAnchor="middle" fontSize="15" fill="#00AAB5" fontWeight="800">231</text>
              <text x="292" y="100" textAnchor="middle" fontSize="8" fill="#00838c">심리안정실 인근</text>
              <line x1="292" y1="108" x2="292" y2="110" stroke="#00AAB5" strokeWidth="2" />

              {/* G232 */}
              <rect x="352" y="50" width="64" height="58" fill="#fff" stroke="#cbd5e1" strokeWidth="1" rx="4" />
              <text x="384" y="76" textAnchor="middle" fontSize="10" fill="#64748b">탑승구</text>
              <text x="384" y="91" textAnchor="middle" fontSize="13" fill="#334155" fontWeight="700">232</text>
              <line x1="384" y1="108" x2="384" y2="110" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* G233 */}
              <rect x="440" y="50" width="64" height="58" fill="#fff" stroke="#cbd5e1" strokeWidth="1" rx="4" />
              <text x="472" y="76" textAnchor="middle" fontSize="10" fill="#64748b">탑승구</text>
              <text x="472" y="91" textAnchor="middle" fontSize="13" fill="#334155" fontWeight="700">233</text>
              <line x1="472" y1="108" x2="472" y2="110" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* ── 하단 면세구역 ── */}
              <rect x="40" y="172" width="300" height="72" fill="#fffbf0" stroke="#F99D1B" strokeWidth="1" rx="4" />
              <text x="190" y="196" textAnchor="middle" fontSize="11" fill="#c17b00" fontWeight="600">면세구역 (Duty Free)</text>
              <text x="190" y="214" textAnchor="middle" fontSize="10" fill="#d4a017">쇼핑 · 식음료 · 편의시설</text>
              <text x="190" y="230" textAnchor="middle" fontSize="9" fill="#e8c44a">3층 출국 후 이용 가능</text>

              {/* ── 편의시설 (우측 하단) ── */}
              <rect x="356" y="172" width="164" height="72" fill="#f8f9fa" stroke="#e2e8f0" strokeWidth="1" rx="4" />
              <text x="438" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">편의시설</text>
              <text x="438" y="212" textAnchor="middle" fontSize="9" fill="#94a3b8">화장실 · 수유실 · 의무실</text>

              {/* ── 심리안정실 마커 ── */}
              {/* 연결선 */}
              <line x1="292" y1="170" x2="292" y2="195" stroke="#00AAB5" strokeWidth="1.5" strokeDasharray="4 3" />

              {/* 마커 핀 */}
              <circle cx="292" cy="168" r="14" fill="#00AAB5" opacity="0.15">
                <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="292" cy="168" r="10" fill="#00AAB5" />
              <text x="292" y="172" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">🧘</text>

              {/* 마커 라벨 */}
              <rect x="218" y="188" width="148" height="30" fill="#00AAB5" rx="6" />
              <text x="292" y="201" textAnchor="middle" fontSize="9" fill="white" fontWeight="600">심리안정실</text>
              <text x="292" y="213" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)">231번 탑승구 인근</text>

              {/* ── 방위 표시 ── */}
              <text x="524" y="258" textAnchor="middle" fontSize="9" fill="#94a3b8">↑ 탑승구</text>
              <text x="524" y="270" textAnchor="middle" fontSize="9" fill="#94a3b8">↓ 면세구역</text>

              {/* ── 범례 ── */}
              <circle cx="48" cy="258" r="5" fill="#00AAB5" />
              <text x="58" y="262" fontSize="9" fill="#64748b">심리안정실</text>
              <rect x="118" y="253" width="10" height="10" fill="#fffbf0" stroke="#F99D1B" strokeWidth="1" rx="1" />
              <text x="132" y="262" fontSize="9" fill="#64748b">면세구역</text>
              <rect x="190" y="253" width="10" height="10" fill="#e0f7f8" stroke="#00AAB5" strokeWidth="1" rx="1" />
              <text x="204" y="262" fontSize="9" fill="#64748b">안내 탑승구</text>
            </svg>
          </div>
        </div>

        {/* 상세 정보 카드 */}
        <div className="flex flex-col gap-3">
          {/* 위치 정보 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: "rgba(0,170,181,0.1)" }}
            >
              📍
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-2">위치</h3>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              제2여객터미널 3층<br />
              면세구역 231번 탑승구 인근
            </p>
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>🕐</span>
                <span>
                  운영시간{" "}
                  <span className="font-semibold text-gray-700">07:00 ~ 21:00</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>📞</span>
                <span>문의 032-1234-5678</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>♿</span>
                <span>장애인 접근 가능</span>
              </div>
            </div>
          </div>

          {/* 이용 안내 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: "rgba(87,133,197,0.1)" }}
            >
              🌿
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-3">제공 서비스</h3>
            <ul className="space-y-2">
              {[
                "심리상담 전문인력 상주",
                "명상·호흡 안정 프로그램",
                "비행 불안 완화 콘텐츠",
                "1:1 AI 심리케어 단말기",
                "완전 익명 · 무료 이용",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                  <span
                    className="mt-0.5 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[8px] flex-shrink-0"
                    style={{ backgroundColor: "#5785C5" }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* AI 연계 배지 */}
          <div
            className="rounded-2xl p-4 border-2"
            style={{
              borderColor: "#00AAB5",
              background: "rgba(0,170,181,0.04)",
            }}
          >
            <p className="text-xs font-semibold" style={{ color: "#00AAB5" }}>
              AI 마음등대 연계
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              불안 감지 시 AI가 자동으로 이 위치를 앱 푸시로 안내합니다. 동의 기반·비식별 처리.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
