"use client";

import { useEffect, useState } from "react";
import WaterRipple from "@/components/WaterRipple";

const BACKGROUND_SRC = "/abstract.jpg";
// Solid color sampled from the left edge of the background image itself, used
// as a same-tone placeholder while the image loads (see also the <body>
// background in app/layout.tsx) so there's never a flash of an unrelated color.
const BACKGROUND_FALLBACK = "#0025ce";

const GITHUB_URL = "https://github.com/luciusscala";
const CV_URL = "/cv.pdf";

const SLLAB_GITHUB_URL = "https://github.com/luciusscala/sllab";
const SLLAB_APP_STORE_URL =
  "https://apps.apple.com/us/app/fixture-management/id6812923949";
// TODO: point this at the technical writeup once it's published.
const SLLAB_WRITEUP_URL = "https://github.com/luciusscala/sllab/blob/main/docs/writeup/sllab.pdf";
const LAST_UPDATED = "November 17, 2026";

// What I'm working on right now — edit freely.
const NOW = `Currently a junior at UCSD. I play soccer and code.`;

// Touch-first devices get a static background instead of the ripple shader.
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

// Academic-style links: bracketed, no underline, same font as surrounding text.
function BracketLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-60">
      [{children}]
    </a>
  );
}

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
              <BracketLink href={GITHUB_URL}>GitHub</BracketLink>
              <BracketLink href={CV_URL}>CV</BracketLink>
            </p>

            <p className="mt-12 text-sm leading-relaxed opacity-90">{NOW}</p>

            <p className="mt-4 text-sm leading-relaxed opacity-90">
              Right now, I&apos;m working on <BracketLink href={SLLAB_GITHUB_URL}>sllab</BracketLink>; a
              software platform that provides the backoffice for college club sport teams, allowing them to be run
              more like NCAA programs. You can read a technical writeup{" "}
              <BracketLink href={SLLAB_WRITEUP_URL}>here</BracketLink>, and download my main app: {" "}
              <BracketLink href={SLLAB_APP_STORE_URL}>Fixture</BracketLink> on the app store. Last
              updated: {LAST_UPDATED}.
              {!isTouch && (
                <>
                  <br />
                  <br />
                  Drag cursor for effect.
                </>
              )}
            </p>
          </div>
        </main>

        <footer className="flex flex-col items-center gap-0.5 px-6 py-4 text-center text-[10px] leading-relaxed opacity-40">
          <div>© 2026 Lucius Scala</div>
          {!isTouch && (
            <div>
              ripple shader adapted from{" "}
              <BracketLink href="https://www.shadertoy.com/view/wdtyDH">polygon</BracketLink>
            </div>
          )}
          <div>
            background photo from{" "}
            <BracketLink href="https://commons.wikimedia.org/wiki/File:Macro_of_glass.jpg">
              dave croker
            </BracketLink>
          </div>
        </footer>
      </div>
    </div>
  );
}
