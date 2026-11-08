/**
 * A tiny original house groove synthesized live with the Web Audio API —
 * no audio files, no licensing. 128 BPM, four-on-the-floor kick, offbeat
 * hats, clap on 2 & 4, rolling bassline and filtered chord stabs over an
 * Am7 – Fmaj7 – C – G loop.
 *
 * Must be started from a tap (browsers block audio otherwise).
 */

export const BPM = 128
const STEP = 60 / BPM / 4 // one 16th note, in seconds
const LOOKAHEAD = 0.12
const TICK_MS = 25

// Bass roots and stab voicings (Hz) for each bar of the 4-bar loop
const progression = [
  { root: 55.0, stab: [220.0, 261.63, 329.63, 392.0] }, // Am7
  { root: 43.65, stab: [174.61, 220.0, 261.63, 329.63] }, // Fmaj7
  { root: 65.41, stab: [196.0, 261.63, 329.63, 392.0] }, // C
  { root: 49.0, stab: [196.0, 246.94, 293.66, 392.0] }, // G
]
const bassPattern = [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0] // 16ths that play bass
const bassOctave = [0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 2, 1, 0] // 0 = root, 1 = octave, 2 = fifth

export class HouseEngine {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private filter!: BiquadFilterNode
  private noise!: AudioBuffer
  private timer: number | null = null
  private step = 0
  private nextTime = 0
  private dropUntilStep = -1

  get playing() {
    return this.timer !== null
  }

  async start() {
    if (this.playing) return
    // Let it play with the iPhone's silent switch on (Safari 16.4+).
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    if (nav.audioSession) nav.audioSession.type = 'playback'

    if (!this.ctx) {
      const ctx = new AudioContext()
      this.ctx = ctx
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -14
      comp.ratio.value = 4
      this.filter = ctx.createBiquadFilter()
      this.filter.type = 'lowpass'
      this.filter.frequency.value = 18000
      this.master = ctx.createGain()
      this.master.gain.value = 0.55
      this.filter.connect(comp).connect(this.master).connect(ctx.destination)

      const len = ctx.sampleRate * 2
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = this.noise.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    }
    await this.ctx.resume()
    this.step = 0
    this.nextTime = this.ctx.currentTime + 0.08
    this.timer = window.setInterval(() => this.schedule(), TICK_MS)
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
    void this.ctx?.suspend()
  }

  dispose() {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
  }

  /** The "drop": a one-bar filter build with the kick pulled out, then everything slams back. */
  drop() {
    if (!this.ctx || !this.playing) return
    const now = this.ctx.currentTime
    const barLen = STEP * 16
    const f = this.filter.frequency
    f.cancelScheduledValues(now)
    f.setValueAtTime(350, now)
    f.exponentialRampToValueAtTime(18000, now + barLen)
    this.dropUntilStep = this.step + 16
    this.riser(now, barLen)
  }

  // -------------------------------------------------------------------------
  private schedule() {
    const ctx = this.ctx!
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime)
      this.nextTime += STEP
      this.step++
    }
  }

  private playStep(step: number, t: number) {
    const s = step % 16
    const bar = progression[Math.floor(step / 16) % progression.length]
    const building = step < this.dropUntilStep

    if (s % 4 === 0 && !building) this.kick(t)
    if (s === 4 || s === 12) this.clap(t)
    if (s % 4 === 2) this.hat(t, 0.22, 0.09) // open offbeat hat
    else if (s % 2 === 1) this.hat(t, 0.04, 0.04) // closed 16ths
    if (bassPattern[s] && !building) {
      const mult = [1, 2, 1.5][bassOctave[s]]
      this.bass(t, bar.root * mult)
    }
    if (s === 3 || s === 10) this.stab(t, bar.stab)
    if (step === this.dropUntilStep) this.crash(t)
  }

  private env(t: number, peak: number, decay: number) {
    const g = this.ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    return g
  }

  private noiseSource(t: number, dur: number) {
    const src = this.ctx!.createBufferSource()
    src.buffer = this.noise
    src.start(t, Math.random() * 0.5)
    src.stop(t + dur)
    return src
  }

  private kick(t: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(140, t)
    osc.frequency.exponentialRampToValueAtTime(44, t + 0.11)
    const g = this.env(t, 1, 0.38)
    osc.connect(g).connect(this.filter)
    osc.start(t)
    osc.stop(t + 0.4)
  }

  private clap(t: number) {
    const ctx = this.ctx!
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1400
    bp.Q.value = 0.9
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    for (const [offset, peak] of [[0, 0.5], [0.011, 0.45], [0.022, 0.4]] as const) {
      g.gain.exponentialRampToValueAtTime(peak, t + offset + 0.002)
      g.gain.exponentialRampToValueAtTime(0.05, t + offset + 0.009)
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    this.noiseSource(t, 0.22).connect(bp).connect(g).connect(this.filter)
  }

  private hat(t: number, decay: number, peak: number) {
    const hp = this.ctx!.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 7500
    this.noiseSource(t, decay + 0.02).connect(hp).connect(this.env(t, peak, decay)).connect(this.filter)
  }

  private bass(t: number, freq: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(900, t)
    lp.frequency.exponentialRampToValueAtTime(180, t + 0.14)
    lp.Q.value = 6
    osc.connect(lp).connect(this.env(t, 0.32, 0.16)).connect(this.filter)
    osc.start(t)
    osc.stop(t + 0.18)
  }

  private stab(t: number, notes: number[]) {
    const ctx = this.ctx!
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(2600, t)
    lp.frequency.exponentialRampToValueAtTime(500, t + 0.22)
    const g = this.env(t, 0.09, 0.26)
    lp.connect(g).connect(this.filter)
    for (const n of notes) {
      for (const detune of [-8, 8]) {
        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = n
        osc.detune.value = detune
        osc.connect(lp)
        osc.start(t)
        osc.stop(t + 0.28)
      }
    }
  }

  private riser(t: number, dur: number) {
    const bp = this.ctx!.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 2
    bp.frequency.setValueAtTime(400, t)
    bp.frequency.exponentialRampToValueAtTime(9000, t + dur)
    const g = this.ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + dur)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05)
    const src = this.ctx!.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    src.start(t)
    src.stop(t + dur + 0.06)
    src.connect(bp).connect(g).connect(this.filter)
  }

  private crash(t: number) {
    const hp = this.ctx!.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 4000
    this.noiseSource(t, 1.3).connect(hp).connect(this.env(t, 0.16, 1.2)).connect(this.filter)
  }
}
