import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createDemoApi } from '../data/demoAdapter';
import { WEB_ROLES, type Api, type Role, type User } from '../data/types';
import { translate, type Lang } from '../i18n/i18n';
import { controlSize, scaleFactor, themeVars, type ThemeName } from '../theme/theme';

interface AppState {
  api: Api;
  lang: Lang | null;
  setLang(l: Lang): void;
  theme: ThemeName;
  setTheme(t: ThemeName): void;
  scale: number;
  setScale(p: number): void;
  user: User | null;
  role: Role | null;
  login(u: User): void;
  setRole(r: Role): void;
  logout(): void;
  t(key: string, vars?: Record<string, string | number>): string;
}

const Ctx = createContext<AppState | null>(null);

// Per-viewer preferences only; losing them is harmless (wrapped: storage can be blocked).
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`aiec.${key}`);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(`aiec.${key}`, JSON.stringify(value));
  } catch { /* storage unavailable */ }
}

export function AppProvider({ children, api }: { children: ReactNode; api?: Api }) {
  const [theApi] = useState<Api>(() => api ?? createDemoApi());
  const [lang, setLangState] = useState<Lang | null>(() => load<Lang | null>('lang', null));
  const [theme, setThemeState] = useState<ThemeName>(() => load<ThemeName>('theme', 'light'));
  const [scale, setScaleState] = useState<number>(() => load<number>('scale', 100));
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(themeVars(theme))) root.style.setProperty(k, v);
    root.style.setProperty('--font-scale', String(scaleFactor(scale)));
    root.style.setProperty('--control-h', `${controlSize(48, scale, 'office')}px`);
    // primary actions keep the 48dp field minimum (§12); other office controls 44px (§11)
    root.style.setProperty('--control-h-primary', `${controlSize(56, scale, 'field')}px`);
    root.dataset.theme = theme;
    root.lang = lang ?? 'mr';
  }, [theme, scale, lang]);

  const value = useMemo<AppState>(() => ({
    api: theApi, lang, theme, scale, user, role,
    setLang: (l) => { setLangState(l); save('lang', l); },
    setTheme: (t) => { setThemeState(t); save('theme', t); },
    setScale: (p) => { setScaleState(p); save('scale', p); },
    // A single web role is picked automatically; field roles never are (T-006: they use the Android app).
    login: (u) => { setUser(u); setRoleState(u.roles.length === 1 && WEB_ROLES.includes(u.roles[0]) ? u.roles[0] : null); },
    setRole: (r) => { if (WEB_ROLES.includes(r)) setRoleState(r); },
    logout: () => { setUser(null); setRoleState(null); },
    t: (key, vars) => translate(key, lang ?? 'mr', vars),
  }), [theApi, lang, theme, scale, user, role]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

/** Where a role's Work tab goes. */
export function homeFor(role: Role | null): string {
  if (role === 'admin') return '/admin';
  if (role === 'backup_approver') return '/admin/approvals';
  if (role === 'owner') return '/owner';
  if (role === 'customer') return '/c/progress';
  return '/today';
}
