/**
 * Synthesized ocean: filtered noise whose volume swells like waves rolling
 * in. No audio files. Must be started from a tap.
 */
export class OceanSound {
  private ctx: AudioContext | null = null

  get playing() {
    return this.ctx?.state === 'running'
  }

  async start() {
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    if (nav.audioSession) nav.audioSession.type = 'playback'
    if (this.ctx) {
      await this.ctx.resume()
      return
    }
    const ctx = new AudioContext()
    this.ctx = ctx

    const len = ctx.sampleRate * 4
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    // Brown-ish noise: deeper, more like surf than hiss.
    let last = 0
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
      data[i] = last * 3.5
    }

    const master = ctx.createGain()
    master.gain.value = 0.7
    master.connect(ctx.destination)

    // Two wave layers with different swell rates so it never feels looped.
    for (const { rate, cutoff, depth, delay } of [
      { rate: 0.075, cutoff: 700, depth: 0.45, delay: 0 },
      { rate: 0.11, cutoff: 1600, depth: 0.25, delay: 1.7 },
    ]) {
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = cutoff
      const swell = ctx.createGain()
      swell.gain.value = depth
      const lfo = ctx.createOscillator()
      lfo.frequency.value = rate
      const lfoDepth = ctx.createGain()
      lfoDepth.gain.value = depth * 0.9
      lfo.connect(lfoDepth).connect(swell.gain)
      src.connect(lp).connect(swell).connect(master)
      src.start(ctx.currentTime, delay)
      lfo.start(ctx.currentTime + delay)
    }
  }

  stop() {
    void this.ctx?.suspend()
  }

  dispose() {
    void this.ctx?.close()
    this.ctx = null
  }
}
