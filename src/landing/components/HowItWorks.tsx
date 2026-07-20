import { Send, Unlock, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { Card } from '../../ui'

interface Step {
  icon: LucideIcon
  label: string
  text: string
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    label: 'Register',
    text: 'Sign up and register for the hackathon in a minute.',
  },
  {
    icon: Users,
    label: 'Form a team or go solo',
    text: 'Build a team or compete on your own as a team of one.',
  },
  {
    icon: Unlock,
    label: 'Cases unlock',
    text: 'The challenge prompts appear at the set reveal time.',
  },
  {
    icon: Send,
    label: 'Submit',
    text: 'Ship your project before the deadline.',
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        How it works
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <Card key={step.label} className="flex flex-col gap-3">
              <Icon size={20} strokeWidth={2} aria-hidden="true" className="text-foreground" />
              <h3 className="font-display text-base font-semibold text-foreground">{step.label}</h3>
              <p className="text-sm text-muted">{step.text}</p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
