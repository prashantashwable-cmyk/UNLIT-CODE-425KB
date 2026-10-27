// SCR-002 language, SCR-003 OTP login, SCR-007 role switcher.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Notice } from '../components/ui';
import { Layout } from '../components/Layout';
import { ApiError, FIELD_ROLES, WEB_ROLES, type Role } from '../data/types';
import { LANGS, translate } from '../i18n/i18n';
import { homeFor, useApp } from '../state/app';

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
          <Button key={l} variant={lang === l ? 'primary' : 'secondary'} className="btn-big" lang={l}
                  onClick={() => { setLang(l); nav('/login'); }}>
            {translate(`lang.${l}`, l)}
          </Button>
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
    </Layout>
  );
}
