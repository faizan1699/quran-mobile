import React from 'react';

declare global {
  namespace JSX {
    interface ElementClass {
      refs?: any;
    }
  }
}
