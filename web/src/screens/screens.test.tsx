import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { AppProvider } from '../state/app';

let go: NavigateFunction;
function NavProbe() {
  go = useNavigate();
  return null;
}

function renderApp(path = '/') {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>
        <NavProbe />
        <App />
      </MemoryRouter>
    </AppProvider>,
  );
}

async function loginAs(phone: string) {
  fireEvent.click(screen.getByRole('link', { name: /ब्राउझरमध्ये पुढे चला|Continue in the browser/ }));
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: phone } });
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
  fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123456' } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('entry flow', () => {
  it('starts at the install gate (SCR-001) with the demo always reachable, then the language choice', async () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'AIEC फील्ड ॲप इन्स्टॉल करा' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'डेमो वापरून पाहा' })).toBeInTheDocument();
  });

  it('language choice is Marathi first and sets the page language', async () => {
    renderApp('/language');
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('मराठी');
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { name: 'Log in with your mobile number' })).toBeInTheDocument();
  });

  it('always shows the demo banner and a red Help', () => {
    renderApp('/language');
    expect(screen.getByRole('note')).toHaveTextContent(/DEMO|डेमो/);
    expect(screen.getByRole('link', { name: /Help|मदत/ })).toBeInTheDocument();
  });

  it('wrong code shows the localised error', async () => {
    renderApp('/language');
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '9800000002' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send code' }));
    fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '000000' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Log in' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Wrong code. Try again');
  });

  it('field roles cannot use the web app (part of T-006; install guide not built yet)', async () => {
    renderApp();
    await loginAs('9800000031');
    expect(screen.getByRole('button', { name: 'Technician' })).toBeDisabled();
    expect(screen.getByText(/Field work uses the Android app/)).toBeInTheDocument();
  });
});

describe('admin', () => {
  it('lands on the exceptions queue with stopped items first, status shown as icon + text', async () => {
    renderApp();
    await loginAs('9800000002');
    expect(await screen.findByRole('heading', { name: 'Exceptions to resolve' })).toBeInTheDocument();
    const first = screen.getAllByRole('listitem')[0];
    expect(first).toHaveTextContent('Stopped');
    expect(first.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('approvals: reject needs a reason; approve records the decision', async () => {
    renderApp();
    await loginAs('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: 'Approvals inbox' }));
    const card = (await screen.findByText('Cancellation request')).closest('section')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Reject' }));
    const confirm = within(card).getByRole('button', { name: 'Reject' });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(card).getByLabelText('Why are you rejecting?'), { target: { value: 'Society must vote first' } });
    expect(confirm).toBeEnabled();

    const qc = screen.getByText('QC clearance').closest('section')!;
    await act(async () => { fireEvent.click(within(qc).getByRole('button', { name: 'Approve' })); });
    const qcAfter = (await screen.findByText('QC clearance')).closest('section')!;
    expect(qcAfter).toHaveTextContent(/Decided: Approved · Rahul Deshmukh/);
  });

  it('an override is loud, and its requester cannot decide it (part of T-004; red timeline entry not built)', async () => {
    renderApp();
    await loginAs('9800000001');
    fireEvent.click(screen.getByRole('button', { name: 'Admin' }));
    fireEvent.click(await screen.findByRole('link', { name: 'Approvals inbox' }));
    const card = (await screen.findByText('Override')).closest('section')!;
    expect(card).toHaveTextContent('reviewed by the Owner weekly');
    expect(card).toHaveTextContent('You asked for this. Someone else must decide.');
    expect(within(card).queryByRole('button', { name: 'Approve' })).toBeNull();
  });
});

describe('customer', () => {
  it('sees only their lift, with the current stage marked and no invented live tracking', async () => {
    renderApp();
    await loginAs('9800000021');
    expect(await screen.findByRole('heading', { name: 'Your lift' })).toBeInTheDocument();
    const now = document.querySelector('[aria-current="step"]')!;
    expect(now).toHaveTextContent('Site readiness');
    expect(now).toHaveTextContent('Now');
    expect(screen.getByText(/Live tracking is not connected/)).toBeInTheDocument();
  });
});

describe('owner', () => {
  it('summary chart has a table view', async () => {
    renderApp();
    await loginAs('9800000009');
    fireEvent.click(await screen.findByRole('link', { name: /Analytics/ }));
    expect(await screen.findByRole('heading', { name: 'Business summary' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show as table' }));
    expect(screen.getByRole('table')).toHaveTextContent('Installation');
  });
});

describe('role guards (display only; the database decides the data)', () => {
  it('a customer typing an admin or project URL is sent back to their own lift', async () => {
    renderApp();
    await loginAs('9800000021');
    expect(await screen.findByRole('heading', { name: 'Your lift' })).toBeInTheDocument();
    for (const url of ['/admin', '/project/p3', '/owner', '/analytics', '/admin/approvals']) {
      await act(async () => { go(url); });
      expect(screen.queryByRole('heading', { name: 'Exceptions to resolve' })).toBeNull();
      expect(screen.getByRole('heading', { name: 'Your lift' })).toBeInTheDocument();
    }
  });

  it('Help is reachable from every screen and is honest that it is not built yet', async () => {
    renderApp();
    await loginAs('9800000021');
    fireEvent.click(screen.getByRole('link', { name: /Help/ }));
    expect(screen.getByRole('heading', { name: 'Not built yet' })).toBeInTheDocument();
  });

  it('owner gets override approvals without project links (matrix: site location = summary)', async () => {
    renderApp();
    await loginAs('9800000009');
    const card = (await screen.findByText('Override')).closest('section')!;
    expect(within(card).queryByRole('link', { name: 'PUN-0006' })).toBeNull();
    expect(screen.queryByText('QC clearance')).toBeNull();
  });
});

describe('settings', () => {
  it('scale slider keeps controls at or above the 44px office minimum', async () => {
    renderApp();
    await loginAs('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: /Me/ }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '20' } });
    const h = parseFloat(document.documentElement.style.getPropertyValue('--control-h'));
    expect(h).toBeGreaterThanOrEqual(44);
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('0.2');
  });
});

describe('slice 2: voice, trails, loud overrides, install guide', () => {
  it('each language button has a Listen control that reads the line in that language without navigating', async () => {
    const spoken: { lang: string }[] = [];
    vi.stubGlobal('speechSynthesis', { getVoices: () => [{ lang: 'mr-IN' }, { lang: 'hi-IN' }, { lang: 'en-IN' }],
      cancel: () => {}, speak: (u: { lang: string }) => spoken.push(u) });
    vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; voice = null; constructor(public text: string) {} });
    renderApp('/language');
    const listen = screen.getAllByRole('button', { name: /ऐका|सुनें|Listen/ });
    expect(listen).toHaveLength(3);
    fireEvent.click(listen[1]);
    expect(spoken[0].lang).toBe('hi-IN');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('तुमची भाषा निवडा');
    vi.unstubAllGlobals();
  });

  it('says so when the phone has no voice for the language', async () => {
    vi.stubGlobal('speechSynthesis', { getVoices: () => [{ lang: 'en-US' }], cancel: () => {}, speak: () => {} });
    vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; voice = null; constructor(public text: string) {} });
    renderApp('/language');
    fireEvent.click(screen.getAllByRole('button', { name: /ऐका/ })[0]);
    expect(screen.getByRole('status')).toHaveTextContent('या फोनमध्ये या भाषेचा आवाज अजून नाही');
    vi.unstubAllGlobals();
  });

  it('status chips are announced as "state, reason"', async () => {
    renderApp();
    await loginAs('9800000002');
    await screen.findByRole('heading', { name: 'Exceptions to resolve' });
    expect(screen.getAllByLabelText('Stopped, Payment not confirmed. Container will not open').length).toBeGreaterThan(0);
  });

  it('a decided approval shows its trail; an override decision is a red timeline entry with its reason', async () => {
    renderApp();
    await loginAs('9800000002');
    fireEvent.click(await screen.findByRole('link', { name: 'Approvals inbox' }));
    const card = (await screen.findByText('Override')).closest('section')!;
    await act(async () => { fireEvent.click(within(card).getByRole('button', { name: 'Approve' })); });
    const after = (await screen.findByText('Override')).closest('section')!;
    expect(after).toHaveTextContent('Decided by');
    expect(after).toHaveTextContent('Rahul Deshmukh · Admin');
    expect(after).toHaveTextContent('Version 2');
    fireEvent.click(within(after).getByRole('link', { name: 'PUN-0006' }));
    const first = (await screen.findAllByRole('listitem')).find((li) => li.classList.contains('tl'))!;
    expect(first).toHaveClass('tl-red');
    expect(first).toHaveTextContent('Override approved');
    expect(first).toHaveTextContent('Permit office closed; proceed on scanned receipt');
  });

  it("the Owner's summary lists this week's overrides with their reason (T-160)", async () => {
    renderApp();
    await loginAs('9800000009');
    fireEvent.click(await screen.findByRole('link', { name: /Analytics/ }));
    const list = (await screen.findByRole('heading', { name: 'Overrides to review this week' })).closest('section')!;
    expect(list).toHaveTextContent('PUN-0006');
    expect(list).toHaveTextContent('Waiting for a decision');
    expect(list).toHaveTextContent('Permit office closed; proceed on scanned receipt');
  });

  it('a field role sees the install guide and can still open the demo (T-006)', async () => {
    renderApp();
    await loginAs('9800000031');
    expect(screen.getByRole('heading', { name: 'Install the AIEC field app' })).toBeInTheDocument();
    expect(screen.getByText(/Android-only at launch/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Try the demo' }));
    expect(screen.getByRole('heading', { name: 'Demo' })).toBeInTheDocument();
  });

  it('the top bar has a language switch on every screen (LANG3)', async () => {
    renderApp();
    await loginAs('9800000002');
    await screen.findByRole('heading', { name: 'Exceptions to resolve' });
    fireEvent.change(screen.getByRole('combobox', { name: /Language|भाषा/ }), { target: { value: 'hi' } });
    expect(await screen.findByRole('heading', { name: 'हल करने वाले अपवाद' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('hi');
  });
});
