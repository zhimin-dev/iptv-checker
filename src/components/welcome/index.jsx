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
import ParseM3u from './../../utils/utils'
import { useNavigate } from 'react-router-dom';
import manifest from './../../../manifest';
import LogoSvg from './../../assets/iptv-checker.svg'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const ModIHaveM3uLink = 0
const ModIHaveM3uContent = 1
const ModPublicSource = 2
const ModWatchOnline = 3
const ModUploadFromLocal = 4

const selectOption = [
  { 'mod': ModIHaveM3uLink, "name": "我有订阅源链接" },
  { 'mod': ModIHaveM3uContent, "name": "我有订阅源内容" },
  { 'mod': ModPublicSource, "name": "公共订阅源" },
  { 'mod': ModWatchOnline, "name": "在线观看" },
  { 'mod': ModUploadFromLocal, "name": "本地上传" },
]

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const nowVersion = manifest.version;

const githubLink = manifest.homepage_url
const copyright = manifest.author

const boxMaxWith = 600

const oneFrame = {
  marginBottom: '10px',
  width: boxMaxWith + "px",
  display: 'flex',
  justifyContent: 'flex-end',
  flexDirection: 'column'
}

function TabPanel(props) {
  const { children, mod, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={mod !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {mod === index && (
        <Box style={{ marginTop: "2px" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  mod: PropTypes.number.isRequired,
};

const lastHomeTab = 'lastHomeTab'
const lastHomeUserInput = 'lastHomeUserInput'

export default function HorizontalLinearStepper() {

  const navigate = useNavigate();
  const _mainContext = React.useContext(MainContext);
  const [commonLinks, setCommonLink] = React.useState([]);
  const [mod, setMod] = React.useState(ModIHaveM3uLink);
  const [body, setBody] = React.useState('');
  const [selectedUrl, setSelectedUrl] = React.useState([]);
  const [customUrl, setCustomUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('')
  const [showError, setShowError] = React.useState(false)
  const [watchList, setWatchList] = React.useState([])
  const [localFileName, setLocalFileName] = React.useState('')

  useEffect(() => {
    fetchCommonLink()
    fetchWatchOnlineData()
    let _tab = localStorage.getItem(lastHomeTab)
    if (_tab !== '' && _tab !== null) {
      let _tabInt = parseInt(_tab, 10)
      setMod(_tabInt)
      let userInput = localStorage.getItem(lastHomeUserInput)
      if (userInput !== '' && userInput !== null) {
        if(_tabInt === ModIHaveM3uLink) {
          setCustomUrl(userInput)
        }else{
          setBody(userInput)
        }
      }
    }
  }, [])

  const fetchWatchOnlineData = async () => {
    let list = []
    for (let i = 0; i < WatchJson.length; i++) {
      if (WatchJson[i].raw !== '') {
        let _body = decodeURIComponent(atob(WatchJson[i].raw))
        let _data = ParseM3u.parseOriginalBodyToList(_body)
        list.push({
          name: WatchJson[i].name,
          list: _data
        })
      }
    }
    setWatchList(list)
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
        let targetUrl = [];
        if (mod === ModPublicSource) {
          localStorage.removeItem(lastHomeUserInput)
          for (let i = 0; i < selectedUrl.length; i++) {
            for (let j = 0; j < selectedUrl[i].length; j++) {
              targetUrl.push(selectedUrl[i][j])
            }
          }
        } else {
          if (customUrl !== '') {
            localStorage.setItem(lastHomeUserInput, customUrl)
            targetUrl = customUrl.split(",")
          }
        }
        if (targetUrl.length == 0) {
          throw new Error('链接为空')
        }
        let bodies = []
        for (let i = 0; i < targetUrl.length; i++) {
          let res = await axios.get(_mainContext.getCheckUrl(targetUrl[i]))
          if (res.status === 200) {
            bodies.push(res.data)
          }
        }
        _mainContext.changeOriginalM3uBodies(bodies)
      } else if (mod === ModIHaveM3uContent) {
        if (body !== '') {
          localStorage.setItem(lastHomeUserInput, body)
          _mainContext.changeOriginalM3uBody(body)
        } else {
          throw new Error('获取数据失败')
        }
      } else if (mod == ModUploadFromLocal) {
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

  const handleTabChange = (event, newValue) => {
    setMod(newValue);
    localStorage.setItem(lastHomeTab, newValue)
  };

  const HandleLocalUpload = (e) => {
    const file = new FileReader();
    setLocalFileName(e.target.value)
    file.readAsText(e.target.files[0])
    file.onload = (e) => {
      setBody(e.target.result)
    }
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
      <img src={LogoSvg} height="70" style={{ backgroundColor: "#fff", borderRadius: '20px' }} />
      <h1 style={{ fontSize: '30px' }}>IPTV Checker<span style={{ fontSize: "12px" }}>{nowVersion}</span></h1>
      <Box sx={oneFrame}>
        <Box >
          <Tabs value={mod} onChange={handleTabChange} aria-label="basic tabs example">
            {
              selectOption.map((value, index) => (
                <Tab label={value.name} key={index} />
              ))
            }
          </Tabs>
        </Box>
        <TabPanel mod={mod} index={ModIHaveM3uLink}>
          <FormControl sx={{ width: boxMaxWith }} variant="standard">
            <TextField multiline id="standard-multiline-static" placeholder='多个链接请用英文逗号","分隔,支持标准m3u链接以及文件内容为多行的[名称,url]的链接地址格式' rows={4} value={customUrl} onChange={handleChangeTextSelectedUrl} />
          </FormControl>
        </TabPanel>
        <TabPanel mod={mod} index={ModIHaveM3uContent}>
          <FormControl sx={{ width: boxMaxWith }} variant="standard">
            <TextField multiline id="standard-multiline-static" rows={4} value={body} onChange={handleChangeContent} placeholder='支持标准m3u文件格式以及文件内容为多行的[名称,url]的内容格式' />
          </FormControl>
        </TabPanel>
        <TabPanel mod={mod} index={ModPublicSource}>
          <FormControl sx={{ width: boxMaxWith }}>
            <InputLabel id="demo-simple-select-label" sx={{ width: boxMaxWith + 10 }}>country</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              multiple
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
        </TabPanel>
        <TabPanel mod={mod} index={ModWatchOnline}>
          <Box>
            <Button variant="contained" sx={{ margin: "5px" }} onClick={() => goToWatchPage(null)}>我有直播源m3u8地址</Button>
            {
              watchList.map((value, index) => (
                <Box key={index}>
                  <div style={{ color: '#b1b1b1' }}>{value.name}</div>
                  <div style={{ display: "flex" }}>
                    {
                      value.list.map((val, ind) => (
                        <div style={{
                          margin: '5px',
                          cursor: 'pointer'
                        }} onClick={() => goToWatchPage(val)} key={ind}>
                          {val.name}
                        </div>
                      ))
                    }
                  </div>
                </Box>
              ))
            }
          </Box>
        </TabPanel>
        <TabPanel mod={mod} index={ModUploadFromLocal}>
          <Button variant="contained" component="label">
            {localFileName ==='' ? 'Upload': localFileName}
            <input hidden type="file" onChange={HandleLocalUpload} />
          </Button>
        </TabPanel>
        {
          mod !== ModWatchOnline ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '5px'
            }}>
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
      </Box>
      <Box sx={{
        position: 'absolute',
        bottom: 0
      }}>
        <a target="_blank" href={githubLink}>@{copyright}</a>
      </Box>
    </Box>
  );
}