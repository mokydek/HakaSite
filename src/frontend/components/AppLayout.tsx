import { Outlet } from 'react-router-dom'
import { Container } from '../../ui'
import { Navbar } from './Navbar'

/**
 * Shell for authenticated pages: the Navbar, then a Container that wraps the
 * routed Outlet. Routed pages render their content directly, the Container
 * here owns the page width so pages do not double wrap.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-10">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
