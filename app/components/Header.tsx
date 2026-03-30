"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      const day = days[now.getDay()];
      const h = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${y}년 ${m}월 ${d}일 (${day})  ${h}:${min}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="https://ko.wikipedia.org/wiki/Special:Redirect/file/Incheon_Airport_Logo.svg"
            alt="인천국제공항"
            height={28}
            style={{ height: 28, flexShrink: 0 }}
          />
          <span className="text-gray-300 text-xl font-thin flex-shrink-0">|</span>
          <span
            className="font-bold text-base sm:text-lg tracking-tight whitespace-nowrap"
            style={{ color: "#00AAB5" }}
          >
            AI 마음등대
          </span>
        </div>

        {/* Right: LIVE + clock */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-4 sm:ml-0">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
            <span
              className="inline-block w-2 h-2 rounded-full animate-blink flex-shrink-0"
              style={{ backgroundColor: "#F99D1B" }}
            />
            <span className="text-xs font-bold tracking-widest text-gray-500">
              LIVE
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-600 tabular-nums">
            {mounted ? time : ""}
          </span>
        </div>
      </div>
    </header>
  );
}
