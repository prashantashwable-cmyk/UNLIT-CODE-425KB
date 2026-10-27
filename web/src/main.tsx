import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/700.css';
import '@fontsource/noto-sans-devanagari/400.css';
import '@fontsource/noto-sans-devanagari/700.css';
import './styles.css';
import { App } from './App';
import { AppProvider } from './state/app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      {/* The portable single-file build (phone download / hosted page) navigates in memory: no server, no URL paths. */}
      {import.meta.env.VITE_ROUTER === 'memory' ? (
        <MemoryRouter><App /></MemoryRouter>
      ) : (
        <BrowserRouter><App /></BrowserRouter>
      )}
    </AppProvider>
  </StrictMode>,
);
