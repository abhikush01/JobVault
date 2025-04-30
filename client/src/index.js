import {createRoot} from 'react-dom/client';
import {BrowserRouter, Rote} from 'react-router'
import App from './App'

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);