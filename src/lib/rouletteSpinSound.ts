/** Som sintético de roleta (Web Audio) — sem arquivo externo. */
let ctx: AudioContext | null = null
let gain: GainNode | null = null
let source: AudioBufferSourceNode | null = null
let tickId: ReturnType<typeof setInterval> | null = null
let tickOsc: OscillatorNode | null = null
let tickGain: GainNode | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

function stopNodes() {
  try {
    source?.stop()
  } catch {
    /* already stopped */
  }
  source = null
  if (tickId) clearInterval(tickId)
  tickId = null
  try {
    tickOsc?.stop()
  } catch {
    /* noop */
  }
  tickOsc = null
  tickGain = null
  if (gain && ctx) {
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
  }
}

export function startRouletteSpinSound() {
  const audio = getCtx()
  if (!audio) return

  void audio.resume()
  stopNodes()

  const bufferSize = Math.floor(audio.sampleRate * 1.5)
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    brown = (brown + 0.05 * white) / 1.05
    data[i] = brown * 4
  }

  source = audio.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 320
  filter.Q.value = 1.2

  gain = audio.createGain()
  gain.gain.value = 0
  gain.gain.setTargetAtTime(0.22, audio.currentTime, 0.06)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  source.start()

  tickOsc = audio.createOscillator()
  tickGain = audio.createGain()
  tickOsc.type = 'triangle'
  tickOsc.frequency.value = 1200
  tickGain.gain.value = 0
  tickOsc.connect(tickGain)
  tickGain.connect(audio.destination)
  tickOsc.start()

  let tickOn = false
  tickId = setInterval(() => {
    if (!tickGain || !audio) return
    tickOn = !tickOn
    tickGain.gain.setTargetAtTime(tickOn ? 0.04 : 0, audio.currentTime, 0.004)
    if (tickOsc) tickOsc.frequency.value = 900 + Math.random() * 600
  }, 45)
}

export function stopRouletteSpinSound() {
  stopNodes()
}
