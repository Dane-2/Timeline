import { SittingCat } from '../features/cat/SittingCat'

/** Placeholder for sections built in later phases. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center pt-12 text-center">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <div className="border-petal mt-6 w-full rounded-3xl border bg-white px-6 py-8">
        <SittingCat className="mx-auto h-14 w-16" />
        <p className="hand text-ink-soft mt-3 text-2xl">still putting this page together. check back soon.</p>
      </div>
    </div>
  )
}
