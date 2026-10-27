// SCR-079 Rules and settings (Admin proposes, Owner approves; versioned) and SCR-085 open owner decisions.
import { useCallback, useEffect, useState } from 'react';
import decisions from '../../../docs/data/decisions.json';
import { Layout } from '../components/Layout';
import { Button, Card, formatTime, Notice } from '../components/ui';
import { ApiError, type FeatureFlag, type RuleProposal, type RuleSetting } from '../data/types';
import { hasKey } from '../i18n/i18n';
import { useApp } from '../state/app';

function useRuleData() {
  const { api, user, role } = useApp();
  const [data, setData] = useState<{ rules: RuleSetting[]; proposals: RuleProposal[]; flags: FeatureFlag[] } | null>(null);
  const reload = useCallback(() => {
    if (!user || !role) return;
    Promise.all([api.listRules(user, role), api.listRuleProposals(user, role), api.listFlags(user, role)])
      .then(([rules, proposals, flags]) => setData({ rules, proposals, flags }));
  }, [api, user, role]);
  useEffect(reload, [reload]);
  return { data, reload };
}

/** 330 -> "UTC+5:30" (minutes east of UTC). */
export function utcOffset(minutes: number): string {
  const a = Math.abs(minutes);
  return `UTC${minutes < 0 ? '−' : '+'}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
}

function useFormat() {
  const { t } = useApp();
  return (r: { unit: RuleSetting['unit'] }, v: number) =>
    r.unit === 'utc_offset' ? utcOffset(v) : t(`unit.${r.unit}`, { n: v });
}

function ProposeForm({ rules, onDone }: { rules: RuleSetting[]; onDone(): void }) {
  const { t, api, user, role } = useApp();
  const [key, setKey] = useState(rules[0]?.key ?? '');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rule = rules.find((r) => r.key === key);

  async function submit() {
    if (!user || !role) return;
    setError(null);
    try {
      await api.proposeRule(user, role, key, Number(value), reason);
      setValue('');
      setReason('');
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND');
    }
  }

  return (
    <Card>
      <h2>{t('rules.propose_title')}</h2>
      <label className="field">
        <span>{t('rules.setting')}</span>
        <select id="rule-key" value={key} onChange={(e) => setKey(e.target.value)}>
          {rules.map((r) => <option key={r.key} value={r.key}>{t(`rule.${r.key}`)}</option>)}
        </select>
      </label>
      <label className="field">
        <span>{t('rules.new_value')}</span>
        <input id="rule-value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      {rule && <p className="muted">{t('rules.range', { min: rule.min, max: rule.max })}</p>}
      <label className="field">
        <span>{t('rules.reason')}</span>
        <textarea id="rule-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <Button onClick={submit} disabled={!value.trim() || !reason.trim()}>{t('rules.propose')}</Button>
      {error && <Notice tone="danger">{t(error)}</Notice>}
    </Card>
  );
}

function ProposalItem({ p, rules, onDone }: { p: RuleProposal; rules: RuleSetting[]; onDone(): void }) {
  const { t, api, user, role, lang } = useApp();
  const fmt = useFormat();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rule = rules.find((r) => r.key === p.key)!;
  const own = p.proposedBy === user?.id;

  async function decide(d: 'approved' | 'rejected') {
    if (!user || !role) return;
    setError(null);
    try {
      await api.decideRuleProposal(user, role, p.id, d, p.version, d === 'rejected' ? reason : undefined);
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND');
    }
  }

  return (
    <li className="proposal">
      <strong>{t(`rule.${p.key}`)}</strong>
      <div className="proposal-change">{fmt(rule, p.from)} → {fmt(rule, p.to)}</div>
      <div>{t('approval.reason')}: {p.reason}</div>
      <div className="muted">{p.proposedByName} · {formatTime(p.createdAt, lang ?? 'mr')} · {t(`status.${p.status}`)}
        {p.decidedByName ? ` · ${p.decidedByName}` : ''}{p.decisionReason ? ` · ${p.decisionReason}` : ''}</div>
      {p.status === 'requested' && role === 'owner' && (own ? (
        <Notice tone="warn">{t('approval.own_request')}</Notice>
      ) : (
        <>
          {rejecting && (
            <label className="field">
              <span>{t('approval.reject_reason')}</span>
              <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
          )}
          <div className="row-wrap">
            {!rejecting && <Button onClick={() => decide('approved')}>{t('approval.approve')}</Button>}
            {!rejecting ? <Button variant="secondary" onClick={() => setRejecting(true)}>{t('approval.reject')}</Button>
              : <Button variant="danger" disabled={!reason.trim()} onClick={() => decide('rejected')}>{t('approval.reject')}</Button>}
          </div>
        </>
      ))}
      {error && <Notice tone="danger">{t(error)}</Notice>}
    </li>
  );
}

export function RulesScreen() {
  const { t, role } = useApp();
  const { data, reload } = useRuleData();
  const fmt = useFormat();
  if (!data) return <Layout><p className="muted">…</p></Layout>;
  const open = decisions.filter((d) => !d.answer);
  return (
    <Layout>
      <h1>{t('rules.title')}</h1>
      <Notice>{t('rules.intro')}</Notice>

      <section aria-labelledby="rules-current">
        <h2 id="rules-current">{t('rules.current')}</h2>
        {(() => {
          const v = (k: string) => data.rules.find((r) => r.key === k)?.value;
          return v('approval_window_start') !== undefined && v('approval_window_start') === v('approval_window_end')
            && <Notice tone="warn">{t('rules.window_empty')}</Notice>;
        })()}
        <div className="table-wrap">
          <table className="table-rules">
            <thead><tr><th>{t('rules.setting')}</th><th>{t('rules.value')}</th><th>{t('rules.source')}</th><th>{t('rules.version')}</th></tr></thead>
            <tbody>
              {data.rules.map((r) => (
                <tr key={r.key}>
                  <td>{t(`rule.${r.key}`)}{hasKey(`rulenote.${r.key}`) && <div className="muted rule-note">{t(`rulenote.${r.key}`)}</div>}</td>
                  <td className="money">{fmt(r, r.value)}</td>
                  <td>{r.source}</td>
                  <td>v{r.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {role === 'admin' && <ProposeForm rules={data.rules} onDone={reload} />}

      <section aria-labelledby="rules-proposals">
        <h2 id="rules-proposals">{t('rules.proposals')}</h2>
        {data.proposals.length === 0 ? <p className="muted">{t('rules.no_proposals')}</p> : (
          <ul className="list">{data.proposals.map((p) => <ProposalItem key={`${p.id}-${p.version}`} p={p} rules={data.rules} onDone={reload} />)}</ul>
        )}
      </section>

      <section aria-labelledby="rules-locked">
        <h2 id="rules-locked">{t('rules.locked')}</h2>
        <p className="muted">{t('rules.locked_note')}</p>
        <ul className="list">
          {data.flags.map((f) => (
            <li key={f.key} className="locked-row">
              {f.on ? <span className="chip chip-red"><span aria-hidden="true">■</span> {t('rules.on')}</span>
                : <span className="chip chip-side"><span aria-hidden="true">🔒</span> {t('rules.off')}</span>}
              <span className="grow"><strong>{t(`flag.${f.key}`)}</strong><br />
                <span className="muted">{t('rules.until')}: {f.until}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules-decisions">
        <h2 id="rules-decisions">{t('rules.decisions')}</h2>
        <p className="muted">{t('rules.decisions_note', { n: open.length })}</p>
        <ul className="list">
          {open.map((d) => (
            <li key={d.id} className="decision-row">
              <strong>{d.id}</strong> <span className="muted">· {d.tier}</span>
              <div lang="en">{d.question}</div>
              <div><span className="muted">{t('rules.default_in_use')}:</span> <span lang="en">{d.default_until_answered}</span></div>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
