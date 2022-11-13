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

const HeaderFixedHeight = 152

const searchTitleCss = {
  fontSize: '11px',
  color: "#7d7a7a",
  marginBottom: '4px'
}

function SimpleDialog(props) {
  const { onClose, open, body } = props;

  const handleClose = () => {
    onClose();
  };

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
      <DialogTitle>您选择的m3u信息</DialogTitle>
      <FormControl sx={{ width: 550, margin: '10px' }}>
        <TextField multiline sx={{ fontSize: '11px' }} label='您所选择的m3u信息' size="small" id="standard-multiline-static" rows={4} value={body} />
      </FormControl>
      <FormControl sx={{ width: 550, margin: '10px' }}>
        <LoadingButton
          size="small"
          onClick={doDownload}
          variant="contained"
          color="success"
        >
          下载
        </LoadingButton>
      </FormControl>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  body: PropTypes.string.isRequired,
};

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
  listStyle: "none",
  display: 'initial',
}));

export default function Detail() {
  const _mainContext = useContext(MainContext);

  const [searchTitle, setSearchTitle] = useState('')
  const [chipData, setChipData] = useState(['CCTV', '卫视']);
  const [showUrl, setShowUrl] = useState(false)
  const [selectedArr, setSelectedArr] = useState([])
  const [open, setOpen] = useState(false);

  const handleClose = (value) => {
    setOpen(false);
  };

  const handleDeleteChip = (chipToDelete) => () => {
    setChipData((chips) => chips.filter((val, i) => i !== chipToDelete));
  }

  const handleChangeContent = (e) => {
    _mainContext.changeOriginalM3uBody(e.target.value)
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

  const handleChangeCheckMillisSeconds = (e) => {
    _mainContext.changeCheckMillisSeconds(parseInt(e.target.value, 10))
  }

  const doCheckUrlIsValid = () => {
    _mainContext.onCheckTheseLinkIsAvailable()
  }

  const deleteThisRow = (index) => {
    _mainContext.deleteShowM3uRow(index)
  }

  const exportValidM3uData = () => {
    _mainContext.onExportValidM3uData()
    setOpen(true);
  }

  const handleChangeShowUrl = (event) => {
    setShowUrl(event.target.checked);
  };

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
        <Box sx={{ display: 'flex' }}>
          <FormControl sx={{ width: 250, marginRight: '5px' }}>
            <TextField multiline sx={{ fontSize: '11px' }} label='m3u原始数据' size="small" id="standard-multiline-static" rows={4} value={_mainContext.originalM3uBody} onChange={handleChangeContent} />
          </FormControl>
          <Box sx={{ maxWidth: "349px" }}>
            <Box sx={searchTitleCss}>搜索</Box>
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
                  label="添加喜爱的电视名称"
                />
              </FormControl>
              <FormControl sx={{ marginRight: '5px' }}>
                <LoadingButton
                  size="small"
                  onClick={addNewSearchFilter}
                  variant="outlined"
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
          <Box sx={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={searchTitleCss}>设置</Box>
            <FormControl sx={{ width: 180, marginRight: '5px', marginBottom: '10px' }}>
              <TextField
                size="small"
                value={_mainContext.checkMillisSeconds}
                onChange={handleChangeCheckMillisSeconds}
                label="下一次请求间隔时间（毫秒）"
              />
            </FormControl>
            <FormControl sx={{
              width: 200, marginRight: '5px',
              display: 'flex',
              flexDirection: 'row'
            }}>
              不显示url
              <Switch
                size="small"
                checked={showUrl}
                onChange={handleChangeShowUrl}
                inputProps={{ 'aria-label': 'controlled' }}
              />显示url
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ marginTop: "5px" }}>
          {
            _mainContext.handleMod === 0 ? (
              <FormControl sx={{
                marginRight: "5px",
              }}>
                <LoadingButton
                  size="small"
                  onClick={doCheckUrlIsValid}
                  variant="outlined"
                >
                  检查直播源链接是否有效
                </LoadingButton>
              </FormControl>
            ) : ''
          }
          {
            _mainContext.handleMod === 1 ? (
              <Box>检查进度：{_mainContext.hasCheckedCount}/{_mainContext.showM3uBody.length}</Box>
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
                >
                  自动选择有效链接
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
                >
                  自动选择无效链接
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
                  color="error"
                >
                  导出有效的链接
                </LoadingButton>
              </FormControl>
            ) : ''
          }
        </Box>
      </Box>
      <SimpleDialog
        open={open}
        onClose={handleClose}
        body={_mainContext.exportText}
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
                      <Button onClick={() => deleteThisRow(index)}>删除</Button>
                    ) : ''
                  }
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
                    showUrl ? (
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