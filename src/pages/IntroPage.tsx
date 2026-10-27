import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, type CSSProperties } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { safeStorage, STORAGE_KEYS } from '@/lib/storage';
import { paths } from '@/lib/routes';

/**
 * Cinematic intro (C1 §2). Lightweight: CSS particles only, skippable from first paint.
 * `/` shows it on a browser's first visit (OQ-08 default); `/welcome` always shows it.
 */
export function IntroGate() {
  if (safeStorage.get(STORAGE_KEYS.introSeen)) return <Navigate to={paths.home} replace />;
  return <IntroPage />;
}

export default function IntroPage() {
  useDocumentTitle();
  const navigate = useNavigate();

  const enter = useCallback(() => {
    safeStorage.set(STORAGE_KEYS.introSeen, '1');
    navigate(paths.home);
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') enter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-ink px-6">
      <Glow />
      <Particles />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="font-display text-xl text-champagne italic sm:text-2xl"
        >
          Welcome, Amigos!
        </motion.p>

        <h1 className="mt-4 font-display text-[clamp(3.25rem,13vw,9.5rem)] leading-[0.92] font-semibold tracking-[0.06em] text-gold">
          <span className="text-gold-sheen animate-sheen block">KESH</span>
          <span className="text-gold-sheen animate-sheen block [animation-delay:0.65s]">SQUAD</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <p className="mt-6 max-w-sm text-lg text-mist">A place to connect, explore, share, and belong.</p>
          <p className="mt-2 text-sm tracking-[0.3em] text-white/70">WATCH. TALK. CONNECT.</p>
        </motion.div>

        {/* Visible and usable from the first frame: no waiting for the animation. */}
        <button
          type="button"
          onClick={enter}
          autoFocus
          className="group relative mt-12 h-14 rounded-full border border-gold px-10 text-sm font-semibold tracking-[0.28em] text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
        >
          ENTER THE SQUAD
        </button>
        <p className="mt-4 text-xs text-muted">Press Enter to go in, or Esc to skip.</p>
      </div>
    </div>
  );
}

function Glow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          'radial-gradient(60% 45% at 50% 42%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.05) 40%, transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(245,215,110,0.06), transparent 70%)',
      }}
    />
  );
}

/** ~28 drifting gold motes, positions fixed per render; disabled by reduced-motion CSS. */
function Particles() {
  const motes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const r = (n: number) => ((seed * (n + 1)) % 1000) / 1000;
        return {
          left: `${r(1) * 100}%`,
          top: `${20 + r(2) * 75}%`,
          size: 1 + r(3) * 2.5,
          delay: `${r(4) * -14}s`,
          duration: `${10 + r(5) * 10}s`,
          dx: `${(r(6) - 0.5) * 60}px`,
          dy: `${-30 - r(7) * 80}px`,
          opacity: 0.25 + r(8) * 0.55,
        };
      }),
    [],
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {motes.map((m, i) => (
        <span
          key={i}
          className="animate-drift absolute rounded-full bg-champagne"
          style={
            {
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              animationDelay: m.delay,
              animationDuration: m.duration,
              boxShadow: '0 0 6px rgba(245,215,110,0.8)',
              '--dx': m.dx,
              '--dy': m.dy,
              '--particle-opacity': m.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
