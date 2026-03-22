"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import {
  type MotionValue,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type SentencePart = { text: string; emphasized?: boolean };

const SENTENCES: SentencePart[][] = [
  [
    { text: "In Canada's " },
    { text: "2 trillion-dollar trade era,", emphasized: true },
    { text: " small and medium businesses fuel " },
    { text: "37.9%", emphasized: true },
    { text: " of all export value." },
  ],
  [
    { text: "Canada has a wide network through " },
    { text: "15 free trade agreements", emphasized: true },
    { text: " with " },
    { text: "51 countries,", emphasized: true },
    { text: " giving access to more than " },
    { text: "1.5 billion consumers.", emphasized: true },
  ],
  [
    { text: "Canada commits to " },
    { text: "net-zero emissions by 2050,", emphasized: true },
    { text: " with shipping policies reflecting those commitments via " },
    { text: "green shipping corridors.", emphasized: true },
  ],
  [
    { text: "Embark and discover new connections " },
    { text: "on this global, sustainable trade journey.", emphasized: true },
  ],
];

// Scroll runway breakdown (total = STEPS viewports):
//   Step 0 → blank dark screen
//   Step 1 → sentence 1 fades in (previous fades out)
//   Step 2 → sentence 2 fades in
//   Step 3 → sentence 3 fades in
//   Step 4 → sentence 4 ("Embark") fades in
//   Step 5 → reveal trigger (overlay slides up)
const STEPS = SENTENCES.length + 2; // 6
const FADE_WINDOW = 0.4;

function SentenceBlock({
  parts,
  opacity,
  y,
}: {
  parts: SentencePart[];
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.opacity = String(opacity.get());
    node.style.transform = `translateY(${y.get()}px)`;
    const unsubO = opacity.on("change", (v) => { node.style.opacity = String(v); });
    const unsubY = y.on("change", (v) => { node.style.transform = `translateY(${v}px)`; });
    return () => { unsubO(); unsubY(); };
  }, [opacity, y]);

  return (
    <div
      ref={ref}
      style={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center px-8 sm:px-16"
    >
      <p className="max-w-2xl text-center text-3xl font-light leading-relaxed tracking-tight text-white/80 sm:text-4xl md:text-[2.75rem]">
        {parts.map((part, i) =>
          part.emphasized ? (
            <strong key={i} className="font-semibold not-italic text-amber-300">
              {part.text}
            </strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>
    </div>
  );
}

function ScrollIndicator({
  opacity,
  bounceY,
}: {
  opacity: MotionValue<number>;
  bounceY: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.opacity = String(opacity.get());
    node.style.transform = `translateY(${bounceY.get()}px)`;
    const unsubO = opacity.on("change", (v) => { node.style.opacity = String(v); });
    const unsubY = bounceY.on("change", (v) => { node.style.transform = `translateY(${v}px)`; });
    return () => { unsubO(); unsubY(); };
  }, [opacity, bounceY]);

  return (
    <div
      ref={ref}
      className="absolute bottom-10 flex flex-col items-center gap-2 text-white/30"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.25em]">Scroll</span>
      <div className="flex flex-col items-center gap-0.5">
        <div className="h-4 w-px bg-gradient-to-b from-transparent to-white/40" />
        <div className="h-4 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.width = `${progress.get() * 100}%`;
    return progress.on("change", (v) => { node.style.width = `${v * 100}%`; });
  }, [progress]);

  return (
    <div className="absolute bottom-0 left-0 h-px w-full bg-white/[0.06]">
      <div ref={ref} className="h-full bg-amber-300/50 transition-none" style={{ width: "0%" }} />
    </div>
  );
}

export function ScrollyIntro() {
  const [introComplete, setIntroComplete] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);

  const hasScrolledRef = useRef(false);
  const revealStartedRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayY = useMotionValue("0%");

  const { scrollYProgress } = useScroll({ container: containerRef });

  const s = 1 / STEPS;
  const fw = s * FADE_WINDOW;

  const opacity0 = useTransform(
    scrollYProgress,
    [s * 1, s * 1 + fw, s * 2, s * 2 + fw],
    [0, 1, 1, 0],
  );
  const y0 = useTransform(
    scrollYProgress,
    [s * 1, s * 1 + fw, s * 2, s * 2 + fw],
    [36, 0, 0, -36],
  );

  const opacity1 = useTransform(
    scrollYProgress,
    [s * 2, s * 2 + fw, s * 3, s * 3 + fw],
    [0, 1, 1, 0],
  );
  const y1 = useTransform(
    scrollYProgress,
    [s * 2, s * 2 + fw, s * 3, s * 3 + fw],
    [36, 0, 0, -36],
  );

  const opacity2 = useTransform(
    scrollYProgress,
    [s * 3, s * 3 + fw, s * 4, s * 4 + fw],
    [0, 1, 1, 0],
  );
  const y2 = useTransform(
    scrollYProgress,
    [s * 3, s * 3 + fw, s * 4, s * 4 + fw],
    [36, 0, 0, -36],
  );

  // Last sentence: fades in only, stays visible through reveal
  const opacity3 = useTransform(scrollYProgress, [s * 4, s * 4 + fw], [0, 1]);
  const y3 = useTransform(scrollYProgress, [s * 4, s * 4 + fw], [36, 0]);

  const sentenceAnimations = [
    { opacity: opacity0, y: y0 },
    { opacity: opacity1, y: y1 },
    { opacity: opacity2, y: y2 },
    { opacity: opacity3, y: y3 },
  ];

  // Progress bar: fills from step 1 to end of story
  const progressValue = useTransform(
    scrollYProgress,
    [s * 1, s * (SENTENCES.length + 1)],
    [0, 1],
  );

  const indicatorOpacity = useTransform(scrollYProgress, [0, s * 0.5], [1, 0]);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (v > 0.01 && !hasScrolledRef.current) {
        hasScrolledRef.current = true;
        setHasScrolled(true);
      }

      if (v >= s * (SENTENCES.length + 1) && !revealStartedRef.current) {
        revealStartedRef.current = true;
        setRevealStarted(true);
        animate(overlayY, "-100%", {
          duration: 0.9,
          ease: [0.76, 0, 0.24, 1],
          onComplete: () => setIntroComplete(true),
        });
      }
    });
  // scrollYProgress, overlayY, s are stable references — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bounceY = useMotionValue(0);
  useEffect(() => {
    if (hasScrolled) return;
    const timeout = setTimeout(() => {
      const loop = () => {
        animate(bounceY, [0, 10, 0], {
          duration: 0.9,
          ease: "easeInOut",
          onComplete: () => {
            if (!hasScrolledRef.current) loop();
          },
        });
      };
      loop();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [hasScrolled, bounceY]);

  return (
    <>
      {/* HeroSection is always mounted; pointer events enabled once reveal begins */}
      <div
        className="fixed inset-0 z-0"
        style={{ pointerEvents: revealStarted ? "auto" : "none" }}
      >
        <HeroSection />
      </div>

      {/* Scrolly overlay — removed from DOM once intro is complete */}
      {!introComplete && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-10 overflow-y-scroll scrolly-hidden-bar"
          style={{
            pointerEvents: revealStarted ? "none" : "auto",
          }}
        >
          {/* Scroll runway: STEPS × 100vh */}
          <div style={{ height: `${STEPS * 100}vh` }}>
            {/* Sticky dark overlay that slides up on reveal */}
            <motion.div
              style={{ y: overlayY }}
              className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#06080f]"
            >
              {/* Centered radial glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(79,70,229,0.07),transparent)]" />

              {/* Top wordmark */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/20">
                  AgentFish
                </span>
              </div>

              {/* Sentence layer */}
              <div className="relative h-full w-full">
                {SENTENCES.map((parts, idx) => (
                  <SentenceBlock
                    key={idx}
                    parts={parts}
                    opacity={sentenceAnimations[idx].opacity}
                    y={sentenceAnimations[idx].y}
                  />
                ))}
              </div>

              {/* Scroll indicator */}
              <ScrollIndicator opacity={indicatorOpacity} bounceY={bounceY} />

              {/* Progress bar at bottom edge */}
              <ProgressBar progress={progressValue} />
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
