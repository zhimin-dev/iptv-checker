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
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FindInPageIcon from '@mui/icons-material/FindInPage';

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
    listStyle: "none",
    display: 'initial',
}));

const ITEM_HEIGHT = 40;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 3,
            width: 200,
        },
    },
};

export default function Setting(props) {

    const _mainContext = useContext(MainContext);
    const { selectedArr, setSelectedArr } = props;


    const [selectedGroups, setSelectedGroups] = useState([]);
    const [searchTitle, setSearchTitle] = useState('')
    const [chipData, setChipData] = useState([]);
    const [dialogMod, setDialogMod] = useState(1);
    const [open, setOpen] = useState(false);

    const handleDeleteChip = (chipToDelete) => () => {
        setChipData((chips) => chips.filter((val, i) => i !== chipToDelete));
    }

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
        setDialogMod(4)
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

    const handleChangeGroup = (e) => {
        setSelectedGroups(e.target.value)
        let _aMap = {}
        for (let i = 0; i < e.target.value.length; i++) {
            _aMap[e.target.value[i]] = e.target.value[i]
        }
        let uGroup = _mainContext.uGroups
        for (let i = 0; i < uGroup.length; i++) {
            let checked = false
            if (_aMap[uGroup[i].key] !== undefined) {
                checked = true
            }
            uGroup[i].checked = checked
        }
        _mainContext.setUGroups(uGroup)
    }

    const doTransferGroup = () => {
        setDialogMod(5)
        setOpen(true);
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
                setDialogMod={setDialogMod}
                selectedArr={selectedArr}
                mod={dialogMod}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ maxWidth: "800px" }}>
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
                        <FormControl sx={{ marginRight: '5px' }}>
                            <Button startIcon={<FindInPageIcon />} size="small" onClick={showOriginalM3uBodyInfo} variant="outlined">原始m3u信息</Button>
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
                                        startIcon={<HelpOutlineIcon />}
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
                                        有效链接
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
                                        无效链接
                                    </LoadingButton>
                                </FormControl>
                            ) : ''
                        }
                        {
                            selectedArr.length > 0 ? (
                                <FormControl sx={{
                                    marginRight: "5px",
                                }}>
                                    <LoadingButton
                                        size="small"
                                        onClick={doTransferGroup}
                                        variant="outlined"
                                        startIcon={<ChangeCircleIcon />}
                                    >
                                        更换分组
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
                                        导出(下一步)
                                    </LoadingButton>
                                </FormControl>
                            ) : ''
                        }
                    </Box>
                    <Box sx={{ display: "flex" }}>
                        <Box component="form"
                            sx={{
                                marginBottom: "5px",
                                display: 'flex',
                                alignItems: 'flex-end'
                            }}>
                            <FormControl sx={{ marginRight: '5px',width:'120px' }}>
                                <TextField
                                    id="outlined-name"
                                    value={searchTitle}
                                    onChange={handleChangeSearchTitle}
                                    label="多关键词搜索"
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
                                    关键词
                                </LoadingButton>
                            </FormControl>
                            <FormControl sx={{ width: 200, margin: 0, marginRight: '5px' }} size="small">
                                <InputLabel id="demo-select-small" size="small">过滤分组</InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    size="small"
                                    multiple
                                    value={selectedGroups}
                                    onChange={handleChangeGroup}
                                    input={<OutlinedInput size="small" label="过滤分组" />}
                                    renderValue={(selectedGroups) => selectedGroups.join(', ')}
                                    MenuProps={MenuProps}
                                >
                                    {_mainContext.uGroups.map((value, index) => (
                                        <MenuItem key={index} value={value.key}>
                                            <Checkbox checked={value.checked} />
                                            <ListItemText primary={value.key} />
                                        </MenuItem>
                                    ))}
                                </Select>
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
                    </Box>
                    <Box sx={{ paddingRight: "20px", fontSize: '12px' }}>
                        {
                            chipData.length > 0 ? '频道名称包含:' : ''
                        }
                        {chipData.map((value, index) => {
                            return (
                                <ListItem key={index}>
                                    <Chip
                                        label={value}
                                        size="small"
                                        onDelete={handleDeleteChip(index)}
                                    />
                                    {
                                        index < chipData.length - 1 ? '或' : ''
                                    }
                                </ListItem>
                            );
                        })}
                        {
                            chipData.length > 0 && selectedGroups.length > 0 ? '且' : ''
                        }
                        {
                            selectedGroups.length > 0 ? '只显示分组为[' + selectedGroups.join(',') + ']的数据' : ''
                        }
                        {
                            chipData.length > 0 || selectedGroups.length ? ',需要点击【搜索】按钮进行筛选' : ''
                        }
                    </Box>
                </Box>
                <Box sx={{ paddingRight: "10px" }}>
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
        </Box>
    )
}