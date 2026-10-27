import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LANGS, translate, type Lang } from '../i18n/i18n';
import { homeFor, useApp } from '../state/app';

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

function useCriticalCount() {
  const { api, user, role, notifTick } = useApp();
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    if (user && role) api.listNotifications(user, role)
      .then((list) => { if (live) setN(list.filter((x) => x.priority === 'critical' && !x.acknowledgedAt).length); })
      .catch(() => { if (live) setN(0); });
    return () => { live = false; };
  }, [api, user, role, notifTick]);
  return n;
}

function BellIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function Layout({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  const { t, api, role, lang, setLang } = useApp();
  const online = useOnline();
  const critical = useCriticalCount();
  // FIVE_TABS: the same five for every role; Admin and Owner add Analytics.
  const tabs = [
    { to: homeFor(role), key: 'nav.today', icon: '☀', end: true },
    { to: '/map', key: 'nav.map', icon: '⌖' },
    { to: '/chat', key: 'nav.chat', icon: '✉' },
    { to: '/money', key: 'nav.money', icon: '₹' },
    { to: '/me', key: 'nav.me', icon: '☺' },
    ...(role === 'admin' || role === 'owner' ? [{ to: '/analytics', key: 'nav.analytics', icon: '▥' }] : []),
  ];
  return (
    <div className="shell">
      <a className="skip" href="#main">{t('app.skip')}</a>
      <header className="topbar">
        <span className="brand">{t('app.name')}</span>
        <select className="lang-switch" aria-label={t('me.language')} value={lang ?? 'mr'}
                onChange={(e) => setLang(e.target.value as Lang)}>
          {LANGS.map((l) => <option key={l} value={l} lang={l}>{translate(`lang.${l}`, l)}</option>)}
        </select>
        {role && (
          <Link className="bell" to="/notifications"
                aria-label={critical > 0 ? `${t('notif.title')}, ${t('notif.critical_count', { n: critical })}` : t('notif.title')}>
            <BellIcon />
            {critical > 0 && <span className="bell-count" aria-hidden="true">{critical}</span>}
          </Link>
        )}
        <Link className="help" to="/help" aria-label={t('shared.help')}>
          <span aria-hidden="true">?</span> {t('shared.help')}
        </Link>
      </header>
      {api.demo && <div className="banner banner-demo" role="note"><span aria-hidden="true">◆</span> {t('app.demo_banner')}</div>}
      {!online && <div className="banner banner-offline" role="status"><span aria-hidden="true">⚡</span> {t('app.offline')}</div>}
      <main id="main" className="main">{children}</main>
      {nav && role && (
        <nav className="bottomnav" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => (
            <NavLink key={tab.key} to={tab.to} end={'end' in tab} className={({ isActive }) => `tab${isActive ? ' tab-active' : ''}`}>
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              <span>{t(tab.key)}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
