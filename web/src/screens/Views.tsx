// SCR-041 Customer progress, SCR-084 Owner summary, SCR-012 Me and settings, placeholders.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button, Card, formatTime, Notice, SideStateBadge, SpeakButton, StageStepper, StatusChip } from '../components/ui';
import { STAGES } from '../data/stages';
import { ApiError, type OwnerSummary, type Project } from '../data/types';
import { LANGS, translate } from '../i18n/i18n';
import { useApp } from '../state/app';
import { SCALE_RANGE, THEMES } from '../theme/theme';

export function CustomerProgressScreen() {
  const { t, api, user, role } = useApp();
  const [p, setP] = useState<Project | null | undefined>(undefined);
  useEffect(() => {
    if (user && role) api.listProjects(user, role).then((ps) => setP(ps[0] ?? null));
  }, [api, user, role]);
  if (p === undefined) return <Layout><p className="muted">…</p></Layout>;
  if (p === null) return <Layout><Notice>{t('shared.nothing_now')}</Notice></Layout>;
  return (
    <Layout>
      <h1>{t('cust.progress_title')}</h1>
      <p className="muted">{p.code} · {p.site}</p>
      <div className="row-wrap"><StatusChip severity={p.severity} reason={t(p.nextKey)} /><SideStateBadge side={p.sideState} /></div>
      <Card className="next"><div className="heading-row"><h2>{t(p.nextKey)}</h2><SpeakButton text={t(p.nextKey)} /></div></Card>
      <Notice>{t('cust.no_live_tracking')}</Notice>
      <StageStepper stage={p.stage} />
    </Layout>
  );
}

/** Single-series magnitude: horizontal bars in one hue, value labels, a hover title per bar, and a table view (§12). */
function ByStageChart({ byStage }: { byStage: OwnerSummary['byStage'] }) {
  const { t } = useApp();
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...Object.values(byStage));
  const total = Object.values(byStage).reduce((a, b) => a + b, 0);
  const top = STAGES.reduce((a, b) => (byStage[b] > byStage[a] ? b : a), STAGES[0]);
  return (
    <Card>
      <div className="row-between">
        <h2>{t('owner.by_stage')}</h2>
        <Button variant="secondary" onClick={() => setTable((x) => !x)} aria-pressed={table}>{t('chart.table')}</Button>
      </div>
      <p>{t('chart.summary', { total, stage: t(`stage.${top}`), n: byStage[top] })}</p>
      {table ? (
        <table>
          <thead><tr><th>{t('project.stage')}</th><th>{t('chart.count')}</th></tr></thead>
          <tbody>{STAGES.map((s) => <tr key={s}><td>{t(`stage.${s}`)}</td><td>{byStage[s]}</td></tr>)}</tbody>
        </table>
      ) : (
        <ul className="bars" aria-label={t('owner.by_stage')}>
          {STAGES.map((s) => (
            <li key={s} className="bar-row" title={`${t(`stage.${s}`)}: ${byStage[s]}`}>
              <span className="bar-label">{t(`stage.${s}`)}</span>
              <span className="bar-track"><span className="bar" style={{ width: `${(byStage[s] / max) * 100}%` }} /></span>
              <span className="bar-value">{byStage[s]}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function OwnerScreen() {
  const { t, api, user, role, lang } = useApp();
  const [s, setS] = useState<OwnerSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user && role) api.ownerSummary(user, role).then(setS).catch((e) => setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND'));
  }, [api, user, role]);
  if (error) return <Layout><Notice tone="danger">{t(error)}</Notice></Layout>;
  if (!s) return <Layout><p className="muted">…</p></Layout>;
  return (
    <Layout>
      <h1>{t('owner.title')}</h1>
      <div className="tiles">
        <Card className="tile"><span className="tile-n">{s.active}</span>{t('owner.active')}</Card>
        <Card className="tile tile-red"><span className="tile-n"><span aria-hidden="true">■ </span>{s.stopped}</span>{t('owner.stopped')}</Card>
        <Card className="tile"><span className="tile-n">{s.overridesThisWeek}</span>{t('owner.overrides_week')}
          <span className="muted">{t('owner.overrides_note')}</span></Card>
      </div>
      <Card className={s.overrides.length ? 'card-red' : ''}>
        <h2>{t('owner.overrides_list')}</h2>
        {s.overrides.length === 0 ? <Notice>{t('admin.all_clear')}</Notice> : (
          <ul className="list">
            {s.overrides.map((o) => (
              <li key={o.id} className="override-row">
                <strong><span aria-hidden="true">■ </span>{o.projectCode}</strong> · {o.reason}
                <div className="muted">{o.requestedByName} · {formatTime(o.createdAt, lang ?? 'mr')} · {t(`status.${o.status}`)}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Notice>{t('owner.money_not_connected')}</Notice>
      <ByStageChart byStage={s.byStage} />
    </Layout>
  );
}

export function MeScreen() {
  const { t, lang, setLang, theme, setTheme, scale, setScale, user, role, logout } = useApp();
  const nav = useNavigate();
  return (
    <Layout>
      <h1>{t('me.title')}</h1>
      {user && <p className="muted">{user.name} · {user.phoneMasked}</p>}
      <Card>
        <fieldset>
          <legend>{t('me.language')}</legend>
          <div className="row-wrap">
            {LANGS.map((l) => (
              <label key={l} className="choice" lang={l}>
                <input type="radio" name="lang" checked={lang === l} onChange={() => setLang(l)} /> {translate(`lang.${l}`, l)}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('me.theme')}</legend>
          <div className="row-wrap">
            {THEMES.map((th) => (
              <label key={th} className="choice">
                <input type="radio" name="theme" checked={theme === th} onChange={() => setTheme(th)} /> {t(`me.theme_${th}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>{t('me.scale')}: {scale}%</span>
          <input type="range" min={SCALE_RANGE.min} max={SCALE_RANGE.max} step={10} value={scale}
                 onChange={(e) => setScale(Number(e.target.value))} />
        </label>
        <p className="muted">{t('me.scale_note')}</p>
      </Card>
      <div className="row-wrap">
        {(role === 'admin' || role === 'owner') && <Link className="btn btn-secondary" to="/admin/rules">{t('me.rules')}</Link>}
        {user && user.roles.length > 1 && <Button variant="secondary" onClick={() => nav('/role')}>{t('me.switch_role')}</Button>}
        <Button variant="secondary" onClick={() => { logout(); nav('/login'); }}>{t('me.logout')}</Button>
      </div>
    </Layout>
  );
}

export function SoonScreen() {
  const { t } = useApp();
  return (
    <Layout>
      <h1>{t('soon.title')}</h1>
      <Notice>{t('soon.body')}</Notice>
    </Layout>
  );
}
