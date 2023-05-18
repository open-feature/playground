import { StrictMode } from 'react';
import { render } from 'react-dom/';
import { Demos } from './app/demos';

const root = document.getElementById('root');

render(
  <StrictMode>
    <Demos />
  </StrictMode>,
  root
);