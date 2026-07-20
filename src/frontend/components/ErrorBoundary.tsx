import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../../ui'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Top level boundary so a render crash shows a calm on brand fallback with a
 * way to reload, never a blank white screen. React logs the underlying error
 * to the console for diagnostics.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Intentionally empty. React already reports the error to the console.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-muted">
            An unexpected error occurred. Reloading the page usually fixes it.
          </p>
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
        </div>
      )
    }
    return this.props.children
  }
}
