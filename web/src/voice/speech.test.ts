import { afterEach, describe, expect, it, vi } from 'vitest';
import { speak, speechLangCode } from './speech';

type Utt = { text: string; lang: string; voice: unknown };
function mockSpeech(voiceLangs: string[]) {
  const spoken: Utt[] = [];
  const voices = voiceLangs.map((lang) => ({ lang, name: lang }));
  vi.stubGlobal('speechSynthesis', {
    getVoices: () => voices,
    cancel: vi.fn(),
    speak: (u: Utt) => spoken.push(u),
  });
  vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; lang = ''; voice: unknown = null; constructor(t: string) { this.text = t; } });
  return spoken;
}

afterEach(() => vi.unstubAllGlobals());

describe('read-aloud (device text-to-speech, a stand-in until human-reviewed audio exists)', () => {
  it('maps app languages to Indian locale codes', () => {
    expect(speechLangCode('mr')).toBe('mr-IN');
    expect(speechLangCode('hi')).toBe('hi-IN');
    expect(speechLangCode('en')).toBe('en-IN');
  });

  it('speaks with a voice of the chosen language', () => {
    const spoken = mockSpeech(['hi-IN', 'en-US']);
    expect(speak('नमस्ते', 'hi')).toBe('spoken');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].lang).toBe('hi-IN');
    expect((spoken[0].voice as { lang: string }).lang).toBe('hi-IN');
  });

  it('never reads Marathi with a wrong-language voice: reports no voice instead', () => {
    const spoken = mockSpeech(['hi-IN', 'en-US']);
    expect(speak('नमस्कार', 'mr')).toBe('no_voice');
    expect(spoken).toHaveLength(0);
  });

  it('waits for lazily loaded voices instead of wrongly reporting none', () => {
    const spoken: Utt[] = [];
    let voices: { lang: string }[] = [];
    let onChange: (() => void) | null = null;
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => voices, cancel: vi.fn(), speak: (u: Utt) => spoken.push(u),
      addEventListener: (_: string, cb: () => void) => { onChange = cb; },
    });
    vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; lang = ''; voice: unknown = null; constructor(t: string) { this.text = t; } });
    const late = vi.fn();
    expect(speak('नमस्कार', 'mr', late)).toBe('pending');
    voices = [{ lang: 'mr-IN' }];
    onChange!();
    expect(spoken[0].lang).toBe('mr-IN');
    expect(late).toHaveBeenCalledWith('spoken');
  });

  it('reports when the browser has no speech at all', () => {
    expect(speak('hello', 'en')).toBe('unsupported');
  });
});
