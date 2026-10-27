import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
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

export function Layout({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  const { t, api, role } = useApp();
  const online = useOnline();
  const tabs = [
    { to: '/today', key: 'nav.today', icon: '☀' },
    { to: homeFor(role), key: 'nav.work', icon: '▤' },
    { to: '/chat', key: 'nav.chat', icon: '✉' },
    { to: '/money', key: 'nav.money', icon: '₹' },
    { to: '/me', key: 'nav.me', icon: '☺' },
  ];
  return (
    <div className="shell">
      <a className="skip" href="#main">{t('app.skip')}</a>
      <header className="topbar">
        <span className="brand">{t('app.name')}</span>
        <Link className="help" to="/help" aria-label={t('shared.help')}>
          <span aria-hidden="true">?</span> {t('shared.help')}
        </Link>
      </header>
      {api.demo && <div className="banner banner-demo" role="note"><span aria-hidden="true">◆</span> {t('app.demo_banner')}</div>}
      {!online && <div className="banner banner-offline" role="status"><span aria-hidden="true">⚡</span> {t('app.offline')}</div>}
      <main id="main" className="main">{children}</main>
      {nav && role && (
        <nav className="bottomnav" aria-label="Main">
          {tabs.map((tab) => (
            <NavLink key={tab.key} to={tab.to} className={({ isActive }) => `tab${isActive ? ' tab-active' : ''}`}>
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              <span>{t(tab.key)}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
