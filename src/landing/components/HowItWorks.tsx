const STEPS = [
  {
    title: 'Pick a track',
    desc: 'Choose from six tracks that match your skills, or jump into something new.',
  },
  {
    title: 'Register and team up',
    desc: 'Sign up solo or with a squad. We help you find teammates when you need them.',
  },
  {
    title: 'Build for 48 hours',
    desc: 'Get the prompt, then design, code, and ship a working prototype against the clock.',
  },
  {
    title: 'Submit and win',
    desc: 'Present to the judges. Winners take the prize pool and the spotlight.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From idea to demo in one weekend.
          </h2>
        </div>

        <ol className="grid gap-px overflow-hidden rounded border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-4 bg-background p-8">
              <span className="font-mono text-sm font-semibold text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
