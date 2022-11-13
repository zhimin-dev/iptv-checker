import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './../../context/main';
import axios from 'axios'

const selectOption = [
  { 'mod': 1, "name": "我有m3u订阅源链接" },
  { 'mod': 2, "name": "我有m3u订阅源内容" },
  { 'mod': 3, "name": "公共订阅源" },
]

const commonLink = "https://static.zmis.me/web/iptv/china.json"

const boxMaxWith = 600

const oneFrame = {
  marginBottom: '10px',
  width: boxMaxWith+"px",
  display: 'flex',
  justifyContent: 'flex-end',
}

export default function HorizontalLinearStepper() {

  const _mainContext = React.useContext(MainContext);
  const [commonLinks, setCommonLink] = React.useState([]);
  const [mod, setMod] = React.useState(1);
  const [body, setBody] = React.useState('');
  const [selectedUrl, setSelectedUrl] = React.useState([]);
  const [customUrl, setCustomUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleChange = (event) => {
    setMod(event.target.value);
    if (event.target.value === 3) {
      fetchCommonLink()
    }
  };

  const fetchCommonLink = async () => {
    let res = await axios.get(commonLink)
    if (res.status === 200) {
      setCommonLink(res.data)
    }
  }

  const handleChangeContent = (e) => {
    setBody(e.target.value);
  }

  const handleSelectedCountry = (e) => {
    setSelectedUrl(e.target.value)
  }

  const handleChangeTextSelectedUrl = (e) => {
    setCustomUrl(e.target.value)
  }

  const handleConfirm = async (e) => {
    setLoading(true);
    if (mod === 3) {
      let res = await axios.get(selectedUrl)
      setBody(res.data)
      _mainContext.changeOriginalM3uBody(res.data)
    } else if (mod === 2) {
      _mainContext.changeOriginalM3uBody(body)
    } else if (mod === 1) {
      let res = await axios.get(customUrl)
      setBody(res.data)
      _mainContext.changeOriginalM3uBody(res.data)
    }
    _mainContext.goToDetailScene()
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection:'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh'
    }}>
      <h1>IPTV Checker</h1>
      <FormControl sx={oneFrame}>
        <InputLabel id="demo-simple-select-label">请选择模式</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={mod}
          label="请选择模式"
          onChange={handleChange}
        >
          {
            selectOption.map((value, index) => (
              <MenuItem value={value.mod} key={index}>{value.name}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
      <Box sx={oneFrame}>
        {
          mod === 3 ? (
              <FormControl sx={{ width: boxMaxWith }}>
                <InputLabel id="demo-simple-select-label" sx={{width:boxMaxWith+10}}>country</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedUrl}
                  label="country"
                  onChange={handleSelectedCountry}
                >
                  {
                    commonLinks.map((value, index) => (
                      <MenuItem value={value.url} key={index}>{value.country}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
          ) : ''
        }
        {
          mod === 2 ? (
            <FormControl sx={{ width: boxMaxWith }} variant="standard">
              <TextField  multiline id="standard-multiline-static" rows={4} value={body} onChange={handleChangeContent} />
            </FormControl>
          ) : ''
        }
        {
          mod === 1 ? (
            <FormControl sx={{ width: boxMaxWith }} variant="standard">
              <TextField multiline id="standard-multiline-static" rows={4} value={customUrl} onChange={handleChangeTextSelectedUrl} />
            </FormControl>
          ) : ''
        }
      </Box>
      <Box sx={oneFrame}>
          <LoadingButton
            size="small"
            onClick={handleConfirm}
            loading={loading}
            variant="contained"
          >
            确定
          </LoadingButton>
      </Box>
    </Box>
  );
}