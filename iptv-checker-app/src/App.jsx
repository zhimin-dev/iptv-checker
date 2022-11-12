import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './context/main';
import axios from 'axios'

import Welcome from './components/welcome/index'
import Detail from './components/detail/index'

export default function HorizontalLinearStepper() {

  const _mainContext = React.useContext(MainContext);

  return (
      <Box sx={{ minWidth: 100 }}>
        {
          _mainContext.scene === 0 ?(
            <Welcome></Welcome>
          ):(
            <Detail></Detail>
          )
        }
      </Box>
  );
}