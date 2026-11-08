/** The cat drawing. Tail sways and eyes blink with CSS, so it costs nothing. */
export type CatOutfit = 'rave' | 'beach' | 'seal'

export function SittingCat({ className = 'h-16 w-[4.5rem]', outfit }: { className?: string; outfit?: CatOutfit }) {
  return (
    <svg viewBox="0 0 80 72" className={`${className} drop-shadow-[0_3px_3px_rgb(58_48_52_/_0.18)]`} aria-hidden>
      <g style={{ transformOrigin: '58px 62px', animation: 'cat-tail 3.2s ease-in-out infinite' }}>
        <path d="M58 62c10 0 16-6 15-14-.5-4-4-5-5-2" fill="none" stroke="#8c6178" strokeWidth="5" strokeLinecap="round" />
      </g>
      <path d="M22 66c-3-14 2-27 18-27s21 13 18 27Z" fill="#fff5e9" stroke="#8c6178" strokeWidth="2.2" />
      <path d="M21 22 18 6l12 9M59 22l3-16-12 9" fill="#fff5e9" stroke="#8c6178" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M21.5 13 23 18M58.5 13 57 18" stroke="#f6b8ce" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="40" cy="28" rx="21" ry="17" fill="#fff5e9" stroke="#8c6178" strokeWidth="2.2" />
      <g style={{ transformOrigin: '40px 27px', animation: 'cat-blink 5s infinite' }}>
        <ellipse cx="32" cy="27" rx="2.2" ry="2.8" fill="#3a3034" />
        <ellipse cx="48" cy="27" rx="2.2" ry="2.8" fill="#3a3034" />
      </g>
      <path d="M38.5 32.5h3l-1.5 1.8Z" fill="#e98fb0" />
      <path d="M40 34.3c-1 2-3.5 2-4.5.7M40 34.3c1 2 3.5 2 4.5.7" fill="none" stroke="#8c6178" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="27" cy="33" rx="3.5" ry="2" fill="#f6b8ce" opacity=".6" />
      <ellipse cx="53" cy="33" rx="3.5" ry="2" fill="#f6b8ce" opacity=".6" />
      <path d="M33 66v-6M47 66v-6" stroke="#8c6178" strokeWidth="2" strokeLinecap="round" />
      {outfit === 'rave' && (
        <g>
          <path d="M23 24.5h34" stroke="#1a1020" strokeWidth="2" strokeLinecap="round" />
          <rect x="24.5" y="23" width="13" height="8.5" rx="3.5" fill="#1a1020" />
          <rect x="42.5" y="23" width="13" height="8.5" rx="3.5" fill="#1a1020" />
          <path d="M27 25.5l4 0M45 25.5l4 0" stroke="#ff2bd6" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {outfit === 'beach' && (
        <g>
          <path d="M26 13c0-9 28-9 28 0Z" fill="#f3d38a" stroke="#b8893f" strokeWidth="1.5" />
          <path d="M26 12.5h28" stroke="#ff6f91" strokeWidth="2.5" />
          <ellipse cx="40" cy="14" rx="25" ry="4" fill="#f3d38a" stroke="#b8893f" strokeWidth="1.5" />
          <circle cx="55" cy="11" r="2.2" fill="#ff6f91" />
        </g>
      )}
      {outfit === 'seal' && (
        <g>
          <path d="M19 19c0-13 9-16 21-16s21 3 21 16c-6-3-14-4-21-4s-15 1-21 4Z" fill="#2b3122" stroke="#7d8f52" strokeWidth="1.5" />
          <path d="M19 19c6-3 14-4 21-4s15 1 21 4" stroke="#3a4527" strokeWidth="3" fill="none" />
          <path d="M25 30.5l6 1M24 33.5l6 1M55 30.5l-6 1M56 33.5l-6 1" stroke="#3a4527" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}
