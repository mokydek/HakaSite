import { useParams } from 'react-router-dom'
import { PageHeader } from '../../ui'

/** Placeholder case detail page. Reads the caseId route param. */
export default function CaseDetail() {
  const { caseId } = useParams()
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Case detail"
        description="Placeholder case view. The real prompt appears once cases are revealed."
      />
      <p className="text-sm text-muted">
        Case id <span className="font-mono text-foreground">{caseId}</span>
      </p>
    </div>
  )
}
