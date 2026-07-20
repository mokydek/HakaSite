interface PrizesProps {
  prizes: string
}

export function Prizes({ prizes }: PrizesProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Prizes</h2>
      <div className="mt-8 rounded border border-border bg-surface p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground sm:text-base">
          {prizes}
        </p>
      </div>
    </section>
  )
}
