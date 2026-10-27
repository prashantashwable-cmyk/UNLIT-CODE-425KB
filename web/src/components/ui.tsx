import { useState, type ReactNode } from 'react';
import type { Lang } from '../i18n/i18n';
import { speak, type SpeakResult } from '../voice/speech';
import type { SideState, Stage } from '../data/stages';
import { STAGES, stageNumber } from '../data/stages';
import type { Severity } from '../data/types';
import { useApp } from '../state/app';

/** Status is never colour alone: icon + text (spec §10.4, §12). */
const SEVERITY_ICON: Record<Severity, string> = { red: '■', amber: '▲', green: '●' };

export function StatusChip({ severity, reason }: { severity: Severity; reason?: string }) {
  const { t } = useApp();
  // Screen readers hear "state, reason" (§12); sighted users see the icon + state, with the reason next to it.
  return (
    <span className={`chip chip-${severity}`} role={reason ? 'img' : undefined}
          aria-label={reason ? `${t(`severity.${severity}`)}, ${reason}` : undefined}>
      <span aria-hidden="true">{SEVERITY_ICON[severity]}</span> {t(`severity.${severity}`)}
    </span>
  );
}

export function SideStateBadge({ side }: { side: SideState }) {
  const { t } = useApp();
  if (side === 'none') return null;
  return (
    <span className={`chip chip-side chip-${side}`}>
      <span aria-hidden="true">{side === 'on_hold' ? '⏸' : side === 'disputed' ? '⚠' : '✕'}</span> {t(`project.${side}`)}
    </span>
  );
}

export function StageBar({ stage }: { stage: Stage }) {
  const { t } = useApp();
  const n = stageNumber(stage);
  return (
    <div className="stagebar">
      <div className="stagebar-label">
        <strong>{t(`stage.${stage}`)}</strong> <span className="muted">{t('project.stage_of', { n })}</span>
      </div>
      <div className="stagebar-track" role="progressbar" aria-valuemin={1} aria-valuemax={16} aria-valuenow={n}
           aria-label={t('project.stage_of', { n })}>
        <div className="stagebar-fill" style={{ width: `${(n / 16) * 100}%` }} />
      </div>
    </div>
  );
}

/** Customer "pizza tracker": progress without reading (icon + word per row). */
export function StageStepper({ stage }: { stage: Stage }) {
  const { t } = useApp();
  const current = STAGES.indexOf(stage);
  return (
    <ol className="stepper">
      {STAGES.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'now' : 'later';
        return (
          <li key={s} className={`step step-${state}`} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="step-icon" aria-hidden="true">{state === 'done' ? '✓' : state === 'now' ? '▶' : String(i + 1)}</span>
            <span className="step-name">{t(`stage.${s}`)}</span>
            <span className="step-state">{t(`cust.${state}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Button({ children, variant = 'primary', className = '', type = 'button', ...rest }:
  { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...rest}>{children}</button>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' | 'danger' }) {
  return (
    <p className={`notice notice-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <span aria-hidden="true">{tone === 'info' ? 'ℹ' : tone === 'warn' ? '▲' : '■'}</span> {children}
    </p>
  );
}

export function formatTime(iso: string, lang: string): string {
  const locale = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  return new Date(iso).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Kolkata' });
}

/** Repeat-icon button that reads a line aloud in the given language (VOICE_ASSIST; device TTS stand-in). */
export function SpeakButton({ text, lang, label }: { text: string; lang?: Lang; label?: string }) {
  const app = useApp();
  const l = lang ?? app.lang ?? 'mr';
  const [result, setResult] = useState<SpeakResult | null>(null);
  return (
    <>
      <button type="button" className="btn btn-secondary btn-icon" lang={l} aria-label={label ?? app.t('voice.listen')}
              onClick={() => setResult(speak(text, l, setResult))}>
        <span aria-hidden="true">🔊</span>
      </button>
      {(result === 'no_voice' || result === 'unsupported') && (
        <span className="voice-note" role="status">{app.t(result === 'no_voice' ? 'voice.no_voice' : 'voice.unsupported')}</span>
      )}
    </>
  );
}

/** Rupees from integer paise, Indian grouping, Latin digits in every language (ICU's mr-IN grouping is wrong: ₹६९०,०००). */
export function formatMoney(paise: number, _lang: string): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2 }).format(paise / 100);
}

const PAY_ICON: Record<string, string> = { confirmed: '✓', pending: '…', failed: '✕', reversed: '↺', disputed: '⚠' };

export function PayChip({ status }: { status: string }) {
  const { t } = useApp();
  const tone = status === 'confirmed' ? 'green' : status === 'pending' ? 'amber' : 'red';
  return <span className={`chip chip-${tone}`}><span aria-hidden="true">{PAY_ICON[status]}</span> {t(`pay.${status}`)}</span>;
}
