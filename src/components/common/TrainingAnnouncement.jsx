import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, X, Flame } from 'lucide-react';

const DISMISS_KEY = 'generas-core:training-banner';

/**
 * Compact announcement banner for a newly uploaded training or a new
 * mentorship batch.
 *
 * Space is the scarce resource here, so it ships collapsed on phones: one slim
 * row with the title, a short CTA and the dismiss button, which is roughly the
 * height of a nav bar. Tapping the title expands the detail in place. On wider
 * screens it starts expanded, because there is room for it.
 *
 * Dismissal is remembered in localStorage against a version key, so bumping
 * `version` re-shows the banner after an update instead of hiding the notice
 * forever.
 */
export default function TrainingAnnouncement({
  version = '2026-01',
  title = 'New Training Available',
  message = 'A new training has just been uploaded. Check it out now!',
  urgency = 'Limited spots available for this mentorship batch',
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

  // Expanded by default where there is room, collapsed on phones.
  const [open, setOpen] = useState(() => {
    try {
      return window.matchMedia('(min-width: 640px)').matches;
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
      className="animate-banner-in relative overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10 bg-[linear-gradient(110deg,#2E1B28_0%,#5C3B54_35%,#8A5C7F_62%,#B45309_100%)] bg-[length:200%_200%] animate-banner-gradient"
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

      {/* Slim row: always visible, never more than one line on a phone */}
      <div className="relative z-10 flex items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <span className="animate-banner-badge inline-flex shrink-0 items-center gap-1.5 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-900">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-900 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gray-900" />
          </span>
          New
        </span>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <span className="truncate text-sm font-extrabold text-white">{title}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-yellow-200 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>

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

      {/* Detail: expands in place without adding a fixed block of empty space */}
      <div
        className={`relative z-10 grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 sm:px-4 sm:pb-3.5">
            <p className="text-xs leading-relaxed text-white/85 sm:text-sm">{message}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-200 ring-1 ring-amber-300/30 sm:text-xs">
              <Flame className="h-3.5 w-3.5" />
              {urgency}
            </p>
          </div>
        </div>
      </div>

      {/* scarcity bar */}
      <div className="relative z-10 h-0.5 w-full overflow-hidden bg-white/10">
        <span className="animate-banner-bar absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400" />
      </div>
    </aside>
  );
}