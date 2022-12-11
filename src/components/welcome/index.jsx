import * as React from 'react';
import { useContext, useState, createContext, useEffect } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './../../context/main';
import axios from 'axios'
import CheckIcon from '@mui/icons-material/Check';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CountryJson from './../../assets/api/country.json'
import WatchJson from './../../assets/api/watch.json'

const selectOption = [
  { 'mod': 1, "name": "我有m3u订阅源链接" },
  { 'mod': 2, "name": "我有m3u订阅源内容" },
  { 'mod': 3, "name": "公共订阅源" },
  { 'mod': 4, "name": "在线观看" },
]

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const nowVersion = "v2.4"

const githubLink = "https://github.com/zhimin-dev/iptv-checker"
const copyright = "@知敏studio"

const boxMaxWith = 600

const oneFrame = {
  marginBottom: '10px',
  width: boxMaxWith + "px",
  display: 'flex',
  justifyContent: 'flex-end',
}

export default function HorizontalLinearStepper() {

  const _mainContext = React.useContext(MainContext);
  const [commonLinks, setCommonLink] = React.useState([]);
  const [mod, setMod] = React.useState(1);
  const [body, setBody] = React.useState('');
  const [selectedUrl, setSelectedUrl] = React.useState('');
  const [customUrl, setCustomUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('')
  const [showError, setShowError] = React.useState(false)

  const handleChange = (event) => {
    setMod(event.target.value);
  };

  useEffect(() => {
    fetchCommonLink()
  }, [])

  const fetchCommonLink = async () => {
    setCommonLink(CountryJson)
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
    try {
      if (mod === 3 || mod === 1) {
        let targetUrl = customUrl
        if (mod === 3) {
          targetUrl = selectedUrl
        }
        if (targetUrl === '') {
          throw new Error('链接为空')
        }
        let res = await axios.get(targetUrl)
        if (res.status === 200) {
          setBody(res.data)
          _mainContext.changeOriginalM3uBody(res.data)
        } else {
          throw new Error('请求失败')
        }
      } else if (mod === 2||mod === 4) {
        let _body = body
        if(mod === 4) {
          _body = decodeURIComponent(atob(WatchJson?.raw))
        }
        if (_body !== '') {
          _mainContext.changeOriginalM3uBody(_body)
        } else {
          throw new Error('获取数据失败')
        }
      }
      _mainContext.goToDetailScene()
    } catch (e) {
      setShowError(true)
      setErrorMsg(e.message)
    }
    setLoading(false)
  }

  const handleCloseSnackBar = () => {
    setShowError(false)
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh'
    }}>
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseSnackBar}>
        <Alert onClose={handleCloseSnackBar} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <h1>IPTV Checker<span style={{ fontSize: "12px" }}>{nowVersion}</span></h1>
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
              <InputLabel id="demo-simple-select-label" sx={{ width: boxMaxWith + 10 }}>country</InputLabel>
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
              <TextField multiline id="standard-multiline-static" rows={4} value={body} onChange={handleChangeContent} />
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
          startIcon={<CheckIcon />}
        >
          确定
        </LoadingButton>
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: 0
      }}>
        <a target="_blank" href={githubLink}>{copyright}</a>
        {/* <a target="_blank">我有m3u8链接</a> */}
      </Box>
    </Box>
  );
}