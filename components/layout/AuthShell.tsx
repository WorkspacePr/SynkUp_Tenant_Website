"use client";

import { useEffect, useRef } from "react";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icons";
import { cn } from "@/utils";
import type { HeroCardDefinition } from "@/types/onboarding";

interface AuthShellProps {
  title: string;
  description: string;
  cards?: HeroCardDefinition[];
  children?: React.ReactNode;
  visual?: "governance" | "ignition";
}

export function AuthShell({
  title,
  description,
  cards,
  children,
  visual,
}: AuthShellProps) {
  return (
    <aside className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#138e85_0%,#149f93_45%,#164458_100%)] px-8 py-8 text-white lg:block lg:px-12 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="relative flex h-full flex-col">
        <div className="text-2xl font-extrabold tracking-[-0.04em]">SynkUp</div>
        <div className="mt-16 max-w-full space-y-6 lg:mt-26">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.06em] text-balance lg:text-[3.6rem] lg:leading-[1.06]">
            {title}
          </h1>
          <p className="max-w-lg text-xl leading-8 text-white/84">{description}</p>
        </div>

        {cards?.length ? (
          <div className="mt-12 space-y-4 lg:mt-14">
            {cards.map((card, index) => (
              <div key={`${card.title}-${index}`}>
                <Card className="flex items-start gap-4 rounded-[1.35rem] border-white/12 bg-white/72 p-5 text-secondary backdrop-blur-sm">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-[0_12px_26px_-18px_rgba(15,23,42,0.65)]">
                    <Icon name={card.icon} className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold tracking-[-0.03em]">{card.title}</h2>
                    <p className="text-sm leading-6 text-secondary/75">{card.description}</p>
                  </div>
                </Card>
                {index < cards.length - 1 ? (
                  <div className="ml-7 h-7 w-px bg-white/25" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {visual === "governance" ? <GovernanceVisual /> : null}

        {visual === "ignition" ? <IgnitionVisual /> : null}

        {children ? <div className={cn("mt-auto")}>{children}</div> : null}
      </div>
    </aside>
  );
}

function GovernanceVisual() {
  const frameRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 50, y: 45, scale: 1, rotateX: 0, rotateY: 0, opacity: 0.45 });
  const currentRef = useRef({ x: 50, y: 45, scale: 1, rotateX: 0, rotateY: 0, opacity: 0.45 });

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      current.scale += (target.scale - current.scale) * 0.08;
      current.rotateX += (target.rotateX - current.rotateX) * 0.08;
      current.rotateY += (target.rotateY - current.rotateY) * 0.08;
      current.opacity += (target.opacity - current.opacity) * 0.08;

      if (frameRef.current) {
        frameRef.current.style.transform = `perspective(1200px) rotateX(${current.rotateX}deg) rotateY(${current.rotateY}deg)`;
      }

      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle at ${current.x}% ${current.y}%, rgba(45,212,191,${current.opacity}), transparent 18%), linear-gradient(135deg,#425569,#1b2535 52%,#334155)`;
        glowRef.current.style.transform = `scale(${current.scale})`;
      }

      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - bounds.left) / bounds.width) * 100;
    const py = ((event.clientY - bounds.top) / bounds.height) * 100;
    const centeredX = (px - 50) / 50;
    const centeredY = (py - 50) / 50;

    targetRef.current = {
      x: Math.max(18, Math.min(82, px)),
      y: Math.max(22, Math.min(78, py)),
      scale: 1.035,
      rotateX: centeredY * -4,
      rotateY: centeredX * 6,
      opacity: 0.58,
    };
  }

  function handleLeave() {
    targetRef.current = {
      x: 50,
      y: 45,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      opacity: 0.45,
    };
  }

  return (
    <div className="relative mt-10 hidden rounded-[1.2rem] border border-white/18 bg-[linear-gradient(150deg,rgba(19,33,52,0.55),rgba(18,95,104,0.2))] p-4 shadow-[0_30px_50px_-36px_rgba(0,0,0,0.65)] lg:block">
      <div
        ref={frameRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="transform-gpu transition-transform duration-300 ease-out"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative overflow-hidden rounded-[0.95rem]">
          <div ref={glowRef} className="aspect-4/2 will-change-transform" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_35%,rgba(255,255,255,0.02))]" />
        </div>
      </div>
      <div className="absolute bottom-0 -right-3 max-w-52 rounded-tl-2xl bg-white p-4 text-sm italic leading-6 text-secondary shadow-lg">
        {
          '"Precision in governance ensures the scalability of the entire architectural ecosystem."'
        }
      </div>
    </div>
  );
}

function IgnitionVisual() {
  return (
    <div className="relative mt-10 hidden aspect-square max-w-92 overflow-hidden bg-[linear-gradient(180deg,rgba(7,127,122,0.28),rgba(11,84,91,0.52))] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(45,212,191,0.14),transparent_20%)]" />

      <div className="absolute left-1/2 top-[54%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[linear-gradient(180deg,rgba(3,23,29,0.95),rgba(2,15,21,0.98))] shadow-[0_20px_44px_-24px_rgba(0,0,0,0.75)]" />
      <div className="absolute left-1/2 top-[54%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[linear-gradient(180deg,rgba(6,48,56,0.9),rgba(3,22,29,0.95))]" />
      <div className="absolute left-1/2 top-[54%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[linear-gradient(180deg,rgba(10,72,79,0.82),rgba(5,35,42,0.92))]" />
      <div className="absolute left-1/2 top-[54%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[radial-gradient(circle_at_50%_48%,rgba(30,212,190,0.92),rgba(8,93,95,0.9)_48%,rgba(3,26,33,0.98)_100%)] shadow-[0_0_42px_rgba(45,212,191,0.4)]" />

      <div className="absolute left-1/2 top-[54%] h-60 w-60 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-cyan-100/6" />
      <div className="absolute left-1/2 top-[54%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-cyan-100/6" />

      <div className="absolute left-[23%] top-[46%] h-px w-14 bg-[linear-gradient(90deg,transparent,rgba(112,255,233,0.28),transparent)]" />
      <div className="absolute right-[23%] top-[58%] h-px w-16 bg-[linear-gradient(90deg,transparent,rgba(112,255,233,0.24),transparent)]" />
      <div className="absolute left-[42%] top-[30%] h-14 w-px bg-[linear-gradient(180deg,transparent,rgba(112,255,233,0.22),transparent)]" />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.02)_52%,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" />

      <div className="absolute bottom-5 right-5 rounded-full border border-white/10 bg-[rgba(7,44,51,0.72)] px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-cyan-50/90">
        Deployment Ready
      </div>
    </div>
  );
}
