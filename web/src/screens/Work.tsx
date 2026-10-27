// SCR-008 Today, SCR-073 Admin exceptions, SCR-075 Project file, SCR-076 Approvals inbox.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button, Card, formatTime, Notice, SideStateBadge, StageBar, StatusChip } from '../components/ui';
import { ApiError, type Approval, type ExceptionItem, type Project, type TimelineEvent } from '../data/types';
import { homeFor, useApp } from '../state/app';

function useLoad<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | null; error: string | null; reload(): void } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    fn().then((d) => live && setData(d)).catch((e) => live && setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND'));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return { data, error, reload: () => setN((x) => x + 1) };
}

export function TodayScreen() {
  const { t, api, user, role } = useApp();
  const { data } = useLoad(async () => {
    if (!user || !role) return null;
    if (role === 'admin') return { kind: 'exception' as const, x: (await api.listExceptions(user, role))[0] ?? null,
                                   projects: await api.listProjects(user, role) };
    if (role === 'owner') return { kind: 'approvals' as const, n: (await api.listApprovals(user, role)).filter((a) => a.status === 'requested').length };
    return { kind: 'project' as const, p: (await api.listProjects(user, role))[0] ?? null };
  }, [user, role]);
  if (!data) return <Layout><p className="muted">…</p></Layout>;
  let body;
  if (data.kind === 'exception') {
    const p = data.x && data.projects.find((pp: Project) => pp.id === data.x!.projectId);
    body = data.x && p ? (
      <Card className="next">
        <StatusChip severity={data.x.severity} />
        <h2>{t(data.x.kindKey)}</h2>
        <p>{p.code} · {p.site}</p>
        <Link className="btn btn-primary btn-cta" to={`/project/${p.id}`}>{t('today.open')}</Link>
      </Card>
    ) : <Notice>{t('admin.all_clear')}</Notice>;
  } else if (data.kind === 'approvals') {
    body = (
      <Card className="next">
        <h2>{t('admin.approvals_title')}: {data.n}</h2>
        <Link className="btn btn-primary btn-cta" to="/admin/approvals">{t('today.open')}</Link>
      </Card>
    );
  } else {
    body = data.p ? (
      <Card className="next">
        <StatusChip severity={data.p.severity} />
        <h2>{t(data.p.nextKey)}</h2>
        <p>{t('today.waiting_on')}: {t(`role.${data.p.waitingOn}`)}</p>
        <Link className="btn btn-primary btn-cta" to={homeFor(role)}>{t('today.open')}</Link>
      </Card>
    ) : <Notice>{t('shared.nothing_now')}</Notice>;
  }
  return (
    <Layout>
      <h1>{t('today.next')}</h1>
      {body}
    </Layout>
  );
}

export function AdminScreen() {
  const { t, api, user, role } = useApp();
  const { data } = useLoad(async () => user && role ? {
    xs: await api.listExceptions(user, role), ps: await api.listProjects(user, role),
  } : null, [user, role]);
  if (!data) return <Layout><p className="muted">…</p></Layout>;
  const byId = Object.fromEntries(data.ps.map((p) => [p.id, p]));
  return (
    <Layout>
      <div className="row-between">
        <h1>{t('admin.queue_title')}</h1>
        <Link className="btn btn-secondary" to="/admin/approvals">{t('admin.approvals_title')}</Link>
      </div>
      {data.xs.length === 0 && <Notice>{t('admin.all_clear')}</Notice>}
      <ul className="list">
        {data.xs.map((x: ExceptionItem) => (
          <li key={x.id}>
            <Link className="list-item" to={`/project/${x.projectId}`}>
              <StatusChip severity={x.severity} />
              <span className="grow"><strong>{t(x.kindKey)}</strong><br />
                <span className="muted">{byId[x.projectId].code} · {byId[x.projectId].site}</span></span>
              <span aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2>{t('admin.projects')}</h2>
      <div className="table-wrap">
        <table className="table-stack">
          <thead><tr><th>#</th><th>{t('admin.projects')}</th><th>{t('project.stage')}</th><th></th></tr></thead>
          <tbody>
            {data.ps.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/project/${p.id}`}>{p.code}</Link></td>
                <td>{p.site}</td>
                <td>{t(`stage.${p.stage}`)} <SideStateBadge side={p.sideState} /></td>
                <td><StatusChip severity={p.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

function eventText(e: TimelineEvent, t: (k: string, v?: Record<string, string | number>) => string) {
  if (e.kind === 'side_state' && e.side) return t(`project.${e.side}`);
  if (e.kind === 'stage' && e.to) return `${e.from ? t(`stage.${e.from}`) + ' → ' : ''}${t(`stage.${e.to}`)}`;
  return e.textKey ? t(e.textKey) : e.kind;
}

export function ProjectScreen() {
  const { id = '' } = useParams();
  const { t, api, user, role, lang } = useApp();
  const { data, error } = useLoad(async () => user && role ? api.getProject(user, role, id) : null, [id, user, role]);
  if (error) return <Layout><Notice tone="danger">{t(error)}</Notice></Layout>;
  if (!data) return <Layout><p className="muted">…</p></Layout>;
  const { project: p, timeline } = data;
  return (
    <Layout>
      <p className="muted">{p.code}</p>
      <h1>{p.site}</h1>
      <div className="row-wrap"><StatusChip severity={p.severity} /><SideStateBadge side={p.sideState} /></div>
      <Card>
        <StageBar stage={p.stage} />
        <dl className="facts">
          <dt>{t('project.licence_holder')}</dt>
          <dd>{p.licenceHolder ?? <span className="warn-text"><span aria-hidden="true">▲</span> {t('project.not_named')}</span>}</dd>
          <dt>{t('today.waiting_on')}</dt><dd>{t(`role.${p.waitingOn}`)}</dd>
        </dl>
      </Card>
      <h2>{t('project.timeline')}</h2>
      <ol className="timeline">
        {timeline.map((e) => (
          <li key={e.id} className={e.red ? 'tl tl-red' : 'tl'}>
            <time dateTime={e.at}>{formatTime(e.at, lang ?? 'mr')}</time>
            <div>
              <strong>{e.red && <span aria-hidden="true">■ </span>}{eventText(e, t)}</strong>
              <div className="muted">{e.actorName} · {t(`role.${e.actorRole}`)}
                {e.evidenceCount ? ` · ${t('project.evidence', { n: e.evidenceCount })}` : ''}</div>
              {e.reason && <div>{t('approval.reason')}: {e.reason}</div>}
            </div>
          </li>
        ))}
      </ol>
    </Layout>
  );
}

function ApprovalCard({ a, onDone }: { a: Approval; onDone(): void }) {
  const { t, api, user, role, lang } = useApp();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const own = a.requestedBy === user?.id;
  const red = a.kind === 'override';

  async function decide(d: 'approved' | 'rejected') {
    if (!user || !role) return;
    setError(null);
    try {
      await api.decideApproval(user, role, a.id, d, a.version, d === 'rejected' ? reason : undefined);
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND');
    }
  }

  return (
    <Card className={red ? 'card-red' : ''}>
      <div className="row-between">
        <strong>{red && <span aria-hidden="true">■ </span>}{t(`approvalkind.${a.kind}`)}</strong>
        {role === 'admin' ? <Link className="link-target" to={`/project/${a.projectId}`}>{a.projectCode}</Link> : <span>{a.projectCode}</span>}
      </div>
      {red && <Notice tone="danger">{t('approval.override')}</Notice>}
      <dl className="facts">
        <dt>{t('approval.requested_by')}</dt><dd>{a.requestedByName} · {t(`role.${a.requestedRole}`)} · {formatTime(a.createdAt, lang ?? 'mr')}</dd>
        {a.reason && <><dt>{t('approval.reason')}</dt><dd>{a.reason}</dd></>}
      </dl>
      {a.status !== 'requested' ? (
        <Notice>{t('approval.decided')}: {a.status === 'approved' ? t('approval.approve') : t('approval.reject')} · {a.decidedByName}</Notice>
      ) : own ? (
        <Notice tone="warn">{t('approval.own_request')}</Notice>
      ) : (
        <>
          {rejecting && (
            <label className="field">
              <span>{t('approval.reject_reason')}</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </label>
          )}
          <div className="row-wrap">
            {!rejecting && <Button onClick={() => decide('approved')}>{t('approval.approve')}</Button>}
            {!rejecting ? (
              <Button variant="secondary" onClick={() => setRejecting(true)}>{t('approval.reject')}</Button>
            ) : (
              <Button variant="danger" disabled={!reason.trim()} onClick={() => decide('rejected')}>{t('approval.reject')}</Button>
            )}
          </div>
        </>
      )}
      {error && <Notice tone="danger">{t(error)}</Notice>}
    </Card>
  );
}

export function ApprovalsScreen() {
  const { t, api, user, role } = useApp();
  const { data, reload } = useLoad(async () => user && role ? api.listApprovals(user, role) : [], [user, role]);
  if (!data) return <Layout><p className="muted">…</p></Layout>;
  return (
    <Layout>
      <h1>{t('admin.approvals_title')}</h1>
      {data.length === 0 && <Notice>{t('approval.none')}</Notice>}
      <div className="stack">{data.map((a) => <ApprovalCard key={`${a.id}-${a.version}`} a={a} onDone={reload} />)}</div>
    </Layout>
  );
}
