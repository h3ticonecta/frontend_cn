let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playWolfTone(freq: number, durationMs: number, gain = 0.08): void {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + durationMs / 1000)
}

export function playSpinTick(): void {
  playWolfTone(220, 40, 0.04)
}

export function playWinChime(): void {
  playWolfTone(523, 120, 0.07)
  window.setTimeout(() => playWolfTone(659, 160, 0.06), 90)
}

export function playBonusFanfare(): void {
  playWolfTone(392, 200, 0.08)
  window.setTimeout(() => playWolfTone(494, 250, 0.07), 120)
}
