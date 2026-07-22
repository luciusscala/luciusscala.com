"use client";

import WaterRipple from "@/components/WaterRipple";

export default function Home() {

  return (
    <div className="flex flex-col min-w-full min-h-svh text-white">
      <WaterRipple backgroundSrc="abstract.jpg"/>
      <main className="flex flex-grow items-center justify-center select-none">
          <p>click and drag your mouse around :) </p>
      </main>
      <footer className="flex items-center justify-center">
          <div className="py-3 text-xs opacity-40">@ 2026 Lucius Scala</div>
      </footer>
    </div>
  );
}
