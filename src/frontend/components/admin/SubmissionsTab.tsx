import { Fragment, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { Button, Spinner } from '../../../ui'
import { FormError } from '../FormError'
import { getAdminSubmissions, type AdminSubmission } from '../../../backend/queries/admin'
import type { Json } from '../../../backend/types'
import { formatDateTime } from '../../lib/format'
import { buildCsv, downloadCsv } from '../../lib/csv'

interface LinkItem {
  label: string
  url: string
}

function parseLinks(value: Json): LinkItem[] {
  if (!Array.isArray(value)) return []
  const result: LinkItem[] = []
  for (const item of value) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const url = typeof item.url === 'string' ? item.url : ''
      if (url) result.push({ label: typeof item.label === 'string' ? item.label : url, url })
    }
  }
  return result
}

export function SubmissionsTab({ hackathonId }: { hackathonId: string }) {
  const [rows, setRows] = useState<AdminSubmission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    setRows(null)
    setError(null)
    getAdminSubmissions(hackathonId)
      .then((data) => {
        if (active) setRows(data)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load submissions')
      })
    return () => {
      active = false
    }
  }, [hackathonId])

  function handleExport() {
    if (!rows) return
    const csv = buildCsv(
      ['Team', 'Case', 'Repository', 'Demo', 'Description', 'Submitted by', 'Updated at'],
      rows.map((row) => [
        row.team_name,
        row.case_title ?? 'General',
        row.repo_url ?? '',
        row.demo_url ?? '',
        row.description ?? '',
        row.submitted_by_name ?? '',
        formatDateTime(row.updated_at),
      ]),
    )
    downloadCsv('submissions.csv', csv)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Submissions {rows ? `(${rows.length})` : ''}
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
        <p className="text-sm text-muted">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-foreground">Team</th>
                <th className="px-4 py-3 font-medium text-foreground">Case</th>
                <th className="px-4 py-3 font-medium text-foreground">Repository</th>
                <th className="px-4 py-3 font-medium text-foreground">Demo</th>
                <th className="px-4 py-3 font-medium text-foreground">Updated</th>
                <th className="px-4 py-3 font-medium text-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const links = parseLinks(row.files)
                const isOpen = expanded === index
                return (
                  <Fragment key={`${row.team_name}-${index}`}>
                    <tr className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 text-foreground">{row.team_name}</td>
                      <td className="px-4 py-3 text-muted">{row.case_title ?? 'General'}</td>
                      <td className="px-4 py-3">
                        {row.repo_url ? (
                          <a
                            href={row.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-accent"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.demo_url ? (
                          <a
                            href={row.demo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-accent"
                          >
                            Open
                          </a>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {formatDateTime(row.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : index)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-foreground"
                        >
                          {isOpen ? 'Hide' : 'View'}
                          {isOpen ? (
                            <ChevronUp size={16} strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-b border-border bg-surface last:border-b-0">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-foreground">Description</span>
                              <p className="whitespace-pre-line text-sm text-muted">
                                {row.description ?? 'No description provided.'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-foreground">
                                Submitted by
                              </span>
                              <span className="text-sm text-muted">
                                {row.submitted_by_name ?? 'Unknown'}
                              </span>
                            </div>
                            {links.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-foreground">Links</span>
                                <ul className="flex flex-col gap-1">
                                  {links.map((link, linkIndex) => (
                                    <li key={`${link.url}-${linkIndex}`}>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-accent"
                                      >
                                        {link.label}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
