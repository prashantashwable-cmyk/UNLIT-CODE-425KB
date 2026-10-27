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

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Notification follow-up for Admin (call tasks + notification record)', () => {
  it('logs call attempts; your own call task is left to someone else', async () => {
    renderApp();
    await login('9800000002');                                         // Rahul, Admin
    fireEvent.click(await screen.findByRole('link', { name: 'Notification follow-up' }));
    const calls = await screen.findByRole('region', { name: 'Call tasks' });
    const vik = within(calls).getByText('Vikram Joshi').closest('li')!;
    expect(vik).toHaveTextContent('Override needs your decision: PUN-0006');
    expect(vik).toHaveTextContent('+91 98•• ••09');
    const own = within(calls).getByText('Rahul Deshmukh').closest('li')!;
    expect(own).toHaveTextContent('Someone else must call you');
    expect(within(own).queryByRole('button')).toBeNull();

    await act(async () => { fireEvent.click(within(vik).getByRole('button', { name: 'No answer' })); });
    expect(vik).toHaveTextContent('No answer · Rahul Deshmukh (Admin)');
    fireEvent.change(within(vik).getByLabelText('Note (optional)'), { target: { value: 'Will decide today' } });
    await act(async () => { fireEvent.click(within(vik).getByRole('button', { name: 'Reached' })); });
    expect(vik).toHaveTextContent('Done');
    expect(vik).toHaveTextContent('Reached · Rahul Deshmukh (Admin)');
    expect(vik).toHaveTextContent('Will decide today');
    expect(within(vik).queryByRole('button', { name: 'Reached' })).toBeNull();
  });

  it('the notification record keeps deleted items', async () => {
    renderApp();
    await login('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /^Notifications/ }));
    const pay = (await screen.findByText(/Payment status updated by the provider/)).closest('li')!;
    await act(async () => { fireEvent.click(within(pay).getByRole('button', { name: 'Delete' })); });
    expect(screen.queryByText(/Payment status updated by the provider/)).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: /Today/ }));
    fireEvent.click(await screen.findByRole('link', { name: 'Notification follow-up' }));
    const record = await screen.findByRole('region', { name: 'Notification record' });
    const rows = within(record).getAllByRole('row').filter((r) => /Rahul Deshmukh/.test(r.textContent ?? '') && /Payment/.test(r.textContent ?? ''));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Deleted');
  });

  it('the critical item now says a call task was created', async () => {
    renderApp();
    await login('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /^Notifications/ }));
    const crit = (await screen.findByText(/Override needs your decision/)).closest('li')!;
    expect(crit).toHaveTextContent('Not delivered outside the app: a call task was created for the Admin team');
  });

  it('the Owner reaches follow-up from the approvals inbox and sees call tasks but not the record', async () => {
    renderApp();
    await login('9800000009');
    fireEvent.click(await screen.findByRole('link', { name: 'Notification follow-up' }));
    const calls = await screen.findByRole('region', { name: 'Call tasks' });
    expect(within(calls).getByText('Rahul Deshmukh').closest('li')!).toHaveTextContent('Reached');
    expect(screen.queryByRole('region', { name: 'Notification record' })).toBeNull();
  });
});
