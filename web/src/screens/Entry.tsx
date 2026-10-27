// SCR-002 language, SCR-003 OTP login, SCR-007 role switcher.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Notice, SpeakButton } from '../components/ui';
import { Layout } from '../components/Layout';
import { ApiError, FIELD_ROLES, WEB_ROLES, type Role } from '../data/types';
import { LANGS, translate } from '../i18n/i18n';
import { homeFor, useApp } from '../state/app';

/** SCR-001 Start and install gate: field roles install the Android app; everyone can try the demo. */
export function StartScreen() {
  const { t } = useApp();
  return (
    <Layout nav={false}>
      <h1>{t('start.title')}</h1>
      <InstallGuide intro={t('start.field_workers')} />
      <Link className="btn btn-primary btn-cta" to="/language">{t('start.continue')}</Link>
    </Layout>
  );
}

function InstallGuide({ intro }: { intro?: string }) {
  const { t } = useApp();
  return (
    <Card>
      <h2>{t('install.title')}</h2>
      {intro && <p>{intro}</p>}
      <ol className="install-steps">
        <li>{t('install.step1')}</li>
        <li>{t('install.step2')}</li>
        <li>{t('install.step3')}</li>
      </ol>
      <Notice tone="warn">{t('install.android_only')}</Notice>
      <Link className="btn btn-secondary" to="/demo">{t('demo.try')}</Link>
    </Card>
  );
}

export function LanguageScreen() {
  const { setLang, lang } = useApp();
  const nav = useNavigate();
  return (
    <Layout nav={false}>
      <h1>{translate('lang.title', lang ?? 'mr')}</h1>
      {/* the title is repeated in all three languages so anyone can find their own */}
      <p className="muted">{LANGS.filter((l) => l !== (lang ?? 'mr')).map((l) => translate('lang.title', l)).join(' · ')}</p>
      <div className="stack">
        {LANGS.map((l) => (
          <div key={l} className="lang-row">
            <Button variant={lang === l ? 'primary' : 'secondary'} className="btn-big" lang={l}
                    onClick={() => { setLang(l); nav('/login'); }}>
              {translate(`lang.${l}`, l)}
            </Button>
            <SpeakButton text={translate('lang.title', l)} lang={l} label={translate('voice.listen', l)} />
          </div>
        ))}
      </div>
    </Layout>
  );
}

export function LoginScreen() {
  const { t, api, login } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      const u = await api.login(phone, code);
      login(u);
      nav(u.roles.length === 1 && WEB_ROLES.includes(u.roles[0]) ? homeFor(u.roles[0]) : '/role');
    } catch (e) {
      setError(e instanceof ApiError ? e.messageKey : 'error.NOT_FOUND');
    }
  }

  return (
    <Layout nav={false}>
      <h1>{t('login.title')}</h1>
      <Card>
        <label className="field">
          <span>{t('login.phone')}</span>
          <input inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                 placeholder="98xxxxxxxx" />
        </label>
        {!sent ? (
          <Button onClick={() => setSent(true)} disabled={phone.replace(/\D/g, '').length < 10}>{t('login.send')}</Button>
        ) : (
          <>
            <label className="field">
              <span>{t('login.code')}</span>
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
                     onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            </label>
            <Button onClick={submit} disabled={code.length !== 6}>{t('login.verify')}</Button>
          </>
        )}
        {error && <Notice tone="danger">{t(error)}</Notice>}
      </Card>
      {api.demo && (
        <Card className="card-quiet">
          <Notice>{t('login.demo_hint')}</Notice>
          <ul className="demo-accounts">
            {api.demoAccounts().map((u, i) => (
              <li key={u.id}>
                <code>{['9800000001', '9800000002', '9800000009', '9800000021', '9800000031'][i]}</code>{' '}
                {u.name} — {u.roles.map((r) => t(`role.${r}`)).join(', ')}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p><Link className="link-target" to="/recovery">{t('login.cant')}</Link></p>
    </Layout>
  );
}

export function RoleScreen() {
  const { t, user, setRole } = useApp();
  const nav = useNavigate();
  if (!user) return null;
  return (
    <Layout nav={false}>
      <h1>{t('role.title')}</h1>
      <div className="stack">
        {user.roles.map((r: Role) => {
          const field = FIELD_ROLES.includes(r);
          return (
            <div key={r}>
              <Button variant="secondary" className="btn-big" disabled={field}
                      onClick={() => { setRole(r); nav(homeFor(r)); }}>
                {t(`role.${r}`)}
              </Button>
              {field && <Notice tone="warn">{t('role.field_app_only')}</Notice>}
            </div>
          );
        })}
      </div>
      {user.roles.some((r) => FIELD_ROLES.includes(r)) && <InstallGuide />}
    </Layout>
  );
}

/** SCR-020 Demo home: isolated sample data; always reachable. */
export function DemoScreen() {
  const { t, api } = useApp();
  return (
    <Layout nav={false}>
      <h1>{t('demo.title')}</h1>
      <Notice>{t('demo.body')}</Notice>
      <ul className="demo-accounts">
        {api.demoAccounts().filter((u) => u.roles.some((r) => WEB_ROLES.includes(r))).map((u) => (
          <li key={u.id}>{u.name} — {u.roles.map((r) => t(`role.${r}`)).join(', ')}</li>
        ))}
      </ul>
      <Link className="btn btn-primary" to="/login">{t('login.verify')}</Link>
    </Layout>
  );
}
