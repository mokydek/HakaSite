const STATS = [
  { value: '12,000+', label: 'Builders' },
  { value: '240', label: 'Hackathons run' },
  { value: '$2.4M', label: 'Prize fund awarded' },
  { value: '60', label: 'Cities' },
]

export function Stats() {
  return (
    <section id="stats" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 bg-background px-6 py-10 text-center"
            >
              <span className="font-mono text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
