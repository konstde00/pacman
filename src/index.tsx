import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';

import * as Styled from './app.styled';
import * as theme from './theme';
import React from 'react';
import App from './App';

function render() {
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Styled.GlobalStyles />
      <App/>
    </ThemeProvider>
    ,
    document.getElementById('root')
  );
}

render();
