import { Paw } from './Doodles'

export function PaperLoader({ label = 'Finding your things…' }: { label?: string }) {
  return (
    <div role="status" className="text-mauve grid min-h-[60dvh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Paw
              key={i}
              className="h-5 w-5 animate-pulse"
              style={{ animationDelay: `${i * 220}ms`, transform: `rotate(${i % 2 ? 12 : -12}deg)` }}
            />
          ))}
        </div>
        <p className="hand text-xl">{label}</p>
      </div>
    </div>
  )
}
