import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="hand text-mauve text-3xl">this page fell off the corkboard.</p>
        <Link to="/home" className="mt-4 inline-block font-semibold underline underline-offset-4">
          Back home
        </Link>
      </div>
    </main>
  )
}
