import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';

const DISMISS_KEY = 'generas-core:training-banner';

/**
 * Compact announcement banner for a newly uploaded training or a new
 * mentorship batch.
 *
 * Deliberately a single slim row (about nav-bar height) so it never eats a
 * screen on a phone: pulsing NEW dot, truncated title, short CTA and dismiss.
 * The supporting copy (what was uploaded, how many spots are left) lives where
 * it belongs instead of being hidden behind a toggle - the mentorship page
 * hero carries the spots message, and the training details sit on the page the
 * CTA links to.
 *
 * Dismissal is remembered in localStorage against a version key, so bumping
 * `version` re-shows the banner after an update instead of hiding the notice
 * forever.
 */
export default function TrainingAnnouncement({
  version = '2026-01',
  title = 'New Training Available',
  ctaLabel = 'Check it out',
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
      className="animate-banner-in relative overflow-hidden rounded-xl shadow-md ring-1 ring-white/10 bg-[linear-gradient(110deg,#2E1B28_0%,#5C3B54_35%,#8A5C7F_62%,#B45309_100%)] bg-[length:200%_200%] animate-banner-gradient"
    >
      <span
        aria-hidden="true"
        className="animate-banner-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/15 blur-md"
      />

      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="animate-banner-sparkle pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-yellow-300"
          style={{
            top: `${14 + i * 24}%`,
            left: `${10 + i * 26}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <span className="animate-banner-badge inline-flex shrink-0 items-center gap-1.5 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-900">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-900 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gray-900" />
          </span>
          New
        </span>

        <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">{title}</span>

        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-yellow-400 px-2.5 py-1.5 text-xs font-extrabold text-gray-900 transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-3.5 sm:py-2 sm:text-sm"
        >
          <span className="hidden sm:inline">{ctaLabel}</span>
          <span className="sm:hidden">Check</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded-lg border border-white/20 p-1.5 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative z-10 h-0.5 w-full overflow-hidden bg-white/10">
        <span className="animate-banner-bar absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400" />
      </div>
    </aside>
  );
}