import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { ContentBody } from '../../types/content'

export const noteColors: Record<NonNullable<ContentBody['color']>, string> = {
  pink: '#f9c6d8',
  petal: '#ffdce8',
  butter: '#fff0b8',
  lavender: '#e2d4f5',
  sky: '#d6e8f7',
  sage: '#dbe7cc',
}

interface Props {
  children: ReactNode
  color?: ContentBody['color']
  rotate?: number
  className?: string
  onClick?: () => void
  label?: string
}

/** A square sticky note with a soft curl shadow. */
export function StickyNote({ children, color = 'pink', rotate = 0, className = '', onClick, label }: Props) {
  const Tag = onClick ? motion.button : motion.div
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      aria-label={label}
      onClick={onClick}
      initial={{ rotate }}
      whileHover={{ rotate: rotate * 0.4, y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`relative flex aspect-square flex-col p-4 text-left ${className}`}
      style={{
        backgroundColor: noteColors[color],
        boxShadow: '0 1px 1px rgb(58 48 52 / .08), 4px 10px 16px -10px rgb(58 48 52 / .35)',
        backgroundImage: 'linear-gradient(170deg, rgb(255 255 255 / .35), transparent 40%)',
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-5 bg-black/[0.03]" />
      {children}
    </Tag>
  )
}
