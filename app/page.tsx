"use client";

import { useEffect, useState } from "react";
import WaterRipple from "@/components/WaterRipple";

const BACKGROUND_SRC = "/abstract.jpg";
// Solid color sampled from the left edge of the background image itself, used
// as a same-tone placeholder while the image loads (see also the <body>
// background in app/layout.tsx) so there's never a flash of an unrelated color.
const BACKGROUND_FALLBACK = "#0025ce";

const GITHUB_URL = "https://github.com/luciusscala";
const CV_URL = "/lucius_scala_cv.pdf";

const SLLAB_GITHUB_URL = "https://github.com/luciusscala/sllab";
const SLLAB_APP_STORE_URL =
  "https://apps.apple.com/us/app/fixture-management/id6812923949";

// What I'm working on right now — edit freely.
const NOW = `Currently a junior at UCSD. I play soccer and code.`;

// Touch-first devices get a static background instead of the ripple shader.
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

const linkClass = "transition-opacity hover:opacity-100";
const inlineLinkClass =
  "underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/80";

export default function Home() {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isTouch, setIsTouch] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(TOUCH_QUERY);
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Fully load — and decode — the background image before it (or the rest of
  // the page) ever renders, so there's no flash while it streams in.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = BACKGROUND_SRC;

    const ready = () => {
      if (!cancelled) setBgImage(img);
    };
    if (img.decode) {
      img.decode().then(ready).catch(ready);
    } else {
      img.onload = ready;
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Fade the site in once the image is ready, rather than popping in.
  useEffect(() => {
    if (!bgImage || isTouch === null) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [bgImage, isTouch]);

  return (
    <div className="h-dvh w-full overflow-hidden font-serif text-white">
      {/* Same-tone placeholder shown until the image has fully loaded. */}
      <div className="fixed inset-0 -z-20" style={{ backgroundColor: BACKGROUND_FALLBACK }} />

      {bgImage && isTouch === false && <WaterRipple backgroundImage={bgImage} />}
      {bgImage && isTouch && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-left"
          style={{ backgroundImage: `url(${BACKGROUND_SRC})` }}
        />
      )}

      <div
        className={`flex h-dvh w-full flex-col overflow-hidden transition-opacity duration-700 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <main className="flex flex-1 items-center px-6 py-16 sm:px-10 md:px-14">
          <div className="w-full max-w-xs">
            <h1 className="text-2xl">Lucius Scala</h1>
            <p className="mt-1 space-x-2 text-sm opacity-70">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={linkClass}>
                [GitHub]
              </a>
              <a href={CV_URL} target="_blank" rel="noreferrer" className={linkClass}>
                [CV]
              </a>
            </p>

            <p className="mt-12 text-sm leading-relaxed opacity-90">{NOW}</p>

            <p className="mt-4 text-sm leading-relaxed opacity-90">
              Building SLLAB, a platform for running college club sports teams, used daily by
              UCSD Men&apos;s Club Soccer.{" "}
              <span className="whitespace-nowrap opacity-80">
                <a href={SLLAB_GITHUB_URL} target="_blank" rel="noreferrer" className={inlineLinkClass}>
                  GitHub
                </a>
                {" · "}
                <a href={SLLAB_APP_STORE_URL} target="_blank" rel="noreferrer" className={inlineLinkClass}>
                  App Store
                </a>
              </span>
            </p>

            <p className="mt-10 text-xs italic opacity-50">
              {isTouch
                ? "This site is best experienced on a computer."
                : "Drag cursor for effect."}
            </p>
          </div>
        </main>

        <footer className="flex flex-col items-center gap-0.5 px-6 py-4 text-center text-[10px] leading-relaxed opacity-40">
          <div>© 2026 Lucius Scala</div>
          {!isTouch && (
            <div>
              ripple shader adapted from{" "}
              <a
                href="https://www.shadertoy.com/view/wdtyDH"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/70"
              >
                polygon
              </a>{" "}
            </div>
          )}
          <div>
            background photo from{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Macro_of_glass.jpg"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white/70"
            >
              dave croker
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
