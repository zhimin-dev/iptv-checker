import * as React from 'react';
import { useContext, useState, useEffect, useRef } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './../../context/main';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ParseM3u from '../../utils/utils'
import { useLocation } from 'react-router-dom';
import VideoJS from './video'

export default function Watch() {
    const _mainContext = useContext(MainContext);
    const location = useLocation();
    const [videoJsOptions, setVideoJsOptions] = useState(null)
    const setVideoOptions = (url) => {
        setVideoJsOptions({
            autoplay: true,
            controls: true,
            responsive: true,
            fluid: true,
            html5:{
                vhs: {
                    withCredentials: true,
                    overrideNative: true
                }
            },
            sources: [{
                src: url,
                type: 'application/x-mpegURL'
            }]
        })
    }
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
                iniotM3u8Link(parseData.url)
                setHttpHeaders(parseData.copt)
            } else {
                setOpen(true)
            }
        }
    }, [])

    const changeM3u8Link = (e) => {
        setM3u8Link(e.target.value)
    }

    const iniotM3u8Link = (_url) => {
        setM3u8Link(_url)
    }

    const handleClose = () => {
        if (m3u8Link !== '') {
            setOpen(false);
        }
    };

    const onloadM3u8Link = () => {
        setVideoOptions(m3u8Link)
    }

    const stopLoadM3u8Link = () => {
        destroyVideo()
    }

    const destroyVideo = () => {
        // if (hlsObj) {
        //     hlsObj.stopLoad()
        // }
        // if (videoInstance) {
        //     video.src = ""
        //     videoInstance.pause()
        //     videoInstance.removeAttribute('src');
        //     videoInstance.load();
        //     console.log("destroyVideo")
        // }
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

    const playerRef = React.useRef(null);

    const handlePlayerReady = (player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
            console.log('player is waiting');
        });

        player.on('dispose', () => {
            console.log('player will dispose');
        });
    };

    return (
        <Box>
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
                                startIcon={<StopCircleIcon />}
                            >
                                停止
                            </LoadingButton>
                        ) : ''
                    }
                </h2>

                <FormControl sx={{ margin: '10px' }}>
                    {
                        videoJsOptions === null ? "":(
                            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} headers={httpHeaders} />
                        )
                    }
                </FormControl>
            </Box>
        </Box>
    )
}