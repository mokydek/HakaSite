interface AboutProps {
  longDescription: string | null
  rules: string | null
}

export function About({ longDescription, rules }: AboutProps) {
  if (!longDescription && !rules) return null
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">About</h2>
      <div className="mt-8 flex max-w-2xl flex-col gap-10">
        {longDescription ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
            {longDescription}
          </p>
        ) : null}
        {rules ? (
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base font-semibold text-foreground">Rules</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
              {rules}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
