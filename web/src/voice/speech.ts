// Read-aloud via the device's text-to-speech (VOICE_ASSIST). This is a stand-in: the spec wants human-reviewed audio
// with a lift vocabulary glossary. It never reads text with a voice of another language; it reports that instead.
import type { Lang } from '../i18n/i18n';

export type SpeakResult = 'spoken' | 'pending' | 'no_voice' | 'unsupported';

export function speechLangCode(lang: Lang): string {
  return `${lang}-IN`;
}

export function speak(text: string, lang: Lang, onLate?: (r: SpeakResult) => void): SpeakResult {
  const synth = (globalThis as { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
  const Utterance = (globalThis as { SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance }).SpeechSynthesisUtterance;
  if (!synth || !Utterance) return 'unsupported';
  const voices = synth.getVoices();
  // Some browsers load voices lazily: the first call can see an empty list. Retry once when they arrive.
  if (voices.length === 0 && typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', () => speak(text, lang, onLate), { once: true });
    return 'pending';
  }
  const voice = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (!voice) { onLate?.('no_voice'); return 'no_voice'; }
  synth.cancel();
  const u = new Utterance(text);
  u.lang = speechLangCode(lang);
  u.voice = voice;
  synth.speak(u);
  onLate?.('spoken');
  return 'spoken';
}
