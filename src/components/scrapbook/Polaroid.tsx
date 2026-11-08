import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { WashiTape, type TapeStyle } from './WashiTape'

interface Props {
  src?: string | null
  alt?: string
  caption?: ReactNode
  rotate?: number
  tape?: TapeStyle | null
  className?: string
  /** Shown when there is no image yet */
  placeholder?: ReactNode
}

export function Polaroid({ src, alt = '', caption, rotate = -3, tape = 'pink', className = '', placeholder }: Props) {
  return (
    <motion.figure
      initial={{ rotate }}
      whileHover={{ rotate: rotate * 0.3, y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className={`shadow-lifted relative bg-white p-3 pb-4 ${className}`}
    >
      {tape && <WashiTape variant={tape} className="-top-3 left-1/2 -translate-x-1/2" rotate={rotate > 0 ? -5 : 4} />}
      <div className="bg-petal/60 relative aspect-square overflow-hidden">
        {src ? (
          <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="text-mauve/70 grid h-full w-full place-items-center p-4 text-center">{placeholder}</div>
        )}
      </div>
      {caption && <figcaption className="hand text-ink mt-3 text-center text-xl leading-tight">{caption}</figcaption>}
    </motion.figure>
  )
}
