import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button, Notice, formatTime } from '../components/ui';
import type { AppNotification } from '../data/types';
import { useApp } from '../state/app';

/** A decision travels as a code ('approved' | 'rejected') and is shown in the reader's language. */
function localVars(vars: AppNotification['vars'], t: (k: string) => string) {
  if (!vars || typeof vars.decision !== 'string') return vars;
  return { ...vars, decision: t(`notif.decision_${vars.decision}`) };
}

// SCR-013: chronological list with priority icon, text, delivery state; tap opens the target screen.
export function NotificationsScreen() {
  const { t, api, user, role, lang, bumpNotif } = useApp();
  const [list, setList] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    if (user && role) api.listNotifications(user, role).then(setList)
      .catch((e) => setError((e as { messageKey?: string }).messageKey ?? 'error.NOT_FOUND'));
  }, [api, user, role]);
  useEffect(reload, [reload]);
  const l = lang ?? 'mr';

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try { await fn(); } catch (e) { setError((e as { messageKey?: string }).messageKey ?? 'error.NOT_FOUND'); }
    reload();
    bumpNotif();
  }

  return (
    <Layout>
      <h1>{t('notif.title')}</h1>
      {error && <Notice tone="danger">{t(error)}</Notice>}
      {list && list.length === 0 && <Notice>{t('notif.none')}</Notice>}
      {list && list.length > 0 && (
        <ul className="list notif-list">
          {list.map((n) => {
            const critical = n.priority === 'critical';
            const open = critical && !n.acknowledgedAt;
            return (
              <li key={n.id} className={`notif${critical ? ' notif-critical' : ''}`}>
                <div className="notif-head">
                  <span className={critical ? 'danger-text' : 'muted'}>
                    <span aria-hidden="true">{critical ? '■ ' : '● '}</span>{t(critical ? 'notif.critical' : 'notif.normal')}
                  </span>
                  <span className="muted">{formatTime(n.at, l)}</span>
                </div>
                <p className="notif-text">{t(n.textKey, localVars(n.vars, t))}</p>
                <div className="muted notif-delivery">
                  {t('notif.in_app')}
                  {n.receipts.map((r) => ` · ${t(`notif.channel_${r.channel}`)}: ${t(`notif.state_${r.state}`)}`)}
                </div>
                {n.heldUntil && <div className="muted">{t('notif.held', { time: formatTime(n.heldUntil, l) })}</div>}
                {n.humanTask && <div className="warn-text"><span aria-hidden="true">☎ </span>{t('notif.human_task')}</div>}
                {open && <div className="danger-text">{t('notif.stays')}</div>}
                {n.acknowledgedAt && <div className="ok-text"><span aria-hidden="true">✓ </span>{t('notif.acked')}</div>}
                <div className="row-actions">
                  <Link className="btn btn-primary" to={n.target}>{t('notif.open')}</Link>
                  {open
                    ? <Button variant="secondary" onClick={() => act(() => api.acknowledgeNotification(user!, role!, n.id))}>{t('notif.ack')}</Button>
                    : <Button variant="secondary" onClick={() => act(() => api.deleteNotification(user!, role!, n.id))}>{t('notif.delete')}</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="muted">{t('notif.demo_note')}</p>
    </Layout>
  );
}
