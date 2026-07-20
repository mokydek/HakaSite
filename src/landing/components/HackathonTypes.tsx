import { BrainCircuit, Globe, Blocks, Palette, Gamepad2, Cpu } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Track {
  icon: LucideIcon
  title: string
  desc: string
}

const TRACKS: Track[] = [
  {
    icon: BrainCircuit,
    title: 'AI / ML',
    desc: 'Models, agents, and data pipelines. Ship something genuinely intelligent.',
  },
  {
    icon: Globe,
    title: 'Web',
    desc: 'Full stack apps, tools, and platforms built for the browser.',
  },
  {
    icon: Blocks,
    title: 'Blockchain',
    desc: 'On chain apps, smart contracts, and decentralized protocols.',
  },
  {
    icon: Palette,
    title: 'Design / UX',
    desc: 'Interfaces, design systems, and experiences people love.',
  },
  {
    icon: Gamepad2,
    title: 'Gamedev',
    desc: 'Playable prototypes, novel mechanics, and interactive worlds.',
  },
  {
    icon: Cpu,
    title: 'Hardware / IoT',
    desc: 'Devices, sensors, and the firmware that ties them all together.',
  },
]

export function HackathonTypes() {
  return (
    <section id="tracks" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
              Tracks
            </p>
            <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Six tracks. Pick your arena.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-muted">
            Every hackathon runs across these tracks. Compete where you are
            strong, or jump into something new.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track) => {
            const Icon = track.icon
            return (
              <div
                key={track.title}
                className="flex flex-col gap-4 bg-background p-8 transition-colors hover:bg-surface"
              >
                <span className="grid h-11 w-11 place-items-center rounded border border-border text-accent">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {track.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{track.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
