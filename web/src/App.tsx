import type { ReactNode } from 'react';
import type { Role } from './data/types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DemoScreen, LanguageScreen, LoginScreen, RoleScreen, StartScreen } from './screens/Entry';
import { AdminScreen, ApprovalsScreen, ProjectScreen } from './screens/Work';
import { ChatListScreen, ChatThreadScreen, MapScreen, MoneyScreen } from './screens/Talk';
import { RulesScreen } from './screens/Rules';
import { HelpScreen, RecoveryScreen } from './screens/Support';
import { CustomerProgressScreen, MeScreen, OwnerScreen } from './screens/Views';
import { homeFor, useApp } from './state/app';

// Screen access by role (screen inventory roles column). Display only: the database decides what data comes back.
function Guard({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { lang, user, role } = useApp();
  if (!lang) return <Navigate to="/language" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/role" replace />;
  if (roles && !roles.includes(role)) return <Navigate to={homeFor(role)} replace />;
  return <>{children}</>;
}

export function App() {
  const { lang, user, role } = useApp();
  const start = !lang ? '/start' : !user ? '/login' : !role ? '/role' : homeFor(role);
  return (
    <Routes>
      <Route path="/" element={<Navigate to={start} replace />} />
      <Route path="/start" element={<StartScreen />} />
      <Route path="/language" element={<LanguageScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/role" element={user ? <RoleScreen /> : <Navigate to="/login" replace />} />
      <Route path="/today" element={<Navigate to={start} replace />} />
      <Route path="/map" element={<Guard><MapScreen /></Guard>} />
      <Route path="/admin" element={<Guard roles={['admin']}><AdminScreen /></Guard>} />
      <Route path="/admin/approvals" element={<Guard roles={['admin', 'owner', 'backup_approver']}><ApprovalsScreen /></Guard>} />
      <Route path="/project/:id" element={<Guard roles={['admin']}><ProjectScreen /></Guard>} />
      <Route path="/c/progress" element={<Guard roles={['customer']}><CustomerProgressScreen /></Guard>} />
      <Route path="/owner" element={<Navigate to="/analytics" replace />} />
      <Route path="/admin/rules" element={<Guard roles={['admin', 'owner']}><RulesScreen /></Guard>} />
      <Route path="/analytics" element={<Guard roles={['owner', 'admin']}><OwnerScreen /></Guard>} />
      <Route path="/me" element={<Guard><MeScreen /></Guard>} />
      <Route path="/chat" element={<Guard><ChatListScreen /></Guard>} />
      <Route path="/chat/:projectId" element={<Guard><ChatThreadScreen /></Guard>} />
      <Route path="/money" element={<Guard><MoneyScreen /></Guard>} />
      <Route path="/demo" element={<DemoScreen />} />
      <Route path="/help" element={<HelpScreen />} />
      <Route path="/recovery" element={<RecoveryScreen />} />
      <Route path="*" element={<Navigate to={start} replace />} />
    </Routes>
  );
}
