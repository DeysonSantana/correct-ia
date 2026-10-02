import './styles/main.css';
import { App } from './ui/App';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Elemento raiz #app não encontrado no DOM.');
  }

  new App(root);
});
