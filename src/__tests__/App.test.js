import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import App from '../App';

let container;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  document.body.removeChild(container);
  container = null;
});


it('renders App component using react-test-renderer', () => {
  const component = renderer.create(
    <App />,
  );
  expect(component).toMatchSnapshot();
});

it('DOM Test: click adjust weight btn and see if modal shows correctly', () => {
  act(() => {
    ReactDOM.render(
      <App />, container,
    );
  });
  const button = container.getElementsByTagName('button')[0];
  expect(button.textContent).toBe('Adjust Weights');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  const modal = document.getElementsByClassName('modal-title')[0];
  expect(modal.textContent).toBe('Weights for Assignments and Tests');
});

it('Test Indexed DB creation works fine', () => {
  const indexedDB = require('fake-indexeddb');
  const request = indexedDB.open('test', 3);
  request.onupgradeneeded = function () {
    const db = request.result;
    const store = db.createObjectStore('course', { keyPath: 'id', autoIncrement: true });
    store.put({
      asgn1: '86', asgn2: '85', attnd: '96', grade: '90.00', name: 'Rupinder Matharoo', pass: true, sid: '1235235', test1: '93', test2: '93'
    });
    store.put({
      asgn1: '86', asgn2: '85', attnd: '96', grade: '90.00', name: 'Gucci Matharoo', pass: true, sid: '1235235', test1: '93', test2: '93'
    });
    store.put({
      asgn1: '86', asgn2: '85', attnd: '96', grade: '90.00', name: 'LV Matharoo', pass: true, sid: '1235235', test1: '93', test2: '93' 
    });
  };
});
