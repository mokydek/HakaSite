import { Link } from 'react-router-dom'

interface PublicFooterProps {
  name: string
  year: number
}

export function PublicFooter({ name, year }: PublicFooterProps) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted">
          {name} {year}
        </p>
        <Link to="/signup" className="text-sm font-medium text-accent">
          Sign up
        </Link>
      </div>
    </footer>
  )
}
