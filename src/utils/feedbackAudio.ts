// ============================================================
// Feedback audio: text-to-speech + correct/wrong sounds for kids
// ============================================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioContext;
}

/**
 * Call this on the first user click (e.g. "Let's Play!") so the AudioContext
 * is unlocked and sounds can play later in the quiz. Browsers require a user
 * gesture before allowing audio.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.getVoices();
}

/** Play a short tone (frequency in Hz, duration in seconds). */
function playTone(ctx: AudioContext, freq: number, duration: number, volume = 0.25): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Pleasant two-tone sound for correct answer (kid-friendly). */
export function playCorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume(); // same tick as user click
  playTone(ctx, 523.25, 0.15, 0.28);  // C5
  setTimeout(() => playTone(ctx, 659.25, 0.2, 0.3), 140);  // E5
}

/** Gentle, soft sound for wrong answer (not harsh). */
export function playWrongSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  playTone(ctx, 220, 0.3, 0.2);  // A3
}

/** Prefer a female, soft-sounding voice for kid-friendly TTS (en-US). */
function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.startsWith("en"));
  const femaleNames = /zira|samantha|karen|aria|victoria|susan|emily|lucy|sarah|google.*english.*female|female/i;
  const female = en.find((v) => femaleNames.test(v.name));
  if (female) return female;
  return en[0] || null;
}

function applySoftVoice(u: SpeechSynthesisUtterance): void {
  u.rate = 0.88;
  u.pitch = 1.02;
  u.volume = 0.95;
  u.lang = "en-US";
  const voice = getPreferredVoice();
  if (voice) u.voice = voice;
}

/** Speak text for kids: female voice when available, slower and softer. Returns a Promise that resolves when all speech is done. */
export function speakFeedback(text: string, subtext?: string): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve();
  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    applySoftVoice(utterance);

    if (subtext) {
      utterance.onend = () => {
        const u2 = new SpeechSynthesisUtterance(subtext);
        applySoftVoice(u2);
        u2.onend = () => resolve();
        window.speechSynthesis.speak(u2);
      };
    } else {
      utterance.onend = () => resolve();
    }

    window.speechSynthesis.speak(utterance);
  });
}

/** Minimum time to show feedback before advancing (ms). */
const MIN_FEEDBACK_MS = 2500;

/** Run sound + TTS. Returns a Promise that resolves when TTS has finished. */
export function playFeedbackForKids(
  isCorrect: boolean,
  isTimeout: boolean,
  title: string,
  subtext: string,
  emotionReg?: string | null
): Promise<void> {
  if (isCorrect) playCorrectSound();
  else playWrongSound();

  // Only speak title + subtext; emotion regulation is shown on screen but not read aloud
  const speechDone = speakFeedback(title, subtext);
  const minDelay = new Promise<void>((r) => setTimeout(r, MIN_FEEDBACK_MS));
  return Promise.all([speechDone, minDelay]).then(() => {});
}
