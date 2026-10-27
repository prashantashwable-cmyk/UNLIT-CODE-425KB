import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
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

async function login(phone: string, first = true) {
  if (first) fireEvent.click(screen.getByRole('button', { name: 'English' }));
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: phone } });
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
  fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
}

async function logout() {
  fireEvent.click(await screen.findByRole('link', { name: /^☺?\s*Me$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
}

const NO_TIME_PROMISE = /\b\d+\s*(min|minute|hour|hr)s?\b|मिनिट|तास|मिनट|घंटे/i;

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('Help (SCR-018): danger first, always reaches a person, no time promise', () => {
  it('works before login: shows "call 112" as text and offers recovery', () => {
    renderApp('/start');
    fireEvent.click(screen.getByRole('link', { name: /मदत/ }));
    const danger = screen.getByRole('region', { name: /112/ });
    expect(danger).toHaveTextContent('धोका असेल तर 112 वर कॉल करा');
    expect(within(danger).getByText('112', { selector: '.big-number' })).toBeInTheDocument();
    expect(screen.getByRole('main').textContent).not.toMatch(NO_TIME_PROMISE);
    expect(screen.getByRole('link', { name: /लॉग इन होत नाही/ })).toBeInTheDocument();
  });

  it('a logged-in person can ask for a call-back; the answer promises a person, not a time', async () => {
    renderApp();
    await login('9800000021');
    fireEvent.click(screen.getByRole('link', { name: /Help/ }));
    fireEvent.click(screen.getByRole('radio', { name: 'Payment' }));
    fireEvent.change(screen.getByLabelText('What do you need? (optional)'), { target: { value: 'Which account do I pay into?' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Request a call-back' })); });
    expect(screen.getByText(/A person from AIEC will contact you/)).toBeInTheDocument();
    expect(screen.getByRole('main').textContent).not.toMatch(NO_TIME_PROMISE);
  });

  it('the request appears for Admin, who marks it contacted', async () => {
    renderApp();
    await login('9800000021');
    fireEvent.click(screen.getByRole('link', { name: /Help/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Start a chat' })); });
    await logout();
    await login('9800000002', false);
    const box = await screen.findByRole('region', { name: 'Help requests' });
    expect(box).toHaveTextContent('Meera Patil');
    await act(async () => { fireEvent.click(within(box).getByRole('button', { name: 'Mark contacted' })); });
    expect(box).toHaveTextContent('Contacted · Rahul Deshmukh');
  });
});

describe('Account recovery (SCR-019; part of T-008 and T-259)', () => {
  it('blocks logins until a person verifies, then works again', async () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    fireEvent.click(screen.getByRole('link', { name: "Can't log in?" }));
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9800000021' } });
    fireEvent.click(screen.getByRole('radio', { name: 'I lost my phone' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Start recovery' })); });
    expect(screen.getByText(/A person will check who you are/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Back to log in' }));
    await login('9800000021', false);
    expect(screen.getByRole('alert')).toHaveTextContent('Recovery in progress');

    // the code box stays open after a refused login; the Admin types their own number and code
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9800000002' } });
    fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
    const box = await screen.findByRole('region', { name: 'Account recovery' });
    expect(box).toHaveTextContent('Meera Patil');
    expect(box).toHaveTextContent('1 reviewer needed');
    await act(async () => { fireEvent.click(within(box).getByRole('button', { name: 'Verified in person' })); });
    expect(box).toHaveTextContent('Verified');
    await logout();
    await login('9800000021', false);
    expect(await screen.findByRole('heading', { name: 'Your lift' })).toBeInTheDocument();
  });

  it('gives the same answer for a number that is not on file', async () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    fireEvent.click(screen.getByRole('link', { name: "Can't log in?" }));
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9123456789' } });
    fireEvent.click(screen.getByRole('radio', { name: 'I lost my phone' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Start recovery' })); });
    expect(screen.getByText(/A person will check who you are/)).toBeInTheDocument();
    expect(screen.queryByText(/not on file|not found|not invited/i)).toBeNull();
  });

  it('Owner reviews an Admin account recovery; Admin can close a request that is not genuine, with a reason', async () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    fireEvent.click(screen.getByRole('link', { name: "Can't log in?" }));
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9800000002' } });
    fireEvent.click(screen.getByRole('radio', { name: 'I lost my phone' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Start recovery' })); });
    fireEvent.click(screen.getByRole('link', { name: 'Back to log in' }));

    await login('9800000009', false);                       // Owner only
    const box = await screen.findByRole('region', { name: 'Account recovery' });
    expect(screen.queryByRole('region', { name: 'Help requests' })).toBeNull();
    expect(box).toHaveTextContent('Rahul Deshmukh');
    expect(box).toHaveTextContent('2 different reviewers needed');
    expect(within(box).queryByRole('button', { name: 'Not genuine: close' })).toBeNull();
    await act(async () => { fireEvent.click(within(box).getByRole('button', { name: 'Verified in person' })); });
    expect(box).toHaveTextContent('Vikram Joshi');
    await logout();

    await login('9800000001', false);                       // Asha: Admin closes it instead
    fireEvent.click(await screen.findByRole('button', { name: 'Admin' }));
    const box2 = await screen.findByRole('region', { name: 'Account recovery' });
    fireEvent.click(within(box2).getByRole('button', { name: 'Not genuine: close' }));
    await act(async () => { fireEvent.click(within(box2).getByRole('button', { name: 'Close request' })); });
    expect(screen.getByText('Write why you are closing it')).toBeInTheDocument();
    fireEvent.change(within(box2).getByLabelText('Why are you closing it?'), { target: { value: 'Rahul confirmed in person he has his phone' } });
    await act(async () => { fireEvent.click(within(box2).getByRole('button', { name: 'Close request' })); });
    expect(box2).toHaveTextContent('Closed · Asha Kulkarni · Rahul confirmed in person he has his phone');
  });
});
