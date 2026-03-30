"use client";

import { useState } from "react";

const SLIDES = [
  {
    step: 1,
    emoji: "🗼",
    title: "AI 마음등대란?",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          공항을 이용하는 여객의 심리적 고통을 AI가 <strong className="text-gray-800">먼저 감지하고 찾아가는</strong>,
          세계 최초 능동형 심리안전 케어 시스템입니다.
        </p>
        <div className="rounded-xl p-4 border" style={{ background: "rgba(0,170,181,0.06)", borderColor: "rgba(0,170,181,0.25)" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✈️</span>
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-1">인천공항 AI-PORT 공모전</div>
              <div className="text-xs text-gray-500 leading-relaxed">
                세션1 아이디어 프로토타입 · 2026.03.26 제출<br />
                기존의 수동·사후 대응 방식을 AI 기반 능동·선제 대응으로 전환합니다.
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg p-3 bg-red-50 border border-red-100">
            <div className="font-semibold text-red-600 mb-1">기존 방식 ✕</div>
            <div className="text-gray-500 leading-relaxed">승객이 직접 도움 요청<br />우연한 직원 발견 의존</div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(0,170,181,0.06)", border: "1px solid rgba(0,170,181,0.25)" }}>
            <div className="font-semibold mb-1" style={{ color: "#00AAB5" }}>AI 마음등대 ✓</div>
            <div className="text-gray-500 leading-relaxed">AI가 먼저 감지·개입<br />위치 기반 직원 즉시 파견</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    emoji: "⚙️",
    title: "어떻게 작동하나요?",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          3단계 AI 파이프라인이 실시간으로 작동합니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {[
            { icon: "📷", step: "①", title: "감지", sub: "비전 AI", desc: "CCTV 영상 분석\n배회·웅크림 패턴 탐지", color: "#5785C5" },
            { icon: "🧠", step: "②", title: "분류", sub: "이상행동 모델", desc: "Edge AI 온디바이스\n3단계 불안 분류", color: "#00AAB5" },
            { icon: "💬", step: "③", title: "개입", sub: "앱 푸시 + 파견", desc: "앱 푸시 알림 전송\n직원 즉시 파견", color: "#F99D1B" },
          ].map((s, i, arr) => (
            <div key={s.step} className="flex sm:flex-col items-center gap-2 sm:gap-0 w-full sm:flex-1">
              <div className="rounded-xl p-3 flex flex-col items-center text-center w-full" style={{ background: `${s.color}12` }}>
                <span className="text-2xl mb-1">{s.icon}</span>
                <div className="text-xs font-bold mb-0.5" style={{ color: s.color }}>{s.step} {s.title}</div>
                <div className="text-xs font-semibold text-gray-700">{s.sub}</div>
                <p className="text-[11px] text-gray-400 mt-1 whitespace-pre-line leading-relaxed">{s.desc}</p>
              </div>
              {i < arr.length - 1 && (
                <span className="text-gray-300 text-lg font-thin flex-shrink-0 sm:hidden">↓</span>
              )}
              {i < arr.length - 1 && (
                <span className="hidden sm:block text-gray-300 text-lg font-thin self-center mt-[-24px]">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Edge AI 온디바이스", "비식별화 처리", "자발적 동의 기반", "개인정보 보호"].map(tag => (
            <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full border" style={{ borderColor: "#00AAB5", color: "#00AAB5" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 3,
    emoji: "📊",
    title: "데이터 안내",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          이 프로토타입은 <strong className="text-gray-800">실시간 API</strong>와 <strong className="text-gray-800">시뮬레이션 데이터</strong>를 함께 사용합니다.
        </p>
        <div className="space-y-2">
          <div className="rounded-xl p-4 border" style={{ background: "rgba(0,170,181,0.06)", borderColor: "rgba(0,170,181,0.25)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#00AAB5" }} />
              <span className="text-sm font-semibold" style={{ color: "#00AAB5" }}>실시간 API 연동</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1 pl-4">
              <li>✓ 출국장 게이트별 대기 인원·시간</li>
              <li>✓ 입국장 T1·T2 혼잡도</li>
              <li>✓ 주차장 5개 구역 사용률</li>
            </ul>
          </div>
          <div className="rounded-xl p-4 border border-yellow-100 bg-yellow-50/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-yellow-700">시뮬레이션 데이터</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1 pl-4">
              <li>⚠ AI 불안 감지 이벤트</li>
              <li>⚠ 직원 파견·케어 시퀀스</li>
              <li>⚠ 작업자 스트레스 지수</li>
            </ul>
          </div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(0,170,181,0.08)" }}>
          <p className="text-xs text-gray-600 leading-relaxed">
            💡 실제 시스템 도입 시 AI 감지·케어·작업자 데이터도<br />
            <strong className="text-gray-800">전체 실데이터로 전환</strong>됩니다.
          </p>
        </div>
      </div>
    ),
  },
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function handleClose() {
    setStep(0);
    onClose();
  }

  function handleFinish() {
    localStorage.setItem("mindbeacon_onboarded", "1");
    setStep(0);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{slide.emoji}</span>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 tracking-wider">
                {step + 1} / {SLIDES.length}
              </div>
              <h2 className="text-base font-bold text-gray-900">{slide.title}</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 진행 바 */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 transition-all duration-300 rounded-r-full"
            style={{
              width: `${((step + 1) / SLIDES.length) * 100}%`,
              backgroundColor: "#00AAB5",
            }}
          />
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {slide.content}
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>

          {/* 스텝 도트 */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: i === step ? "#00AAB5" : "#e5e7eb" }}
                aria-label={`${i + 1}단계로 이동`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="px-5 py-2 text-sm font-bold rounded-xl text-white transition-colors"
              style={{ backgroundColor: "#00AAB5" }}
            >
              시작하기 🚀
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 text-sm font-bold rounded-xl text-white transition-colors"
              style={{ backgroundColor: "#00AAB5" }}
            >
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
