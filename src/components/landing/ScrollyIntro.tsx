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
import { ChevronsDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SentencePart = { text: string; emphasized?: boolean };

const SENTENCES: SentencePart[][] = [
  [
    { text: "In Canada's " },
    { text: "2 trillion-dollar", emphasized: true },
    { text: " trade era, small and medium businesses fuel " },
    { text: "37.9%", emphasized: true },
    { text: " of all export value. 💵" },
  ],
  [
    { text: "Canada has a wide network through " },
    { text: "15 free trade agreements", emphasized: true },
    { text: " with " },
    { text: "51 countries", emphasized: true },
    { text: ", giving access to more than " },
    { text: "1.5 billion consumers", emphasized: true },
    { text: ". 🗺️" },
  ],
  [
    { text: "Canada commits to " },
    { text: "net-zero emissions by 2050", emphasized: true },
    { text: ", with shipping policies reflecting those commitments via " },
    { text: "green shipping corridors", emphasized: true },
    { text: " with lower carbon emissions. 🌿" },
  ],
  [
    { text: "Embark 🚢", emphasized: true },
    {
      text: "  and discover new connections on this global, sustainable trade journey...",
    },
  ],
];

// Scroll runway breakdown (total = STEPS viewports):
//   Step 0 → blank white screen
//   Step 1 → sentence 1 fades in (previous fades out)
//   Step 2 → sentence 2 fades in
//   Step 3 → sentence 3 fades in
//   Step 4 → sentence 4 ("Embark") fades in
//   Step 5 → reveal trigger (overlay slides up)
const STEPS = SENTENCES.length + 2; // 6
const FADE_WINDOW = 0.4; // fraction of one step used for the fade transition

function SentenceBlock({
  parts,
  opacity,
  y,
}: {
  parts: SentencePart[];
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

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
    <p
      ref={ref}
      style={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center px-8 text-center text-xl font-light leading-snug text-zinc-900 sm:text-2xl"
    >
      {parts.map((part, i) =>
        part.emphasized ? (
          <strong key={i} className="font-bold italic">
            {part.text}
          </strong>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function ScrollIndicator({ opacity, bounceY }: { opacity: MotionValue<number>; bounceY: MotionValue<number> }) {
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
      className="absolute bottom-10 flex flex-col items-center gap-1 text-zinc-400"
    >
      <ChevronsDown className="h-7 w-7" strokeWidth={1.5} />
    </div>
  );
}

export function ScrollyIntro() {
  const [introComplete, setIntroComplete] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);

  // Refs mirror state so async animation callbacks always see the latest values
  const hasScrolledRef = useRef(false);
  const revealStartedRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayY = useMotionValue("0%");

  const { scrollYProgress } = useScroll({ container: containerRef });

  const s = 1 / STEPS; // size of one step in progress units (≈ 0.167)
  const fw = s * FADE_WINDOW; // fade window width in progress units

  // Each sentence fades IN at its step start and fades OUT at the next step start.
  // The last sentence ("Embark") only fades in — it stays visible through the reveal.
  // Keyframes: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
  //   opacity: [0, 1, 1, 0]  |  y: [28, 0, 0, -28]

  const opacity0 = useTransform(
    scrollYProgress,
    [s * 1, s * 1 + fw, s * 2, s * 2 + fw],
    [0, 1, 1, 0],
  );
  const y0 = useTransform(
    scrollYProgress,
    [s * 1, s * 1 + fw, s * 2, s * 2 + fw],
    [28, 0, 0, -28],
  );

  const opacity1 = useTransform(
    scrollYProgress,
    [s * 2, s * 2 + fw, s * 3, s * 3 + fw],
    [0, 1, 1, 0],
  );
  const y1 = useTransform(
    scrollYProgress,
    [s * 2, s * 2 + fw, s * 3, s * 3 + fw],
    [28, 0, 0, -28],
  );

  const opacity2 = useTransform(
    scrollYProgress,
    [s * 3, s * 3 + fw, s * 4, s * 4 + fw],
    [0, 1, 1, 0],
  );
  const y2 = useTransform(
    scrollYProgress,
    [s * 3, s * 3 + fw, s * 4, s * 4 + fw],
    [28, 0, 0, -28],
  );

  // Last sentence: only fades in, stays visible
  const opacity3 = useTransform(scrollYProgress, [s * 4, s * 4 + fw], [0, 1]);
  const y3 = useTransform(scrollYProgress, [s * 4, s * 4 + fw], [28, 0]);

  const sentenceAnimations = [
    { opacity: opacity0, y: y0 },
    { opacity: opacity1, y: y1 },
    { opacity: opacity2, y: y2 },
    { opacity: opacity3, y: y3 },
  ];

  // Scroll indicator: visible on the blank screen, fades as the user scrolls
  const indicatorOpacity = useTransform(
    scrollYProgress,
    [0, s * 0.5],
    [1, 0],
  );

  // Reveal: fires when scroll reaches step 5 (≈ 0.833 progress)
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
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1],
          onComplete: () => setIntroComplete(true),
        });
      }
    });
  // scrollYProgress, overlayY, s are stable references — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bounce animation for scroll indicator — starts 2 s after load if not yet scrolled
  const bounceY = useMotionValue(0);
  useEffect(() => {
    if (hasScrolled) return;
    const timeout = setTimeout(() => {
      const loop = () => {
        animate(bounceY, [0, 10, 0], {
          duration: 0.9,
          ease: "easeInOut",
          onComplete: () => {
            // Use ref so the callback sees the latest value, not a stale closure
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
          className="fixed inset-0 z-10 overflow-y-scroll"
          style={{
            scrollbarWidth: "none",
            // Disable pointer events on the runway once the reveal starts so the
            // HeroSection beneath can receive interactions during the slide-up.
            pointerEvents: revealStarted ? "none" : "auto",
          }}
        >
          {/* Scroll runway: STEPS × 100vh */}
          <div style={{ height: `${STEPS * 100}vh` }}>
            {/* Sticky white overlay that slides up on reveal */}
            <motion.div
              style={{ y: overlayY }}
              className="sticky top-0 flex h-screen w-full items-center justify-center bg-white"
            >
              {/* Sentence layer */}
              <div className="relative h-full w-full max-w-3xl mx-auto">
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
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
