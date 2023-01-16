import { useState, useContext, useEffect } from 'react'
import { MainContext } from './../../context/main';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import SimpleDialog from './dialog';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Chip from '@mui/material/Chip';

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
    listStyle: "none",
    display: 'initial',
}));

export default function Setting(props) {
    const { selectedArr, setSelectedArr } = props;
    const [searchTitle, setSearchTitle] = useState('')
    const [chipData, setChipData] = useState([]);
    const [dialogMod, setDialogMod] = useState(1);
    const handleDeleteChip = (chipToDelete) => () => {
        setChipData((chips) => chips.filter((val, i) => i !== chipToDelete));
    }
    const _mainContext = useContext(MainContext);

    const goback = () => {
        _mainContext.goToWelcomeScene()
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

    const showSetting = () => {
        setDialogMod(3)
        setOpen(true);
    }

    const [open, setOpen] = useState(false);

    const handleClose = (value) => {
        setOpen(false);
    };

    const autoSelectedAvailablesUrl = () => {
        let ids = _mainContext.getAvailableOrNotAvailableIndex(1)
        setSelectedArr(ids)
    }

    const autoSelectedInAvailablesUrl = () => {
        let ids = _mainContext.getAvailableOrNotAvailableIndex(2)
        setSelectedArr(ids)
    }

    const clearSelectedArr = () => {
        setSelectedArr([])
    }

    return (
        <Box sx={{
            position: 'fixed',
            width: '100%',
            height: _mainContext.headerHeight + "px",
            borderBottom: '1px solid #eee',
            top: 0,
            left: 0,
            zIndex: 999,
            padding: '8px'
        }}>
            <SimpleDialog
                open={open}
                onClose={handleClose}
                clearSelectedArrFunc={clearSelectedArr}
                body={_mainContext.dialogBody}
                mod={dialogMod}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ maxWidth: "500px" }}>
                    <Box sx={{ marginBottom: '10px' }}>
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
                    <Box sx={{ display: "flex" }}>
                        <Box>
                            <Box component="form"
                                sx={{
                                    marginBottom: "5px",
                                    display: 'flex',
                                    alignItems: 'flex-end'
                                }}>
                                <FormControl sx={{ marginRight: '5px' }}>
                                    <TextField
                                        id="outlined-name"
                                        value={searchTitle}
                                        onChange={handleChangeSearchTitle}
                                        label="搜索"
                                        variant="standard"
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
    )
}