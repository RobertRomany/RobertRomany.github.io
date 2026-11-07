import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { initAnalytics } from './analytics';
initAnalytics();
createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>);
