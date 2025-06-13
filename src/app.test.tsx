import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import { MemoryRouter } from 'react-router-dom';

it('renders without crashing', () => {
  process.env.REACT_APP_AUTH0_NAMESPACE = 'https://taskvision.com/';
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
  delete process.env.REACT_APP_AUTH0_NAMESPACE;
});

export {};
