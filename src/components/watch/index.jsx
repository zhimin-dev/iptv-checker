import * as React from 'react';
import { useContext, useState, useEffect, useRef } from "react"
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
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ParseM3u from './../../context/utils'
import { useLocation } from 'react-router-dom';


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
    const location = useLocation();
    const [name, setName] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [m3u8Link, setM3u8Link] = useState('')
    const [open, setOpen] = useState(false)
    const [hlsObj, setHlsObj] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoInstance, setVideoInstance] = useState(null)
    const [httpHeaders, setHttpHeaders] = useState([])
    const [videoStyle, setVideoStyle] = useState({
        width: '768px',
        height: '576px'
    })

    const renderRef = useRef(true);

    useEffect(() => {
        let originalParams = location.state.original
        if (originalParams === null || originalParams === undefined) {
            setOpen(true)
        } else {
            let original = decodeURIComponent(originalParams)
            let parseData = ParseM3u.parseOneM3uData(original)
            if (parseData && parseData.exist) {
                setName(parseData.name)
                setLogoUrl(parseData.logoUrl)
                setM3u8Link(parseData.url)
                setHttpHeaders(parseData.copt)
            } else {
                setOpen(true)
            }
        }

        window.addEventListener("popstate", function (e) {
            console.log("click back,开始准备销毁视频播放信息")
            destroyVideo()
            console.log("click back,开始准备销毁视频播放信息-finished")

            return false
        }, false);
    }, [])

    const changeM3u8Link = (e) => {
        setM3u8Link(e.target.value)
    }

    const handleClose = () => {
        if (m3u8Link !== '') {
            setOpen(false);
        }
    };

    const onloadM3u8Link = () => {
        let video = document.getElementById('video')
        if (Hls.isSupported()) {
            var config = {
                xhrSetup: function (xhr, url) {
                    xhr.withCredentials = false;
                    if (!xhr.readyState) {
                        xhr.open('GET', url, true);
                        if (httpHeaders.length > 0) {
                            for (let i = 0; i < httpHeaders.length; i++) {
                                if (httpHeaders[i].key !== "" && httpHeaders[i].key !== 'User-Agent') {
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
                console.log("video width", e.target.videoWidth + 'px', " height ", e.target.videoHeight + 'px')
            }, false);
            setHlsObj(hls)
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
        }
        video.play();
        setVideoInstance(video)
        setIsPlaying(true)
        video.addEventListener('error', function (e) {
            alert(e.message)
            setIsPlaying(false)
        })
    }

    const stopLoadM3u8Link = () => {
        destroyVideo()
    }

    const destroyVideo = () => {
        if (hlsObj) {
            hlsObj.stopLoad()
        }
        if (videoInstance) {
            video.src = ""
            videoInstance.pause()
            videoInstance.removeAttribute('src');
            videoInstance.load();
            console.log("destroyVideo")
        }
        setIsPlaying(false)
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
        destroyVideo()
        window.history.pushState({}, '', '?')
        _mainContext.goToDetailScene()
    }

    return (
        <ThemeProvider theme={theme}>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>设置</DialogTitle>
                <Box>
                    <FormControl sx={{ width: 550, margin: '10px' }}>
                        <TextField sx={{ fontSize: '11px' }} label='请输入m3u8播放地址' size="small" id="standard-multiline-static" value={m3u8Link} onChange={changeM3u8Link} />
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
                                + http Header
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
                        onClick={showDialog}
                        startIcon={<VideoSettingsIcon />}
                    >
                        播放设置
                    </LoadingButton>
                </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ marginLeft: "10px" }}>
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