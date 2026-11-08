/**
 * An original stencil trident + anchor mark. Deliberately NOT the official
 * Special Warfare insignia, which is a protected military emblem.
 */
export function Trident({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="square">
      <circle cx="60" cy="60" r="55" strokeWidth="2" strokeDasharray="3 5" opacity=".6" />
      {/* Anchor */}
      <path d="M60 30v66M44 42h32" />
      <path d="M30 76c4 14 16 22 30 22s26-8 30-22" />
      <path d="M24 80l6-6 6 7M96 80l-6-6-6 7" strokeWidth="4" />
      {/* Trident */}
      <path d="M60 10v26M42 16v14c0 6 8 8 18 8s18-2 18-8V16" />
      <path d="M60 6l-4 8h8ZM42 12l-4 8h8ZM78 12l-4 8h8Z" fill="currentColor" strokeWidth="1" />
    </svg>
  )
}
