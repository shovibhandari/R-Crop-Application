import {createRoot} from 'react-dom/client';
import React from 'react';
import Example from './Example';

const container = document.getElementById('main');
const root = createRoot(container!);

root.render(<Example />);
