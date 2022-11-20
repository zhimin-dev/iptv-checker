import * as React from 'react';
import Box from '@mui/material/Box';
import { MainContext } from './context/main';

import Welcome from './components/welcome/index'
import Detail from './components/detail/index'
import Watch from './components/watch/index'

export default function HorizontalLinearStepper() {

  const _mainContext = React.useContext(MainContext);

  return (
      <Box sx={{ minWidth: 100 }}>
        {
          _mainContext.scene === 0 ?(
            <Welcome></Welcome>
          ):''
        }
        {
          _mainContext.scene === 1 ?(
            <Detail></Detail>
          ):''
        }
        {
          _mainContext.scene === 2 ?(
            <Watch></Watch>
          ):''
        }
      </Box>
  );
}