import { Fragment, type ReactNode } from 'react'

/**
 * Renders the small formatting language used in letters — blank line =
 * new paragraph, single newline = line break, **bold**, *italic* — into
 * React elements. Never uses innerHTML, so content can't inject markup.
 */
export function RichText({ text, className = '' }: { text: string | undefined | null; className?: string }) {
  if (!text) return null
  const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i} className="mb-[0.9em] last:mb-0">
          {p.split('\n').map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  )
}

function inline(line: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index))
    out.push(m[1] !== undefined ? <strong key={m.index}>{m[1]}</strong> : <em key={m.index}>{m[2]}</em>)
    last = m.index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}
