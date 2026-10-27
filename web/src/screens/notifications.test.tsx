import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { AppProvider } from '../state/app';

function renderApp() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/language']}>
        <App />
      </MemoryRouter>
    </AppProvider>,
  );
}

async function login(phone: string) {
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: phone } });
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
  fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
}

const item = async (text: RegExp) => (await screen.findByText(text)).closest('li')!;

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Notification centre (SCR-013; T-256 UI part)', () => {
  it('the bell counts unacknowledged critical items; a critical item stays until acknowledged, then can be deleted', async () => {
    renderApp();
    await login('9800000002');                                         // Rahul, Admin
    fireEvent.click(await screen.findByRole('link', { name: 'Notifications, 1 critical' }));
    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeInTheDocument();

    const crit = await item(/Override needs your decision: PUN-0006/);
    expect(crit).toHaveTextContent('Critical');
    expect(crit).toHaveTextContent('Stays here until you acknowledge it');
    expect(crit).toHaveTextContent('Push: not connected');
    expect(crit).toHaveTextContent('a call task was created for the Admin team');
    expect(within(crit).queryByRole('button', { name: 'Delete' })).toBeNull();

    await act(async () => { fireEvent.click(within(crit).getByRole('button', { name: 'Acknowledge' })); });
    expect(await screen.findByRole('link', { name: 'Notifications' })).toBeInTheDocument();   // count gone
    const acked = await item(/Override needs your decision/);
    expect(acked).toHaveTextContent('Acknowledged');
    await act(async () => { fireEvent.click(within(acked).getByRole('button', { name: 'Delete' })); });
    expect(screen.queryByText(/Override needs your decision/)).toBeNull();
  });

  it('shows items held for quiet hours, and the demo says no delivery service is connected', async () => {
    renderApp();
    await login('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /^Notifications/ }));
    expect(await item(/Readiness photos pending: PUN-0003/)).toHaveTextContent(/Held for quiet hours until/);
    expect(screen.getByText(/no push, SMS, WhatsApp, email or call service is connected/)).toBeInTheDocument();
  });

  it('Open goes to the target screen', async () => {
    renderApp();
    await login('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /^Notifications/ }));
    fireEvent.click(within(await item(/Override needs your decision/)).getByRole('link', { name: 'Open' }));
    expect(await screen.findByRole('heading', { name: 'Approvals inbox' })).toBeInTheDocument();
  });

  it('a customer sees only their own items and no critical count', async () => {
    renderApp();
    await login('9800000021');
    fireEvent.click(await screen.findByRole('link', { name: 'Notifications' }));
    expect(await screen.findByText(/A payment stage is due: PUN-0003/)).toBeInTheDocument();
    expect(screen.queryByText(/Override needs your decision/)).toBeNull();
  });
});

describe('live notifications in the centre (slice 8)', () => {
  it('a decision on your request arrives in your language with the decision translated', async () => {
    renderApp();
    await login('9800000002');                                         // Rahul approves Asha's override
    fireEvent.click(await screen.findByRole('link', { name: /Approvals inbox/ }));
    const card = (await screen.findByText('PUN-0006')).closest('.card, article, section, li')!;
    await act(async () => { fireEvent.click(within(card as HTMLElement).getByRole('button', { name: 'Approve' })); });
    fireEvent.click(screen.getByRole('link', { name: /^☺?\s*Me$/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9800000001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
    fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
    fireEvent.click(await screen.findByRole('button', { name: 'Admin' }));
    fireEvent.change(screen.getByLabelText(/Language|भाषा/), { target: { value: 'mr' } });
    fireEvent.click(await screen.findByRole('link', { name: /सूचना/ }));
    expect(await screen.findByText('PUN-0006: Rahul Deshmukh यांनी तुमची विनंती मंजूर केली')).toBeInTheDocument();
  });
});
