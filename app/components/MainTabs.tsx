"use client";

import { useState } from "react";
import HeroBanner from "./HeroBanner";
import StatCards from "./StatCards";
import ComparisonSection from "./ComparisonSection";
import FlowSection from "./FlowSection";
import RealtimePanel from "./RealtimePanel";
import TodayStats from "./TodayStats";
import AILogPanel from "./AILogPanel";
import CalmRoomSection from "./CalmRoomSection";
import WorkerMonitor from "./WorkerMonitor";

const TABS = [
  { id: "overview",  label: "개요",         icon: "🏠" },
  { id: "realtime",  label: "실시간 현황",   icon: "📊" },
  { id: "ailog",     label: "AI 개입 로그", icon: "🤖" },
  { id: "calmroom",  label: "심리안정실",   icon: "🧘" },
  { id: "workers",   label: "작업자 안전",  icon: "🛡️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MainTabs() {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <>
      {/* ── 탭 바 ── sticky, header(≈52px) 바로 아래 */}
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
                  style={{
                    color: isActive ? "#00AAB5" : "#6b7280",
                  }}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {/* 언더라인 */}
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? "#00AAB5" : "transparent",
                    }}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-screen-xl mx-auto">
        {/* Tab 1: 개요 */}
        {active === "overview" && (
          <div className="animate-fadeIn">
            <HeroBanner />
            <div className="px-0">
              <StatCards />
              <ComparisonSection />
              <FlowSection />
            </div>
          </div>
        )}

        {/* Tab 2: 실시간 현황 */}
        {active === "realtime" && (
          <div className="animate-fadeIn px-6 py-8">
            <h2 className="text-xl font-bold text-airport-black mb-5">실시간 현황</h2>
            <RealtimePanel />
            <div className="mt-5">
              <TodayStats />
            </div>
          </div>
        )}

        {/* Tab 3: AI 개입 로그 */}
        {active === "ailog" && (
          <div className="animate-fadeIn px-6 py-8">
            <h2 className="text-xl font-bold text-airport-black mb-5">AI 개입 로그</h2>
            <AILogPanel onCalmRoom={() => setActive("calmroom")} />
          </div>
        )}

        {/* Tab 4: 심리안정실 */}
        {active === "calmroom" && (
          <div className="animate-fadeIn py-8">
            <CalmRoomSection />
          </div>
        )}

        {/* Tab 5: 작업자 안전 */}
        {active === "workers" && (
          <div className="animate-fadeIn py-8">
            <WorkerMonitor />
          </div>
        )}
      </div>
    </>
  );
}
