import * as React from 'react';
import { useContext, useState, createContext, useEffect } from "react"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';
import Hls from 'hls.js'
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
    const [m3u8Link, setM3u8Link] = useState('http://live.tvfix.org/hls/startv.m3u8')
    const [loading, setLoading] = useState(false)
    const [httpHeaders, setHttpHeaders] = useState([])
    const [videoStyle, setVideoStyle] = useState({
        width: '550px',
        height: '300px'
    })

    useEffect(() => {
        let a = `#EXTINF:-1 tvg-id="BabyTV.uk" tvg-logo="https://upload.wikimedia.org/wikipedia/en/4/45/BabyTV.png" group-title="Kids" user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",Baby TV Asia (Vietnamese dub) (1080p)
        #EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36
        https://livecdn.fptplay.net/hda3/babytvhd_vhls.smil/chunklist.m3u8`
        let b = encodeURIComponent(a)
        console.log(b)
        console.log(decodeURIComponent(b))
    }, [])

    const changeM3u8Link = (e) => {
        setM3u8Link(e.target.value)
    }

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
                setVideoStyle({
                    width: e.target.videoWidth + 'px',
                    height: e.target.videoHeight + 'px'
                })
            }, false);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
        }
        video.play();
        video.addEventListener("canplay", e => {
            setLoading(false)
        })
        video.addEventListener('error', function (e) {
            alert(e.message)
        })
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

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FormControl sx={{ width: 550, margin: '10px' }}>
                    <TextField sx={{ fontSize: '11px' }} label='您所选择的m3u信息' size="small" id="standard-multiline-static" value={m3u8Link} onChange={changeM3u8Link} />
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'end',
                        marginTop: '5px'
                    }}>
                        <LoadingButton
                            size="small"
                            onClick={onloadM3u8Link}
                            variant="contained"
                            loading={loading}
                            color="canplayColor"
                        >
                            播放
                        </LoadingButton>
                    </Box>
                </FormControl>
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