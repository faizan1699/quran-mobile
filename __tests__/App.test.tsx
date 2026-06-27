/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

import { it } from '@jest/globals';

import renderer, { act } from 'react-test-renderer';

it('renders correctly', () => {
  let tree: renderer.ReactTestRenderer | undefined;
  act(() => {
    tree = renderer.create(<App />);
  });
  act(() => {
    tree?.unmount();
  });
});
