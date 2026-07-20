/**
 * Flat node network built from the theme tokens, so it adapts to light and dark
 * with no gradients or shadows. Decorative, hidden from assistive tech.
 */
export function HeroArt({ className }: { className?: string }) {
  const edges: Array<[number, number, number, number]> = [
    [70, 90, 190, 60],
    [190, 60, 250, 170],
    [250, 170, 360, 90],
    [360, 90, 420, 200],
    [70, 90, 120, 210],
    [120, 210, 250, 170],
    [120, 210, 100, 330],
    [100, 330, 220, 310],
    [220, 310, 250, 170],
    [220, 310, 350, 340],
    [350, 340, 420, 200],
    [220, 310, 190, 400],
  ]
  const nodes: Array<[number, number, number, boolean]> = [
    [70, 90, 5, false],
    [190, 60, 6, false],
    [360, 90, 5, false],
    [420, 200, 6, true],
    [120, 210, 7, false],
    [250, 170, 11, true],
    [100, 330, 5, false],
    [220, 310, 8, false],
    [350, 340, 6, true],
    [190, 400, 5, false],
  ]

  return (
    <svg
      viewBox="0 0 480 440"
      className={className}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <rect x="1" y="1" width="478" height="438" rx="2" className="fill-surface stroke-border" strokeWidth="2" />
      <g className="stroke-border" strokeWidth="1.5" strokeLinecap="round">
        {edges.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <circle cx="250" cy="170" r="22" className="fill-accent" opacity="0.12" />
      {nodes.map(([cx, cy, r, accent], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} className={accent ? 'fill-accent' : 'fill-foreground'} />
      ))}
    </svg>
  )
}
