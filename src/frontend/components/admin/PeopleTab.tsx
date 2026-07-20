import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button, Spinner } from '../../../ui'
import { FormError } from '../FormError'
import { getAdminRegistrations, type AdminRegistration } from '../../../backend/queries/admin'
import { formatDateTime } from '../../lib/format'
import { buildCsv, downloadCsv } from '../../lib/csv'

export function PeopleTab({ hackathonId }: { hackathonId: string }) {
  const [rows, setRows] = useState<AdminRegistration[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setRows(null)
    setError(null)
    getAdminRegistrations(hackathonId)
      .then((data) => {
        if (active) setRows(data)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load registrations')
      })
    return () => {
      active = false
    }
  }, [hackathonId])

  function handleExport() {
    if (!rows) return
    const csv = buildCsv(
      ['Name', 'Country', 'Email', 'Team', 'Registered at'],
      rows.map((row) => [
        row.full_name ?? '',
        row.country ?? '',
        row.email ?? '',
        row.team_name ?? '',
        formatDateTime(row.registered_at),
      ]),
    )
    downloadCsv('registrations.csv', csv)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          People {rows ? `(${rows.length})` : ''}
        </h2>
        <Button
          size="sm"
          variant="secondary"
          icon={Download}
          onClick={handleExport}
          disabled={!rows || rows.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {error ? (
        <FormError message={error} />
      ) : rows === null ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted">No registrations yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-foreground">Country</th>
                <th className="px-4 py-3 font-medium text-foreground">Email</th>
                <th className="px-4 py-3 font-medium text-foreground">Team</th>
                <th className="px-4 py-3 font-medium text-foreground">Registered</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.profile_id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-foreground">{row.full_name ?? 'Unnamed'}</td>
                  <td className="px-4 py-3 text-muted">{row.country ?? ''}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{row.email ?? ''}</td>
                  <td className="px-4 py-3 text-muted">{row.team_name ?? 'No team'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {formatDateTime(row.registered_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
