"use client";

import { useEffect, useState } from "react";
import WaterRipple from "@/components/WaterRipple";

const BACKGROUND_SRC = "/abstract.jpg";
// Solid color sampled from the left edge of the background image itself, used
// as a same-tone placeholder while the image loads (see also the <body>
// background in app/layout.tsx) so there's never a flash of an unrelated color.
const BACKGROUND_FALLBACK = "#0025ce";

type ProjectLink = { label: string; href: string };
type Project = { name: string; links: ProjectLink[] };

// Placeholder projects — swap in the real ones.
const PROJECTS: Project[] = [
  {
    name: "Project one",
    links: [{ label: "Code", href: "#" }],
  },
  {
    name: "Project Two",
    links: [
      { label: "Code", href: "#" },
      { label: "Demo", href: "#" },
    ],
  },
  {
    name: "Project Three",
    links: [
      { label: "Code", href: "#" },
      { label: "Paper", href: "#" },
    ],
  },
];

export default function Home() {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);

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
    if (!bgImage) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [bgImage]);

  return (
    <div className="min-h-svh w-full font-serif text-white">
      {/* Same-tone placeholder shown until the image has fully loaded. */}
      <div className="fixed inset-0 -z-20" style={{ backgroundColor: BACKGROUND_FALLBACK }} />

      {bgImage && <WaterRipple backgroundImage={bgImage} />}

      <div
        className={`flex min-h-svh w-full flex-col transition-opacity duration-700 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <main className="flex flex-1 items-center px-6 py-16 sm:px-10 md:px-14">
          <div className="w-full max-w-xs">
            <h1 className="text-2xl">Lucius Scala</h1>
            <a
              href="https://github.com/luciusscala"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm opacity-70 transition-opacity hover:opacity-100"
            >
              [GitHub]
            </a>

            <div className="mt-12 space-y-6 text-sm">
              {PROJECTS.map((project) => (
                <div key={project.name}>
                  <p>{project.name}</p>
                  <p className="mt-1 space-x-2 opacity-70">
                    {project.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="transition-opacity hover:opacity-100"
                      >
                        [{link.label}]
                      </a>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="flex flex-col items-center gap-0.5 px-6 py-4 text-center text-[10px] leading-relaxed opacity-40">
          <div>© 2026 Lucius Scala</div>
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
