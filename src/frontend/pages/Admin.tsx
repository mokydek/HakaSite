import { PageHeader } from '../../ui'

/** Placeholder admin page, guarded by RequireRole organizer. */
export default function Admin() {
  return (
    <PageHeader
      title="Admin"
      description="Placeholder organizer dashboard. Visible to organizers only. Real controls arrive in a later phase."
    />
  )
}
