import * as React from 'react';
import { useContext, useState, createContext, useEffect } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';
import Hls from 'hls.js'
import { MainContext } from './../../context/main';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PropTypes from 'prop-types';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ParseM3u from './../../context/utils'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const theme = createTheme({
    palette: {
        canplayColor: {
            main: '#9ccc65',
            darker: '#087f23',
            contrastText: '#000',
        },
    },
});

export default function Watch() {
    const _mainContext = useContext(MainContext);

    const [name, setName] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [m3u8Link, setM3u8Link] = useState('')
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoInstance, setVideoInstance] = useState(null)
    const [httpHeaders, setHttpHeaders] = useState([])
    const [videoStyle, setVideoStyle] = useState({
        width: '550px',
        height: '300px'
    })

    useEffect(() => {
        let params = new URLSearchParams(window.location.search)
        let original = decodeURIComponent(params.get("original"))
        let parseData = ParseM3u.parseOneM3uData(original)
        if (parseData && parseData.exist) {
            setName(parseData.name)
            setLogoUrl(parseData.logoUrl)
            setM3u8Link(parseData.url)
            setHttpHeaders(parseData.copt)
        }
    }, [])

    const changeM3u8Link = (e) => {
        setM3u8Link(e.target.value)
        setLoading(false)
    }

    const handleClose = () => {
        setOpen(false);
    };

    const onloadM3u8Link = () => {
        setLoading(true)
        let video = document.getElementById('video')
        if (Hls.isSupported()) {
            var config = {
                xhrSetup: function (xhr, url) {
                    xhr.withCredentials = false;
                    if (!xhr.readyState) {
                        xhr.open('GET', url, true);
                        if (httpHeaders.length > 0) {
                            for (let i = 0; i < httpHeaders.length; i++) {
                                if (httpHeaders[i].key !== "") {
                                    xhr.setRequestHeader(httpHeaders[i].key, httpHeaders[i].value);
                                }
                            }
                        }
                    }
                },
                autoStartLoad: true,
                enableWorker: true,
            };

            var hls = new Hls(config);
            hls.loadSource(m3u8Link);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                console.log(
                    'manifest loaded, found ' + data.levels.length + ' quality level'
                );
                console.log(data)
            });
            video.addEventListener("loadedmetadata", function (e) {
                // setVideoStyle({
                //     width: e.target.videoWidth + 'px',
                //     height: e.target.videoHeight + 'px'
                // })
                console.log("video width",  e.target.videoWidth + 'px', " height ", e.target.videoHeight+ 'px' )
            }, false);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
        }
        video.play();
        setVideoInstance(video)
        setIsPlaying(true)
        video.addEventListener("canplay", e => {
            setLoading(false)
        })
        video.addEventListener('error', function (e) {
            alert(e.message)
            setIsPlaying(false)
        })
    }

    const stopLoadM3u8Link = () => {
        if (videoInstance) {
            videoInstance.pause()
        }
    }

    const onChangeHttpHeaderKey = (val, index, e) => {
        setHttpHeaders(prev =>
            prev.map((item, idx) => idx === index ? { ...item, key: e.target.value } : item)
        )
    }

    const onChangeHttpHeaderValue = (val, index, e) => {
        setHttpHeaders(prev =>
            prev.map((item, idx) => idx === index ? { ...item, value: e.target.value } : item)
        )
    }

    const deleteThisHeader = (index) => {
        setHttpHeaders(prev =>
            prev.filter((item, idx) => idx !== index)
        )
    }

    const addNewHttpHeader = () => {
        setHttpHeaders([...httpHeaders, { key: '', value: '' }])
    }

    const showDialog = () => {
        setOpen(true)
    }

    const goback = () => {
        window.history.pushState({}, '', '?')
        _mainContext.goToDetailScene()
    }

    return (
        <ThemeProvider theme={theme}>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>设置</DialogTitle>
                <Box>
                    <FormControl sx={{ width: 550, margin: '10px' }}>
                        <TextField sx={{ fontSize: '11px' }} label='您所选择的m3u信息' size="small" id="standard-multiline-static" value={m3u8Link} onChange={changeM3u8Link} />
                    </FormControl>
                </Box>
                <Box>
                    <FormControl sx={{ width: 550, margin: '10px' }}>
                        <Box sx={{ marginBottom: "10px" }}>
                            <Button
                                size="small"
                                onClick={addNewHttpHeader}
                                variant="contained"
                            >
                                添加http Header
                            </Button>
                        </Box>
                        {
                            httpHeaders.map((value, index) => (
                                <Box key={index} sx={{ marginBottom: "10px", display: 'flex', alignItems: 'center' }}>
                                    <TextField sx={{ fontSize: '11px', marginRight: '5px' }} label='key' size="small" id="standard-multiline-static" value={value.key} onChange={onChangeHttpHeaderKey.bind(this, value, index)} />
                                    <TextField sx={{ fontSize: '11px' }} label='value' size="small" id="standard-multiline-static" value={value.value} onChange={onChangeHttpHeaderValue.bind(this, value, index)} />
                                    <DeleteIcon color="disabled" onClick={() => deleteThisHeader(index)} />
                                </Box>
                            ))
                        }
                    </FormControl>
                </Box>
            </Dialog>
            <Box>
                <FormControl sx={{ margin: '10px' }}>
                    <LoadingButton
                        size="small"
                        onClick={goback}
                        startIcon={<ArrowBackIcon />}
                    >
                        返回
                    </LoadingButton>
                </FormControl>
                <FormControl sx={{ margin: '10px' }}>
                    <LoadingButton
                        size="small"
                        onClick={showDialog}
                        startIcon={<VideoSettingsIcon />}
                    >
                        设置
                    </LoadingButton>
                </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{marginLeft:"10px"}}>
                    {logoUrl !== '' ? (
                        <img src={logoUrl} height="50"></img>
                    ) : ''}
                </Box>
                <h2 style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {name}
                    {
                        !isPlaying ? (
                            <LoadingButton
                                size="small"
                                onClick={onloadM3u8Link}
                                variant="contained"
                                loading={loading}
                                color="canplayColor"
                                startIcon={<PlayCircleOutlineIcon />}
                            >
                                播放
                            </LoadingButton>
                        ) : ''}
                    {
                        isPlaying ? (
                            <LoadingButton
                                size="small"
                                onClick={stopLoadM3u8Link}
                                variant="contained"
                                color="canplayColor"
                                startIcon={<StopCircleIcon />}
                            >
                                停止
                            </LoadingButton>
                        ) : ''
                    }
                </h2>
                
                <FormControl sx={{ margin: '10px' }}>
                    {
                        m3u8Link !== "" ? (
                            <video id="video" preload="auto" style={videoStyle} controls="controls"></video>
                        ) : ''
                    }
                </FormControl>
            </Box>
        </ThemeProvider>
    )
}