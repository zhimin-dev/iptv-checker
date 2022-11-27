import { useState, useContext, useEffect } from 'react'
import { MainContext } from './../../context/main';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { green, pink } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PropTypes from 'prop-types';
import FormControl from '@mui/material/FormControl';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GetAppIcon from '@mui/icons-material/GetApp';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import PreviewIcon from '@mui/icons-material/Preview';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HeaderFixedHeight = 152

const searchTitleCss = {
  fontSize: '11px',
  color: "#7d7a7a",
  marginBottom: '4px',
  marginRight: '10px'
}

function SimpleDialog(props) {
  const _mainContext = useContext(MainContext);

  //mod == 1 下载界面 2预览原始m3u信息
  const { onClose, open, body, mod } = props;

  const [showTextAreaLable, setShowTextAreaLable] = useState('')

  useEffect(() => {
    if (mod === 1) {
      setShowTextAreaLable('您所选择的m3u信息')
    } else if (mod === 2) {
      setShowTextAreaLable('原始m3u信息')
    } else if (mod === 3) {
      setShowTextAreaLable('设置')
    }
  }, [mod])

  const handleClose = () => {
    onClose();
  };

  const handleChangeCheckMillisSeconds = (e) => {
    _mainContext.changeCheckMillisSeconds(parseInt(e.target.value, 10))
  }

  const handleChangeHttpRequestTimeout = (e) => {
    _mainContext.changeHttpRequestTimeout(parseInt(e.target.value, 10))
  }

  const handleChangeShowUrl = (event) => {
    _mainContext.changeShowUrl(event.target.checked);
  }

  const doDownload = () => {
    var a = document.createElement('a')
    var blob = new Blob([body])
    var url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = 'iptv-checker-' + (new Date()).getTime() + ".m3u"
    a.click()
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{showTextAreaLable}</DialogTitle>
      {
        mod === 3 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
          }}>
            <FormControl sx={{ width: 180, marginRight: '5px', marginBottom: '10px' }}>
              <TextField
                size="small"
                value={_mainContext.checkMillisSeconds}
                onChange={handleChangeCheckMillisSeconds}
                label="下一次请求间隔时间（毫秒）"
              />
            </FormControl>
            <FormControl sx={{
              width: 200,
              marginRight: '5px',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '20px'
            }}>
              不显示url
              <Switch
                size="small"
                checked={_mainContext.showUrl}
                onChange={handleChangeShowUrl}
                inputProps={{ 'aria-label': 'controlled' }}
              />显示url
            </FormControl>
            <FormControl sx={{ width: 180, marginRight: '5px', marginBottom: '10px' }}>
              <TextField
                size="small"
                value={_mainContext.httpRequestTimeout}
                onChange={handleChangeHttpRequestTimeout}
                label="请求超时时间（毫秒）"
              />
            </FormControl>
          </Box>) : ''
      }
      {mod === 1 || mod === 2 ? (
        <FormControl sx={{ width: 550, margin: '10px' }}>
          <TextField multiline sx={{ fontSize: '11px' }} label={showTextAreaLable} size="small" id="standard-multiline-static" rows={4} value={body} />
        </FormControl>
      ) : ''}

      {
        mod === 1 ? (
          <FormControl sx={{ width: 550, margin: '10px' }}>
            <LoadingButton
              size="small"
              onClick={doDownload}
              variant="contained"
              startIcon={<GetAppIcon />}
            >
              下载
            </LoadingButton>
          </FormControl>
        ) : ''
      }
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  body: PropTypes.string.isRequired,
  mod: PropTypes.number.isRequired,
};

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
  listStyle: "none",
  display: 'initial',
}));

export default function Detail() {
  const _mainContext = useContext(MainContext);

  const [searchTitle, setSearchTitle] = useState('')
  const [chipData, setChipData] = useState([]);
  const [selectedArr, setSelectedArr] = useState([])
  const [open, setOpen] = useState(false);
  const [dialogMod, setDialogMod] = useState(1);

  const handleClose = (value) => {
    setOpen(false);
  };

  const handleDeleteChip = (chipToDelete) => () => {
    setChipData((chips) => chips.filter((val, i) => i !== chipToDelete));
  }

  const autoSelectedAvailablesUrl = () => {
    let ids = _mainContext.getAvailableOrNotAvailableIndex(1)
    setSelectedArr(ids)
  }

  const autoSelectedInAvailablesUrl = () => {
    let ids = _mainContext.getAvailableOrNotAvailableIndex(2)
    setSelectedArr(ids)
  }

  const handleChangeSearchTitle = (e) => {
    setSearchTitle(e.target.value)
  }

  const addNewSearchFilter = () => {
    if (searchTitle === '') {
      return
    }
    let isHit = false
    for (let i = 0; i < chipData.length; i++) {
      if (chipData[i] === searchTitle) {
        isHit = true
      }
    }
    if (!isHit) {
      setChipData([...chipData, searchTitle])
    }
    setSearchTitle("")
  }

  const doFilter = () => {
    _mainContext.filterM3u(chipData)
  }

  const doCheckUrlIsValid = () => {
    _mainContext.onCheckTheseLinkIsAvailable()
  }

  const deleteThisRow = (index) => {
    _mainContext.deleteShowM3uRow(index)
  }

  const exportValidM3uData = () => {
    _mainContext.onExportValidM3uData()
    setDialogMod(1)
    setOpen(true);
  }

  const showOriginalM3uBodyInfo = () => {
    _mainContext.changeDialogBodyData()
    setDialogMod(2)
    setOpen(true);
  }

  const handleSelectCheckedAll = () => {
    let mod = 1//选中
    if (selectedArr.length > 0) {
      mod = 0//取消选择
    }
    let temp = []
    if (mod === 1) {
      for (let i = 0; i < _mainContext.showM3uBody.length; i++) {
        temp.push(_mainContext.showM3uBody[i].index)
      }
    }
    _mainContext.onSelectedOrNotAll(mod)
    setSelectedArr(temp)
  }

  const showSetting = () => {
    setDialogMod(3)
    setOpen(true);
  }

  const onSelectedThisRow = (index) => {
    _mainContext.onSelectedRow(index)
    let mod = 1//选中
    for (let i = 0; i < selectedArr.length; i++) {
      if (selectedArr[i] === index) {
        mod = 0//取消选择
      }
    }
    if (mod === 1) {
      setSelectedArr(pre => [...pre, index])
    } else {
      setSelectedArr(prev => prev.filter((val) => val !== index))
    }
  }

  const watchThisRow = (val) => {
    window.history.pushState({}, '', "?original=" + encodeURIComponent(val.raw))
    _mainContext.goToWatchPage()
  }

  const goback = () => {
    _mainContext.goToWelcomeScene()
  }

  return (
    <Box>
      <Box sx={{
        position: 'fixed',
        backgroundColor: '#fff',
        width: '100%',
        height: HeaderFixedHeight + "px",
        borderBottom: '1px solid #eee',
        top: 0,
        left: 0,
        zIndex: 999,
        padding: '8px'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ maxWidth: "500px" }}>
            <Box sx={{marginBottom: '10px'}}>
              <FormControl sx={{ marginRight: '5px' }}>
                <LoadingButton
                  size="small"
                  onClick={goback}
                  startIcon={<ArrowBackIcon />}
                >
                  返回
                </LoadingButton>
              </FormControl>
              <FormControl sx={{ marginRight: '5px' }}>
              {
                _mainContext.handleMod === 1 ? (
                  <Box>检查进度：{_mainContext.hasCheckedCount}/{_mainContext.showM3uBody.length}</Box>
                ) : ''
              }
              </FormControl>
            </Box>
            <Box sx={{display:"flex"}}>
              <Box sx={searchTitleCss}>搜索</Box>
              <Box>
              <Box sx={{
                marginBottom: "5px",
                display: 'flex',
                alignItems: 'center'
              }}>
                <FormControl sx={{ marginRight: '5px' }}>
                  <TextField
                    size="small"
                    value={searchTitle}
                    onChange={handleChangeSearchTitle}
                    label="筛选喜爱的电视名称"
                  />
                </FormControl>
                <FormControl sx={{ marginRight: '5px' }}>
                  <LoadingButton
                    size="small"
                    onClick={addNewSearchFilter}
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    添加
                  </LoadingButton>
                </FormControl>
                <FormControl sx={{ marginRight: '5px' }}>
                  <LoadingButton
                    size="small"
                    onClick={doFilter}
                    variant="contained"
                    color="success"
                    startIcon={<SearchIcon />}
                  >
                    搜索
                  </LoadingButton>
                </FormControl>
              </Box>
              <Box>
                {chipData.map((value, index) => {
                  return (
                    <ListItem key={index}>
                      <Chip
                        label={value}
                        size="small"
                        onDelete={handleDeleteChip(index)}
                      />
                    </ListItem>
                  );
                })}
              </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ paddingRight: "20px" }}>
            <FormControl sx={{ marginRight: '5px' }}>
              <LoadingButton
                size="small"
                onClick={showSetting}
                variant="outlined"
                startIcon={<SettingsIcon />}
              >
                设置
              </LoadingButton>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ marginTop: "5px" }}>
          <FormControl sx={{ marginRight: '5px' }}>
            <Button startIcon={<VisibilityIcon />} size="small" onClick={showOriginalM3uBodyInfo} variant="outlined">显示原始m3u信息</Button>
          </FormControl>
          {
            _mainContext.handleMod === 0 ? (
              <FormControl sx={{
                marginRight: "5px",
              }}>
                <LoadingButton
                  size="small"
                  onClick={doCheckUrlIsValid}
                  variant="outlined"
                  startIcon={<RadioButtonUncheckedIcon />}
                >
                  检查直播源链接是否有效
                </LoadingButton>
              </FormControl>
            ) : ''
          }
          {
            _mainContext.handleMod === 2 ? (
              <FormControl sx={{
                marginRight: "5px",
              }}>
                <LoadingButton
                  size="small"
                  onClick={autoSelectedAvailablesUrl}
                  variant="contained"
                  startIcon={<CheckCircleOutlineIcon />}
                >
                  获取有效链接
                </LoadingButton>
              </FormControl>
            ) : ''
          }
          {
            _mainContext.handleMod === 2 ? (
              <FormControl sx={{
                marginRight: "5px",
              }}>
                <LoadingButton
                  size="small"
                  onClick={autoSelectedInAvailablesUrl}
                  variant="outlined"
                  startIcon={<ErrorOutlineIcon />}
                >
                  获取无效链接
                </LoadingButton>
              </FormControl>
            ) : ''
          }
          {
            _mainContext.handleMod === 2 || selectedArr.length > 0 ? (
              <FormControl sx={{
                marginRight: "5px",
              }}>
                <LoadingButton
                  size="small"
                  onClick={exportValidM3uData}
                  variant="contained"
                  startIcon={<ExitToAppIcon />}
                >
                  导出选中的链接
                </LoadingButton>
              </FormControl>
            ) : ''
          }
        </Box>
      </Box>
      <SimpleDialog
        open={open}
        onClose={handleClose}
        body={_mainContext.dialogBody}
        mod={dialogMod}
      />
      <TableContainer component={Paper} sx={{ marginTop: (HeaderFixedHeight + 10) + "px" }}>
        <Table sx={{ maxWidth: 650 }} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedArr.length > 0 && selectedArr.length === _mainContext.showM3uBody.length}
                  onClick={handleSelectCheckedAll}
                  indeterminate={selectedArr.length > 0 && selectedArr.length !== _mainContext.showM3uBody.length}
                  inputProps={{
                    'aria-labelledby': -1,
                  }}
                />
              </TableCell>
              <TableCell>操作</TableCell>
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_mainContext.showM3uBody.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={row.checked}
                    onClick={() => onSelectedThisRow(index)}
                    inputProps={{
                      'aria-labelledby': row.index,
                    }}
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  {
                    _mainContext.handleMod !== 1 ? (
                      <Button onClick={() => deleteThisRow(row)} startIcon={<DeleteOutlineIcon />}>删除</Button>
                    ) : ''
                  }
                  <Button onClick={() => watchThisRow(row)} startIcon={<PreviewIcon />}>在线观看</Button>
                </TableCell>
                <TableCell align="left">
                  {
                    row.status === 0 ? (
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <HorizontalRuleIcon />
                      </Avatar>
                    ) : ''
                  }
                  {
                    row.status === 1 ? (
                      <Avatar sx={{ bgcolor: green[500], width: 24, height: 24 }}>
                        <CheckCircleIcon />
                      </Avatar>
                    ) : ''
                  }
                  {
                    row.status === 2 ? (
                      <Avatar sx={{ bgcolor: pink[500], width: 24, height: 24 }}>
                        <ErrorIcon />
                      </Avatar>
                    ) : ''
                  }
                </TableCell>
                <TableCell align="left">
                  <div>{row.name}</div>
                  {
                    _mainContext.showUrl ? (
                      <div>{row.url}</div>
                    ) : ''
                  }
                </TableCell>
              </TableRow>
            )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}