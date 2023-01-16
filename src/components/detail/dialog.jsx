import { useState, useContext, useEffect } from 'react'
import { MainContext } from './../../context/main';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';
import PropTypes from 'prop-types';
import GetAppIcon from '@mui/icons-material/GetApp';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export default function SimpleDialog(props) {
    const _mainContext = useContext(MainContext);
  
    //mod == 1 下载界面 2预览原始m3u信息
    const { onClose, open, body, mod, clearSelectedArrFunc } = props;
  
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

    const doDoAgain = () => {
      _mainContext.changeOriginalM3uBody(body)
      clearSelectedArrFunc()
      onClose();
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
            <FormControl sx={{ 
              width: 550, 
              margin: '10px',
              display: 'flex',
              flexDirection: 'revert'
            }}>
              <LoadingButton
                size="small"
                onClick={doDownload}
                variant="contained"
                style={{marginRight: '10px'}}
                startIcon={<GetAppIcon />}
              >
                下载
              </LoadingButton>
              <LoadingButton
                size="small"
                onClick={doDoAgain}
                variant="contained"
                startIcon={<AutorenewIcon />}
              >
                再次处理
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