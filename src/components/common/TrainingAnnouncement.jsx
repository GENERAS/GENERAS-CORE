import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, X, Flame } from 'lucide-react';

const DISMISS_KEY = 'generas-core:training-banner';

/**
 * Animated announcement banner for a newly uploaded training or a new
 * mentorship batch. Dismissal is remembered in localStorage against a version
 * key, so bumping `version` re-shows the banner after an update instead of
 * silently hiding the notice forever.
 */
export default function TrainingAnnouncement({
  version = '2026-01',
  title = 'New Training Available',
  message = 'A new training has just been uploaded. Check it out now!',
  urgency = 'Limited spots available for this mentorship batch',
  ctaLabel = 'Check it out now',
  to = '/service',
}) {
  const storageKey = `${DISMISS_KEY}:${version}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch {
      /* storage unavailable (private mode) - dismiss for this visit only */
    }
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="animate-banner-in relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10 bg-[linear-gradient(110deg,#2E1B28_0%,#5C3B54_32%,#8A5C7F_58%,#B45309_100%)] bg-[length:200%_200%] animate-banner-gradient"
    >
      {/* light sweep */}
      <span
        aria-hidden="true"
        className="animate-banner-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/15 blur-md"
      />

      {/* floating sparkles */}
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="animate-banner-sparkle pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-yellow-300"
          style={{
            top: `${12 + i * 17}%`,
            left: `${8 + i * 19}%`,
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="animate-banner-badge inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-900">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-900 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-900" />
              </span>
              New
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-yellow-200/90">
              <Sparkles className="h-3.5 w-3.5" />
              Mentorship update
            </span>
          </div>

          <h2 className="mt-2 text-xl font-extrabold leading-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-white/85 sm:text-base">{message}</p>

          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold text-amber-200 ring-1 ring-amber-300/30">
            <Flame className="h-3.5 w-3.5" />
            {urgency}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={to}
            className="animate-banner-pulse group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-gray-900 transition-transform duration-200 hover:scale-[1.03] active:scale-95 lg:flex-none"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="rounded-xl border border-white/20 p-3 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* scarcity bar */}
      <div className="relative z-10 h-1 w-full overflow-hidden bg-white/10">
        <span className="animate-banner-bar absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400" />
      </div>
    </aside>
  );
}