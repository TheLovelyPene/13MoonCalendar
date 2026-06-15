import { renderToString } from 'react-dom/server';
import React from 'react';
import App from './src/App';

try {
  console.log(renderToString(React.createElement(App)));
  console.log("RENDER 1 SUCCESS");
} catch (e) {
  console.error("RENDER ERROR:", e);
}
