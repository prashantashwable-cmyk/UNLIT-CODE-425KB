import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { AppProvider } from '../state/app';

let go: NavigateFunction;
function NavProbe() {
  go = useNavigate();
  return null;
}

function renderApp() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/language']}>
        <NavProbe />
        <App />
      </MemoryRouter>
    </AppProvider>,
  );
}

async function login(phone: string, role?: string, first = true) {
  if (first) fireEvent.click(screen.getByRole('button', { name: 'English' }));
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: phone } });
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
  fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
  if (role) fireEvent.click(screen.getByRole('button', { name: role }));
}

async function openRules() {
  fireEvent.click(await screen.findByRole('link', { name: /^☺?\s*Me$/ }));
  fireEvent.click(screen.getByRole('link', { name: 'Rules and settings' }));
  return screen.findByRole('heading', { name: 'Rules and settings', level: 1 });
}

function row(label: string) {
  return screen.getByRole('row', { name: new RegExp(label) });
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Rules and settings (SCR-079): Admin proposes, Owner approves', () => {
  it('shows each setting with its value, version and the decision it came from', async () => {
    renderApp();
    await login('9800000002');
    await openRules();
    const floor = row('Minimum price ratio');
    expect(floor).toHaveTextContent('1.2');
    expect(floor).toHaveTextContent('AIEC-DEC-008');
    expect(floor).toHaveTextContent('v1');
  });

  it('a proposal waits for the Owner; once approved the value and version change', async () => {
    renderApp();
    await login('9800000002');
    await openRules();
    fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'install_target_days' } });
    fireEvent.change(screen.getByLabelText('New value'), { target: { value: '21' } });
    const propose = screen.getByRole('button', { name: 'Propose change' });
    expect(propose).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Reason for the change'), { target: { value: 'Monsoon season' } });
    await act(async () => { fireEvent.click(propose); });
    const pending = screen.getByRole('region', { name: 'Proposals' });
    expect(pending).toHaveTextContent('14 days → 21 days');
    expect(pending).toHaveTextContent('Waiting for a decision');
    expect(row('Installation target')).toHaveTextContent('14');

    fireEvent.click(screen.getByRole('link', { name: /^☺?\s*Me$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    await login('9800000009', undefined, false);
    await openRules();
    const card = within(screen.getByRole('region', { name: 'Proposals' }));
    await act(async () => { fireEvent.click(card.getByRole('button', { name: 'Approve' })); });
    expect(row('Installation target')).toHaveTextContent('21');
    expect(row('Installation target')).toHaveTextContent('v2');
  });

  it('a person who is Admin and Owner cannot approve their own proposal', async () => {
    renderApp();
    await login('9800000001', 'Admin');
    await openRules();
    fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'lead_photos_min' } });
    fireEvent.change(screen.getByLabelText('New value'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Reason for the change'), { target: { value: 'Blurry leads' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Propose change' })); });
    fireEvent.click(screen.getByRole('link', { name: /^☺?\s*Me$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Switch role' }));
    fireEvent.click(screen.getByRole('button', { name: 'Owner' }));
    await openRules();
    const card = within(screen.getByRole('region', { name: 'Proposals' }));
    expect(card.getByText('You asked for this. Someone else must decide.')).toBeInTheDocument();
    expect(card.queryByRole('button', { name: 'Approve' })).toBeNull();
  });

  it('out-of-range values are refused with a clear message', async () => {
    renderApp();
    await login('9800000002');
    await openRules();
    fireEvent.change(screen.getByLabelText('Setting'), { target: { value: 'install_target_days' } });
    fireEvent.change(screen.getByLabelText('New value'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Reason for the change'), { target: { value: 'test' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Propose change' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Value is outside the allowed range');
  });

  it('risky features are shown locked with what they wait for; there is no switch', async () => {
    renderApp();
    await login('9800000009');
    await openRules();
    const locked = screen.getByRole('region', { name: 'Locked features' });
    expect(locked).toHaveTextContent('Live payouts');
    expect(locked).toHaveTextContent('AIEC-DEC-017');
    expect(within(locked).queryByRole('checkbox')).toBeNull();
    expect(within(locked).queryByRole('switch')).toBeNull();
  });

  it('the Owner sees the open decisions and the default in use (SCR-085)', async () => {
    renderApp();
    await login('9800000009');
    await openRules();
    const open = screen.getByRole('region', { name: 'Open owner decisions' });
    expect(open).toHaveTextContent('AIEC-DEC-008');
    expect(open).toHaveTextContent('Floor of 1.20 on the fully loaded base');
    expect(open).not.toHaveTextContent('AIEC-DEC-012');   // answered
  });

  it('customers cannot open Rules and settings', async () => {
    renderApp();
    await login('9800000021');
    await screen.findByRole('heading', { name: 'Your lift' });
    await act(async () => { go('/admin/rules'); });
    expect(screen.queryByRole('heading', { name: 'Rules and settings' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Your lift' })).toBeInTheDocument();
  });
});
