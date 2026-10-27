import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { formatMoney } from '../components/ui';
import { AppProvider } from '../state/app';

function renderApp(path = '/language') {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AppProvider>,
  );
}

async function loginAs(phone: string, role?: string) {
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: phone } });
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
  fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
  if (role) fireEvent.click(screen.getByRole('button', { name: role }));
}

function tabs() {
  return within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link').map((a) => a.lastElementChild?.textContent?.trim());
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('five tabs for every role; Admin and Owner add Analytics (FIVE_TABS)', () => {
  it('customer: Today, Map, Chat, Money, Me', async () => {
    renderApp();
    await loginAs('9800000021');
    await screen.findByRole('heading', { name: 'Your lift' });
    expect(tabs()).toEqual(['Today', 'Map', 'Chat', 'Money', 'Me']);
  });

  it('admin: the same five plus Analytics; Today is the exceptions queue', async () => {
    renderApp();
    await loginAs('9800000002');
    expect(await screen.findByRole('heading', { name: 'Exceptions to resolve' })).toBeInTheDocument();
    expect(tabs()).toEqual(['Today', 'Map', 'Chat', 'Money', 'Me', 'Analytics']);
    fireEvent.click(screen.getByRole('link', { name: /Analytics/ }));
    expect(await screen.findByRole('heading', { name: 'Business summary' })).toBeInTheDocument();
  });

  it("owner: Today is the decision queue", async () => {
    renderApp();
    await loginAs('9800000009');
    expect(await screen.findByRole('heading', { name: 'Approvals inbox' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Analytics/ }));
    expect(await screen.findByRole('heading', { name: 'Business summary' })).toBeInTheDocument();
  });

  it('Map is honest that no map provider is connected', async () => {
    renderApp();
    await loginAs('9800000021');
    fireEvent.click(await screen.findByRole('link', { name: /Map/ }));
    expect(screen.getByText(/Map is not connected yet/)).toBeInTheDocument();
  });
});

describe('chat: one thread per project (SCR-009, SCR-010)', () => {
  it('a customer sees only their own project thread', async () => {
    renderApp();
    await loginAs('9800000021');
    fireEvent.click(await screen.findByRole('link', { name: /Chat/ }));
    const links = await screen.findAllByRole('link', { name: /PUN-/ });
    expect(links.map((l) => l.textContent)).toEqual([expect.stringContaining('PUN-0003')]);
  });

  it('system events look different from messages, and a sent message appears in the thread', async () => {
    renderApp();
    await loginAs('9800000021');
    fireEvent.click(await screen.findByRole('link', { name: /Chat/ }));
    fireEvent.click(await screen.findByRole('link', { name: /PUN-0003/ }));
    const system = await screen.findAllByRole('listitem', { name: /System update/ });
    expect(system.length).toBeGreaterThan(0);
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Is the lift pit ready for measurement?' } });
    await act(async () => { fireEvent.click(send); });
    const mine = await screen.findByText('Is the lift pit ready for measurement?');
    expect(mine.closest('li')).toHaveTextContent('Meera Patil');
  });

  it('never shows a phone number in a thread (masked contact)', async () => {
    renderApp();
    await loginAs('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /Chat/ }));
    fireEvent.click(await screen.findByRole('link', { name: /PUN-0003/ }));
    await screen.findAllByRole('listitem', { name: /System update/ });
    expect(screen.getByRole('main').textContent).not.toMatch(/\+91|\b\d{10}\b/);
  });
});

describe('money: role-specific, no wallet, status only from the provider (SCR-011, PAY_TRUTH, NO_WALLET)', () => {
  it('formats rupees with Indian grouping in every language', () => {
    expect(formatMoney(69000000, 'en')).toBe('₹6,90,000');
    expect(formatMoney(69000000, 'mr')).toBe('₹6,90,000');
    expect(formatMoney(69000000, 'hi')).toBe('₹6,90,000');
    expect(formatMoney(1000000, 'mr')).toBe('₹10,000');
  });

  it('customer sees the milestone schedule with provider statuses and cannot mark anything paid', async () => {
    renderApp();
    await loginAs('9800000021');
    fireEvent.click(await screen.findByRole('link', { name: /Money/ }));
    const table = await screen.findByRole('table');
    expect(table).toHaveTextContent('₹10,000');
    expect(table).toHaveTextContent('Confirmed');
    expect(table).toHaveTextContent('Pending');
    expect(screen.getByText(/Online payment is not connected yet/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pay|Mark paid/ })).toBeNull();
    expect(screen.getByRole('main').textContent?.toLowerCase()).not.toMatch(/wallet|वॉलेट/);
  });

  it('admin sees payments across projects, and the ledger is honest about not being connected', async () => {
    renderApp();
    await loginAs('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /Money/ }));
    const table = await screen.findByRole('table');
    expect(table).toHaveTextContent('PUN-0002');
    expect(table).toHaveTextContent('PUN-0003');
    expect(screen.getByText(/Ledger and payouts appear once the payment provider is connected/)).toBeInTheDocument();
  });
});
