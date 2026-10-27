// SCR-018 Help and call-back, SCR-019 Account recovery, and the Admin's queue for both.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button, Card, formatTime, Notice } from '../components/ui';
import type { HelpKind, HelpRequest, HelpTopic, RecoveryReason, RecoveryRequest } from '../data/types';
import { useApp } from '../state/app';

const TOPICS: HelpTopic[] = ['app', 'project', 'payment'];          // at most three choices (SCREEN_GRAMMAR)
const REASONS: RecoveryReason[] = ['lost_phone', 'new_number', 'no_code'];

/** Danger first (invariant 3): 112 as readable, dialable text. No AIEC rescue promise or response time (DEC-011). */
function DangerCard() {
  const { t } = useApp();
  return (
    <section className="danger-card" aria-labelledby="danger-h">
      <h2 id="danger-h">{t('rescue.in_danger')}</h2>
      <p className="big-number" lang="en">112</p>
      <a className="btn btn-danger btn-cta" href="tel:112">{t('help.call_112')}</a>
      <p>{t('help.no_rescue_line')}</p>
    </section>
  );
}

export function HelpScreen() {
  const { t, api, user, role } = useApp();
  const [topic, setTopic] = useState<HelpTopic>('app');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  async function ask(kind: HelpKind) {
    if (!user || !role) return;
    await api.requestHelp(user, role, kind, topic, note);
    setSent(true);
  }

  return (
    <Layout>
      <h1>{t('shared.help')}</h1>
      <DangerCard />
      {!user ? (
        <Card>
          <Notice>{t('help.login_first')}</Notice>
          <div className="row-wrap">
            <Link className="btn btn-primary" to="/login">{t('login.verify')}</Link>
            <Link className="btn btn-secondary" to="/recovery">{t('login.cant')}</Link>
          </div>
        </Card>
      ) : sent ? (
        <Notice>{t('help.sent')}</Notice>
      ) : (
        <Card>
          <h2>{t('help.ask_title')}</h2>
          <fieldset>
            <legend>{t('help.topic')}</legend>
            <div className="row-wrap">
              {TOPICS.map((tp) => (
                <label key={tp} className="choice">
                  <input type="radio" name="help-topic" checked={topic === tp} onChange={() => setTopic(tp)} /> {t(`help.topic_${tp}`)}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>{t('help.note')}</span>
            <textarea id="help-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="row-wrap">
            <Button onClick={() => ask('callback')}>{t('help.callback')}</Button>
            <Button variant="secondary" onClick={() => ask('chat')}>{t('help.chat')}</Button>
          </div>
        </Card>
      )}
    </Layout>
  );
}

export function RecoveryScreen() {
  const { t, api } = useApp();
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState<RecoveryReason | null>(null);
  const [done, setDone] = useState(false);

  async function start() {
    if (!reason) return;
    await api.startRecovery(phone, reason);
    setDone(true);
  }

  return (
    <Layout nav={false}>
      <h1>{t('recovery.title')}</h1>
      <DangerCard />
      {done ? (
        <Card>
          <Notice>{t('recovery.received')}</Notice>
          <Link className="btn btn-secondary" to="/login">{t('recovery.back')}</Link>
        </Card>
      ) : (
        <Card>
          <label className="field">
            <span>{t('login.phone')}</span>
            <input id="recovery-phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <fieldset>
            <legend>{t('recovery.what_happened')}</legend>
            <div className="stack">
              {REASONS.map((r) => (
                <label key={r} className="choice">
                  <input type="radio" name="recovery-reason" checked={reason === r} onChange={() => setReason(r)} /> {t(`recovery.reason_${r}`)}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="muted">{t('recovery.how')}</p>
          <Button onClick={start} disabled={phone.replace(/\D/g, '').length < 10 || !reason}>{t('recovery.start')}</Button>
        </Card>
      )}
    </Layout>
  );
}

/** Admin's side: every request reaches a person who acts on it. */
export function SupportPanel() {
  const { t, api, user, role, lang } = useApp();
  const [data, setData] = useState<{ help: HelpRequest[]; recoveries: RecoveryRequest[] } | null>(null);
  const reload = useCallback(() => {
    if (user && role === 'admin') api.listSupport(user, role).then(setData).catch(() => setData(null));
  }, [api, user, role]);
  useEffect(reload, [reload]);
  const [error, setError] = useState<string | null>(null);
  if (!data) return null;
  const l = lang ?? 'mr';

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try { await fn(); } catch (e) { setError((e as { messageKey?: string }).messageKey ?? 'error.NOT_FOUND'); }
    reload();
  }

  return (
    <>
      <section aria-labelledby="sup-help">
        <h2 id="sup-help">{t('support.help_title')}</h2>
        {data.help.length === 0 ? <p className="muted">{t('support.none')}</p> : (
          <ul className="list">
            {data.help.map((h) => (
              <li key={h.id} className="support-row">
                <strong>{h.userName}</strong> · {t(`role.${h.role}`)} · {t(`help.kind_${h.kind}`)} · {t(`help.topic_${h.topic}`)}
                {h.note && <div>{h.note}</div>}
                <div className="muted">{formatTime(h.at, l)}</div>
                {h.status === 'open'
                  ? <Button onClick={() => act(() => api.markHelpContacted(user!, role!, h.id))}>{t('support.mark_contacted')}</Button>
                  : <div className="ok-text"><span aria-hidden="true">✓ </span>{t('support.contacted')} · {h.handledByName}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="sup-rec">
        <h2 id="sup-rec">{t('recovery.title')}</h2>
        {data.recoveries.length === 0 ? <p className="muted">{t('support.none')}</p> : (
          <ul className="list">
            {data.recoveries.map((r) => (
              <li key={r.id} className="support-row">
                <strong>{r.userName ?? t('recovery.unknown_number')}</strong> · {r.phoneMasked} · {t(`recovery.reason_${r.reason}`)}
                <div className="muted">{formatTime(r.at, l)} · {r.reviewersNeeded === 1 ? t('recovery.one_reviewer') : t('recovery.n_reviewers', { n: r.reviewersNeeded })}
                  {r.reviewerNames.length > 0 ? ` · ${r.reviewerNames.join(', ')}` : ''}</div>
                {r.status === 'verified'
                  ? <div className="ok-text"><span aria-hidden="true">✓ </span>{t('recovery.verified')}</div>
                  : r.userName && <Button onClick={() => act(() => api.verifyRecovery(user!, role!, r.id))}>{t('recovery.verify')}</Button>}
              </li>
            ))}
          </ul>
        )}
      </section>
      {error && <Notice tone="danger">{t(error)}</Notice>}
    </>
  );
}
