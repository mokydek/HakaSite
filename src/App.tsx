/*
 * TEMPORARY style guide screen.
 * Renders every design system primitive for visual verification only. It will
 * be removed in a later phase once real pages and routing exist. Do not build
 * features on top of this file or link to it.
 */
import { useMemo, type ReactNode } from 'react'
import { ArrowRight, Inbox, Plus } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Container,
  Countdown,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from './ui'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function App() {
  // About ninety seconds from load, used to exercise the Countdown primitive.
  const countdownTarget = useMemo(() => new Date(Date.now() + 90_000).toISOString(), [])

  return (
    <Container className="flex flex-col gap-12 py-16">
      <PageHeader
        title="Style guide"
        description="Temporary screen for visual verification of the design system. Removed in a later phase."
        actions={<Button icon={Plus}>New action</Button>}
      />

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" icon={ArrowRight}>
            With icon
          </Button>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="primary">
            Small primary
          </Button>
          <Button size="sm" variant="secondary">
            Small secondary
          </Button>
          <Button size="sm" variant="ghost">
            Small ghost
          </Button>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Full name" placeholder="Ada Lovelace" />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            defaultValue="not an address"
            error="Enter a valid email address"
          />
          <Select label="Track" defaultValue="web">
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="ai">Artificial intelligence</option>
            <option value="hardware">Hardware</option>
          </Select>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="demo_standalone">Standalone label</Label>
            <Input id="demo_standalone" placeholder="Bound to a Label primitive" />
          </div>
          <Textarea
            className="sm:col-span-2"
            label="Project summary"
            placeholder="Describe what you are building"
            rows={4}
          />
        </div>
      </Section>

      <Section title="Card">
        <Card className="flex flex-col gap-2">
          <h3 className="font-display text-base font-semibold text-foreground">Card title</h3>
          <p className="text-sm text-muted">
            A card uses a white background, a one pixel border, square corners, and generous padding
            with no shadow.
          </p>
        </Card>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Open</Badge>
          <Badge>Live</Badge>
          <Badge variant="outline">Draft</Badge>
          <Badge variant="outline">Closed</Badge>
        </div>
      </Section>

      <Section title="Countdown">
        <Countdown target={countdownTarget} />
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={Inbox}
          title="No submissions yet"
          description="Projects will appear here once teams submit their work."
          action={
            <Button variant="secondary" size="sm">
              Refresh
            </Button>
          }
        />
      </Section>

      <Section title="Spinner">
        <div className="flex items-center gap-3">
          <Spinner />
          <Spinner size={20} />
          <span className="text-sm text-muted">Loading</span>
        </div>
      </Section>
    </Container>
  )
}

export default App
