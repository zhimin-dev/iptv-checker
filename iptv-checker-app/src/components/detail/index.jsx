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


function SimpleDialog(props) {
  const { onClose, open, body } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>您选择的m3u信息</DialogTitle>
      <div>{body}</div>
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
    setChipData([...chipData, searchTitle])
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
    <div>
      <TextField multiline id="standard-multiline-static" rows={4} value={_mainContext.originalM3uBody} onChange={handleChangeContent} />
      <Box>
        <TextField
          size="small"
          value={searchTitle}
          onChange={handleChangeSearchTitle}
          label="添加喜爱的电视台"
        />
        <LoadingButton
          size="small"
          onClick={addNewSearchFilter}
          variant="contained"
        >
          点击添加
        </LoadingButton>
        <LoadingButton
          size="small"
          onClick={doFilter}
          variant="contained"
        >
          搜索你添加的电视台
        </LoadingButton>
        {
          _mainContext.handleMod === 0 ? (
            <LoadingButton
              size="small"
              onClick={doCheckUrlIsValid}
              variant="contained"
            >
              检查链接是否有效
            </LoadingButton>
          ) : ''
        }
        {
          _mainContext.handleMod === 2 || selectedArr.length > 0 ? (
            <LoadingButton
              size="small"
              onClick={exportValidM3uData}
              variant="contained"
            >
              导出有效的链接
            </LoadingButton>
          ) : ''
        }
        {
          _mainContext.handleMod === 2 ? (
            <LoadingButton
              size="small"
              onClick={autoSelectedAvailablesUrl}
              variant="contained"
            >
              自动选择有效链接
            </LoadingButton>
          ) : ''
        }
        {
          _mainContext.handleMod === 2 ? (
            <LoadingButton
              size="small"
              onClick={autoSelectedInAvailablesUrl}
              variant="contained"
            >
              自动选择无效链接
            </LoadingButton>
          ) : ''
        }
        {chipData.map((value, index) => {
          return (
            <ListItem key={index}>
              <Chip
                label={value}
                onDelete={handleDeleteChip(index)}
              />
            </ListItem>
          );
        })}
      </Box>
      <Box>
        <TextField
          size="small"
          value={_mainContext.checkMillisSeconds}
          onChange={handleChangeCheckMillisSeconds}
          label="下一次请求间隔时间（毫秒）"
        />
        不显示url
        <Switch
          checked={showUrl}
          onChange={handleChangeShowUrl}
          inputProps={{ 'aria-label': 'controlled' }}
        />显示url
      </Box>
      <SimpleDialog
        open={open}
        onClose={handleClose}
        body={_mainContext.exportText}
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
                  <Button onClick={() => deleteThisRow(index)}>删除</Button>
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
    </div>
  )
}