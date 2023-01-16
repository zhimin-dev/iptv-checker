import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { MainContext } from './context/main';
import Welcome from './components/welcome/index'
import Detail from './components/detail/index'
import Watch from './components/watch/index'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';

export default function App() {

  const _mainContext = React.useContext(MainContext);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minWidth: 100 }}>
        {
          _mainContext.scene === 0 ? (
            <Welcome></Welcome>
          ) : ''
        }
        {
          _mainContext.scene === 1 ? (
            <Detail></Detail>
          ) : ''
        }
        {
          _mainContext.scene === 2 ? (
            <Watch></Watch>
          ) : ''
        }
      </Box>
    </ThemeProvider>
  );
}