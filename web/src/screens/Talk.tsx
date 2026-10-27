// SCR-009 chat list, SCR-010 project thread, SCR-011 money tab, map placeholder.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button, Card, formatMoney, formatTime, Notice, PayChip, SpeakButton } from '../components/ui';
import { ApiError, type ChatMessage, type ChatThread, type Payment } from '../data/types';
import { useApp } from '../state/app';

export function MapScreen() {
  const { t } = useApp();
  return (
    <Layout>
      <h1>{t('nav.map')}</h1>
      <Notice>{t('map.not_connected')}</Notice>
    </Layout>
  );
}

function messageText(m: ChatMessage, t: (k: string, v?: Record<string, string | number>) => string) {
  if (m.kind === 'message') return m.text ?? '';
  const vars = m.vars?.stage ? { stage: t(`stage.${m.vars.stage}`) } : m.vars;
  return t(m.textKey ?? 'chat.update', vars);
}

export function ChatListScreen() {
  const { t, api, user, role, lang } = useApp();
  const [threads, setThreads] = useState<ChatThread[] | null>(null);
  useEffect(() => {
    if (user && role) api.listThreads(user, role).then(setThreads).catch(() => setThreads([]));
  }, [api, user, role]);
  return (
    <Layout>
      <h1>{t('chat.title')}</h1>
      {threads === null ? <p className="muted">…</p> : threads.length === 0 ? <Notice>{t('chat.none')}</Notice> : (
        <ul className="list">
          {threads.map((th) => (
            <li key={th.projectId}>
              <Link className="list-item" to={`/chat/${th.projectId}`}>
                <span className="grow"><strong>{th.code}</strong> · {th.site}<br />
                  {th.last && <span className="muted">{formatTime(th.last.at, lang ?? 'mr')} · {messageText(th.last, t)}</span>}
                </span>
                <span aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export function ChatThreadScreen() {
  const { projectId = '' } = useParams();
  const { t, api, user, role, lang } = useApp();
  const [msgs, setMsgs] = useState<ChatMessage[] | null>(null);
  const [head, setHead] = useState<{ code: string; site: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (user && role) api.getThread(user, role, projectId).then((th) => { setHead(th); setMsgs(th.messages); })
      .catch((e) => setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND'));
  }, [api, user, role, projectId]);

  async function send() {
    if (!user || !role || !draft.trim()) return;
    try {
      const m = await api.sendMessage(user, role, projectId, draft);
      setMsgs((xs) => [...(xs ?? []), m]);
      setDraft('');
    } catch (e) {
      setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND');
    }
  }

  if (error && !msgs) return <Layout><Notice tone="danger">{t(error)}</Notice></Layout>;
  if (!msgs) return <Layout><p className="muted">…</p></Layout>;
  return (
    <Layout>
      <p><Link className="link-target" to="/chat">‹ {t('chat.title')}</Link></p>
      <h1>{head?.code}</h1>
      <p className="muted">{head?.site}</p>
      <ol className="thread">
        {msgs.map((m) => m.kind === 'system' ? (
          <li key={m.id} className="msg-system" aria-label={`${t('chat.system')}: ${messageText(m, t)}`}>
            <span aria-hidden="true">⚙</span> <span>{messageText(m, t)}</span>
            <time dateTime={m.at}>{formatTime(m.at, lang ?? 'mr')}</time>
          </li>
        ) : (
          <li key={m.id} className={`msg${m.authorName === user?.name ? ' msg-mine' : ''}`}>
            <div className="msg-meta">{m.authorName} · {t(`role.${m.authorRole}`)} · {formatTime(m.at, lang ?? 'mr')}</div>
            <div>{m.text}</div>
          </li>
        ))}
      </ol>
      <Card>
        <label className="field">
          <span>{t('chat.message')}</span>
          <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <Button onClick={send} disabled={!draft.trim()}>{t('chat.send')}</Button>
        <p className="muted">{t('chat.voice_not_built')}</p>
        {error && <Notice tone="danger">{t(error)}</Notice>}
      </Card>
    </Layout>
  );
}

export function MoneyScreen() {
  const { t, api, user, role, lang } = useApp();
  const [rows, setRows] = useState<Payment[] | null>(null);
  useEffect(() => {
    if (user && role) api.listPayments(user, role).then(setRows).catch(() => setRows([]));
  }, [api, user, role]);
  const l = lang ?? 'mr';
  return (
    <Layout>
      <h1>{t('money.title')}</h1>
      <Notice>{t('money.provider_only')}</Notice>
      {role === 'customer' && <Notice tone="warn">{t('money.pay_not_connected')}</Notice>}
      {(role === 'admin' || role === 'owner') && <Notice>{t('money.ledger_not_connected')}</Notice>}
      {rows === null ? <p className="muted">…</p> : rows.length > 0 && (
        <Card>
          <p className="muted">{t('money.sample')}</p>
          <div className="table-wrap">
            <table className="table-stack">
              <thead>
                <tr>
                  {role !== 'customer' && <th>{t('money.project')}</th>}
                  <th>{t('money.milestone')}</th><th>{t('money.amount')}</th><th>{t('money.status')}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    {role !== 'customer' && <td>{r.projectCode}</td>}
                    <td>{t(`milestone.${r.milestone}`)}</td>
                    <td className="money">{formatMoney(r.amountPaise, l)}</td>
                    <td><PayChip status={r.status} /></td>
                    <td><SpeakButton text={`${t(`milestone.${r.milestone}`)}, ${formatMoney(r.amountPaise, l)}, ${t(`pay.${r.status}`)}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Layout>
  );
}
