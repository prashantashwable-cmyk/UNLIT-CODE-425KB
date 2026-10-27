import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button, Notice, formatTime } from '../components/ui';
import type { CallTask, NotificationAuditRow } from '../data/types';
import { useApp } from '../state/app';

// Admin follow-up: call tasks for critical items nobody received (§33) and the kept notification record (T-256).
export function FollowUpScreen() {
  const { t, api, user, role, lang } = useApp();
  const [data, setData] = useState<{ calls: CallTask[]; record: NotificationAuditRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const reload = useCallback(() => {
    if (!user || !role) return;
    Promise.all([api.listCallTasks(user, role), api.notificationAudit(user, role)])
      .then(([calls, record]) => setData({ calls, record }))
      .catch((e) => setError((e as { messageKey?: string }).messageKey ?? 'error.NOT_FOUND'));
  }, [api, user, role]);
  useEffect(reload, [reload]);
  const l = lang ?? 'mr';

  async function log(id: string, outcome: 'reached' | 'no_answer') {
    setError(null);
    try {
      await api.logCallAttempt(user!, role!, id, outcome, notes[id] ?? '');
      setNotes((n) => ({ ...n, [id]: '' }));
    } catch (e) { setError((e as { messageKey?: string }).messageKey ?? 'error.NOT_FOUND'); }
    reload();
  }

  return (
    <Layout>
      <h1>{t('calls.title')}</h1>
      {error && <Notice tone="danger">{t(error)}</Notice>}
      {data && (
        <>
          <section aria-labelledby="calls-h">
            <h2 id="calls-h">{t('calls.tasks')}</h2>
            <p className="muted">{t('calls.why')}</p>
            {data.calls.length === 0 ? <p className="muted">{t('support.none')}</p> : (
              <ul className="list notif-list">
                {data.calls.map((c) => {
                  const own = c.recipientName === user!.name && c.status === 'open';
                  return (
                    <li key={c.id} className={`notif${c.status === 'open' ? ' notif-critical' : ''}`}>
                      <div className="notif-head">
                        <strong>{c.recipientName}</strong>
                        <span className="muted">{t(`role.${c.recipientRole}`)} · {c.phoneMasked}</span>
                      </div>
                      <p className="notif-text">{t(c.textKey, c.vars)}</p>
                      <div className="muted">{formatTime(c.at, l)}</div>
                      {c.attempts.map((a, i) => (
                        <div key={i} className="muted">
                          {t(`calls.outcome_${a.outcome}`)} · {a.byName} · {formatTime(a.at, l)}{a.note ? ` · ${a.note}` : ''}
                        </div>
                      ))}
                      {c.status === 'done' && <div className="ok-text"><span aria-hidden="true">✓ </span>{t('calls.done')}</div>}
                      {own && <div className="warn-text">{t('calls.own_task')}</div>}
                      {c.status === 'open' && !own && (
                        <>
                          <div className="field">
                            <label htmlFor={`note-${c.id}`}>{t('calls.note')}</label>
                            <input id={`note-${c.id}`} value={notes[c.id] ?? ''}
                                   onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))} />
                          </div>
                          <div className="row-actions">
                            <Button onClick={() => log(c.id, 'reached')}>{t('calls.outcome_reached')}</Button>
                            <Button variant="secondary" onClick={() => log(c.id, 'no_answer')}>{t('calls.outcome_no_answer')}</Button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="muted">{t('calls.demo_note')}</p>
          </section>
          <section aria-labelledby="record-h">
            <h2 id="record-h">{t('calls.record')}</h2>
            <p className="muted">{t('calls.record_why')}</p>
            <div className="table-wrap">
              <table className="table-stack">
                <thead>
                  <tr><th>{t('calls.col_when')}</th><th>{t('calls.col_person')}</th><th>{t('calls.col_type')}</th>
                    <th>{t('calls.col_state')}</th></tr>
                </thead>
                <tbody>
                  {data.record.map((r) => (
                    <tr key={r.id}>
                      <td>{formatTime(r.at, l)}</td>
                      <td>{r.userName} · {t(`role.${r.role}`)}</td>
                      <td>{t(`notif.cls_${r.cls}`)}{r.priority === 'critical' ? ` · ${t('notif.critical')}` : ''}</td>
                      <td>
                        {r.acknowledgedAt ? `${t('notif.acked')} ${formatTime(r.acknowledgedAt, l)}` : ''}
                        {r.acknowledgedAt && r.deletedAt ? ' · ' : ''}
                        {r.deletedAt ? `${t('calls.deleted')} ${formatTime(r.deletedAt, l)}` : ''}
                        {!r.acknowledgedAt && !r.deletedAt ? t('calls.in_list') : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}
