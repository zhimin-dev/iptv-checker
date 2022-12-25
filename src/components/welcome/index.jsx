import * as React from 'react';
import { useEffect } from "react"
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
import Button from '@mui/material/Button';
import ParseM3u from './../../context/utils'
import { useNavigate } from 'react-router-dom';

const ModIHaveM3uLink = 1
const ModIHaveM3uContent = 2
const ModPublicSource = 3
const ModWatchOnline = 4

const selectOption = [
  { 'mod': ModIHaveM3uLink, "name": "我有m3u订阅源链接" },
  { 'mod': ModIHaveM3uContent, "name": "我有m3u订阅源内容" },
  { 'mod': ModPublicSource, "name": "公共订阅源" },
  { 'mod': ModWatchOnline, "name": "在线观看" },
]

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const nowVersion = "v2.6"

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

  const navigate = useNavigate();
  const _mainContext = React.useContext(MainContext);
  const [commonLinks, setCommonLink] = React.useState([]);
  const [mod, setMod] = React.useState(ModIHaveM3uLink);
  const [body, setBody] = React.useState('');
  const [selectedUrl, setSelectedUrl] = React.useState('');
  const [customUrl, setCustomUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('')
  const [showError, setShowError] = React.useState(false)
  const [watchList, setWatchList] = React.useState([])

  const handleChange = (event) => {
    setMod(event.target.value);
  };

  useEffect(() => {
    fetchCommonLink()
    fetchWatchOnlineData()
  }, [])

  const fetchWatchOnlineData = async () => {
    let _body = decodeURIComponent(atob(WatchJson?.raw))
    setWatchList(ParseM3u.parseOriginalBodyToList(_body))
  }

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
      if (mod === ModPublicSource || mod === ModIHaveM3uLink) {
        let targetUrl = customUrl
        if (mod === ModPublicSource) {
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
      } else if (mod === ModIHaveM3uContent) {
        if (body !== '') {
          _mainContext.changeOriginalM3uBody(body)
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

  const goToWatchPage = async (val) => {
    let query = {}
    if (val !== null) {
      query.original = encodeURIComponent(val.raw)
    }
    navigate("/watch", {
      state: query,
    })
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
          mod === ModPublicSource ? (
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
          mod === ModIHaveM3uContent ? (
            <FormControl sx={{ width: boxMaxWith }} variant="standard">
              <TextField multiline id="standard-multiline-static" rows={4} value={body} onChange={handleChangeContent} />
            </FormControl>
          ) : ''
        }
        {
          mod === ModIHaveM3uLink ? (
            <FormControl sx={{ width: boxMaxWith }} variant="standard">
              <TextField multiline id="standard-multiline-static" rows={4} value={customUrl} onChange={handleChangeTextSelectedUrl} />
            </FormControl>
          ) : ''
        }
        {
          mod === ModWatchOnline ? (
            <Box>
              <Button variant="contained" sx={{ margin: "5px" }} onClick={() => goToWatchPage(null)}>我有直播源m3u8地址</Button>
              {
                watchList.map((value, index) => (
                  <Button variant="outlined" sx={{ margin: "5px" }} onClick={() => goToWatchPage(value)} key={index}>{value.name}</Button>
                ))
              }
            </Box>
          ) : ''
        }
      </Box>
      {
        mod !== ModWatchOnline ? (
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
        ) : ''
      }
      <Box sx={{
        position: 'absolute',
        bottom: 0
      }}>
        <a target="_blank" href={githubLink}>{copyright}</a>
      </Box>
    </Box>
  );
}