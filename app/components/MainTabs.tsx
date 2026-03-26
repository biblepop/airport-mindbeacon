"use client";

import { useState } from "react";
import HeroBanner from "./HeroBanner";
import StatCards from "./StatCards";
import ComparisonSection from "./ComparisonSection";
import FlowSection from "./FlowSection";
import AICarePanel from "./AICarePanel";
import RealtimePanel from "./RealtimePanel";
import TodayStats from "./TodayStats";
import CalmRoomSection from "./CalmRoomSection";
import WorkerMonitor from "./WorkerMonitor";

const TABS = [
  { id: "overview",  label: "개요",         icon: "🏠" },
  { id: "aicare",    label: "AI 케어 현황", icon: "🤖" },
  { id: "airport",   label: "공항 현황",    icon: "📊" },
  { id: "calmroom",  label: "심리안정실",   icon: "🧘" },
  { id: "workers",   label: "작업자 안전",  icon: "🛡️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MainTabs() {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <>
      {/* ── 탭 바 ── */}
      <div className="sticky top-[52px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4">
          <nav className="flex overflow-x-auto scrollbar-hide gap-1" aria-label="메인 탭">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 flex-shrink-0"
                  style={{ color: isActive ? "#00AAB5" : "#6b7280" }}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200"
                    style={{ backgroundColor: isActive ? "#00AAB5" : "transparent" }}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-screen-xl mx-auto">

        {/* 1. 개요 */}
        {active === "overview" && (
          <div className="animate-fadeIn">
            <HeroBanner />
            <StatCards />
            <ComparisonSection />
            <FlowSection />
          </div>
        )}

        {/* 2. AI 케어 현황 (핵심 탭) */}
        {active === "aicare" && (
          <div className="animate-fadeIn px-6 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">AI 케어 현황</h2>
              <p className="text-sm text-gray-500 mt-1">
                AI가 먼저 찾아가는 능동형 심리안전 케어 · 실시간 모니터링
              </p>
            </div>
            <AICarePanel />
          </div>
        )}

        {/* 3. 공항 현황 */}
        {active === "airport" && (
          <div className="animate-fadeIn px-6 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">공항 현황</h2>
              <p className="text-sm text-gray-500 mt-1">
                출국장 · 입국장 · 주차장 실시간 혼잡도
              </p>
            </div>
            <RealtimePanel />
            <div className="mt-6">
              <TodayStats />
            </div>
          </div>
        )}

        {/* 4. 심리안정실 */}
        {active === "calmroom" && (
          <div className="animate-fadeIn py-8">
            <CalmRoomSection />
          </div>
        )}

        {/* 5. 작업자 안전 */}
        {active === "workers" && (
          <div className="animate-fadeIn py-8">
            <WorkerMonitor />
          </div>
        )}

      </div>
    </>
  );
}
