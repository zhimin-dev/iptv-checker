import { useState, createContext, useEffect, useRef } from "react"
import axios from "axios"
export const MainContext = createContext();
import ParseM3u from '../utils/utils'

export const MainContextProvider = function ({ children }) {
    const headerHeight = 152
    const [originalM3uBody, setOriginalM3uBody] = useState('');//原始的m3u信息
    const [showM3uBody, setShowM3uBody] = useState([])//m3u信息转换成list 数组
    const [hasCheckedCount, setHasCheckedCount] = useState(0)
    const [uGroups, setUGroups] = useState([])//当前分组
    const [exportData, setExportData] = useState([])//待导出数据json
    const [exportDataStr, setExportDataStr] = useState('')//导出数据的str
    const [checkUrlMod, setCheckUrlMod] = useState(0)//检查当前链接是否有效模式 0未在检查中 1正在检查 2暂停检查
    const [handleMod, setHandleMod] = useState(0);//当前的操作模式 0无操作 1操作处理检查 2检查完成
    const [checkData, setCheckData] = useState([])//待检查数据列表
    const [videoResolution, setVideoResolution] = useState([])//视频分辨率筛选

    const [settings, setSettings] = useState({
        checkSleepTime: 300,// 检查下一次请求间隔(毫秒)
        httpRequestTimeout: 8000,// http请求超时,0表示 无限制
        showFullUrl: false,//是否显示url
    })

    const nowCheckUrlModRef = useRef()
    const hasCheckedCountRef = useRef()
    const videoInfoRef = useRef({})

    let debugMode = true

    const log = (...args) => {
        if (debugMode) {
            console.log(...args)
        }
    }

    useEffect(() => {
        hasCheckedCountRef.current = 0
    }, [])

    const onChangeSettings = (value) => {
        setSettings(value);
    }

    const changeVideoResolution = (val) => {
        setVideoResolution(val)
    }

    const clearDetailData = () => {
        setHasCheckedCount(0)
        hasCheckedCountRef.current = 0
        setExportDataStr('')
        setHandleMod(0)
        setCheckUrlMod(0)
        setShowM3uBody([])
        setOriginalM3uBody('')
    }

    const contains = (str, substr) => {
        return str.indexOf(substr) != -1;
    }

    const parseUrlHost = (str) => {
        const url = new URL(str)
        return url.hostname
    }

    const deleteShowM3uRow = (index) => {
        setShowM3uBody(prev => prev.filter((v, i) => v.index !== index))
    }

    const getSelectedGroupTitle = () => {
        let row = []
        for (let i = 0; i < uGroups.length; i++) {
            if (uGroups[i].checked) {
                row.push(uGroups[i].key)
            }
        }
        return row
    }

    const inArray = (arr, val) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === val) {
                return true
            }
        }
        return false
    }

    const videoResolutionGetChecked = () => {
        let save = []
        for (let i = 0; i < videoResolution.length; i++) {
            if (videoResolution[i].checked) {
                save.push(videoResolution[i].value)
            }
        }
        return save
    }

    const filterM3u = (filterNames) => {
        let selectedGroupTitles = getSelectedGroupTitle()
        let videoResArr = videoResolutionGetChecked()
        if (filterNames.length === 0 && selectedGroupTitles.length === 0 && videoResArr.length === 0) {
            setShowM3uBody(ParseM3u.parseOriginalBodyToList(originalM3uBody, videoInfoRef.current))
            return
        }
        let temp = ParseM3u.parseOriginalBodyToList(originalM3uBody, videoInfoRef.current)
        let rows = [];
        let _index = 1
        for (let i = 0; i < temp.length; i++) {
            // 检查当前视频清晰度是否命中
            let hitVideoRes = true
            if (videoResArr.length > 0 && temp[i].videoType != "") {
                hitVideoRes = false
                for (let v = 0; v < videoResArr.length; v++) {
                    if (temp[i].videoType === videoResArr[v]) {
                        hitVideoRes = true
                    }
                }
            }
            // 搜索名称是否命中
            let hitTitleSearch = true
            if (filterNames.length > 0) {
                hitTitleSearch = false
                for (let j = 0; j < filterNames.length; j++) {
                    if (contains(temp[i].sName, filterNames[j].toLowerCase())) {
                        hitTitleSearch = true
                    }
                }
            }
            // group是否命中
            let hitGroup = true
            if (selectedGroupTitles.length > 0) {
                hitGroup = false
                if (inArray(selectedGroupTitles, temp[i].groupTitle)) {
                    hitGroup = true
                }
            }
            if (hitGroup && hitVideoRes && hitTitleSearch) {
                let one = temp[i]
                one.index = _index
                rows.push(one);
                _index ++ 
            }
        }
        log("setShowM3uBody---", rows)
        setShowM3uBody(rows)
    }

    const strToCsv = (body) => {
        let _res = ParseM3u.parseOriginalBodyToList(body)
        let csvBodyArr = []
        csvBodyArr.push(["名称", "链接", "分组", "台标"])
        for (let i = 0; i < _res.length; i++) {
            csvBodyArr.push([_res[i].name, _res[i].url, _res[i].groupTitle, _res[i].tvgLogo])
        }
        return csvBodyArr
    }

    const changeOriginalM3uBody = (body) => {
        clearDetailData()
        setOriginalM3uBody(body);
        let _res = ParseM3u.parseOriginalBodyToList(body)
        setShowM3uBody(_res)
        parseGroup(_res)
    }

    const parseGroup = (groupList) => {
        let _group = {}
        for (let i = 0; i < groupList.length; i++) {
            _group[groupList[i].groupTitle] = groupList[i].groupTitle
        }
        let _tempGroup = []
        for (let i in _group) {
            _tempGroup.push({
                key: _group[i],
                checked: false
            })
        }
        setUGroups(_tempGroup)
    }

    const addGroup = (name) => {
        let exists = false
        for (let i = 0; i < uGroups.length; i++) {
            if (uGroups[i].key === name) {
                exists = true
            }
        }
        if (!exists) {
            let row = deepCopyJson(uGroups)
            row.push({
                key: name,
                checked: false
            })
            setUGroups(row)
        }
    }

    const changeOriginalM3uBodies = (bodies) => {
        let res = []
        let bodyStr = ''
        let index = 1;
        for (let i = 0; i < bodies.length; i++) {
            bodyStr += bodies[i] + "\n"
            let one = ParseM3u.parseOriginalBodyToList(bodies[i])
            for (let j = 0; j < one.length; j++) {
                one[j].index = index
                res.push(one[j])
                index++
            }
        }
        setShowM3uBody(res)
        parseGroup(res)
        setOriginalM3uBody(bodyStr);
    }

    const deepCopyJson = (obj) => {
        return JSON.parse(JSON.stringify(obj))
    }

    const setShowM3uBodyStatus = (index, status, videoObj, audioObj, delay) => {
        setShowM3uBody(list =>
            list.map((item, idx) => {
                if (item.index === index) {
                    let videoType = ''
                    if (videoObj !== null) {
                        videoType = ParseM3u.getVideoResolution(videoObj.width, videoObj.height)
                    }
                    let data = {
                        ...item,
                        status: status,
                        video: videoObj,
                        audio: audioObj,
                        videoType: videoType,
                        delay: delay,
                    };
                    return data
                }
                return item;
            })
        )
    }

    const setCheckDataStatus = (index, status) => {
        setCheckData(prev =>
            prev.map((item, idx) => idx === index ? { ...item, status: status } : item)
        )
    }

    const onExportValidM3uData = () => {
        let _export = []
        for (let i = 0; i < showM3uBody.length; i += 1) {
            if (showM3uBody[i].checked) {
                _export.push(showM3uBody[i])
            }
        }
        setExportData(_export)
    }

    const changeDialogBodyData = () => {
        setExportDataStr(originalM3uBody)
    }

    const onSelectedRow = (index) => {
        let updatedList = [...showM3uBody]
        const objIndex = updatedList.findIndex(obj => obj.index == index);
        updatedList[objIndex].checked = !updatedList[objIndex].checked;
        setShowM3uBody(updatedList)
    }

    const findM3uBodyByIndex = (index) => {
        let updatedList = [...showM3uBody]
        const objIndex = updatedList.findIndex(obj => obj.index == index);
        return showM3uBody[objIndex]
    }

    const onSelectedOrNotAll = (mod) => {
        //mod = 1选择 0取消选择
        if (mod === 1) {
            setShowM3uBody(prev => prev.map((item, _) =>
                true ? { ...item, checked: true } : ''
            ))
        } else {
            setShowM3uBody(prev => prev.map((item, _) =>
                true ? { ...item, checked: false } : ''
            ))
        }
    }

    const getAvailableOrNotAvailableIndex = (mod) => {
        //mod == 1 有效 2无效
        let ids = []
        let updatedList = [...showM3uBody]
        for (let i = 0; i < updatedList.length; i++) {
            if (showM3uBody[i].status === mod) {
                updatedList[i].checked = true
                ids.push(showM3uBody[i].index)
            } else {
                updatedList[i].checked = false
            }
        }
        setShowM3uBody(updatedList)
        return ids
    }

    const getCheckUrl = (url, timeout) => {
        return '/check-url-is-available?url=' + url + "&timeout=" + timeout
    }

    const getM3uBody = (url, timeout) => {
        log(url, timeout)
        return '/fetch-m3u-body?url=' + url + "&timeout=" + timeout
    }

    const prepareCheckData = () => {
        let _temp = deepCopyJson(showM3uBody)
        let _tempMap = {}
        for (let i = 0; i < _temp.length; i++) {
            let hostName = parseUrlHost(_temp[i].url)
            if (_tempMap[hostName] === undefined) {
                _tempMap[hostName] = []
            }
            _tempMap[hostName].push(_temp[i])
        }
        let maxId = 0;
        for (const key in _tempMap) {
            maxId = maxId > _tempMap[key].length ? maxId : _tempMap[key].length
        }
        let randomArr = [];
        for (let i = 0; i < maxId; i++) {
            for (const key in _tempMap) {
                if (_tempMap[key][i] !== undefined) {
                    randomArr.push(_tempMap[key][i]);
                }
            }
        }
        setCheckData(randomArr)
        return randomArr
    }

    const sleep = (time) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    const doCheck = async (data) => {
        for (let i = 0; i < data.length; i++) {
            if (nowCheckUrlModRef.current === 2) {
                log("----0")
                continue
            }
            let one = data[i]
            log("doCheck---111", one)
            let getData = findM3uBodyByIndex(one.index)
            log("doCheck---222", getData)
            if (getData.status !== 0) {
                log("----1")
                continue
            }
            try {
                let _url = getCheckUrl(one.url, settings.httpRequestTimeout)
                let res = await axios.get(_url)
                log(res.data.video)
                if (res.status === 200) {
                    log("====5")
                    let videoInfoMap = videoInfoRef.current
                    videoInfoMap[one.url] = {
                        "video": res.data.video,
                        "audio": res.data.audio,
                        "videoType": ParseM3u.getVideoResolution(res.data.video.width, res.data.video.height),
                        "status": 1,
                        'delay': res.data.delay,
                    }
                    setShowM3uBodyStatus(one.index, 1, res.data.video, res.data.audio, res.data.delay)
                    setCheckDataStatus(one.index, 1)
                } else {
                    log("====666")
                    let videoInfoMap = videoInfoRef.current
                    videoInfoMap[one.url] = {
                        "status": 2,
                    }
                    setShowM3uBodyStatus(one.index, 2, null, null, 0)
                    setCheckDataStatus(one.index, 2)
                }
                hasCheckedCountRef.current += 1
                setHasCheckedCount(hasCheckedCountRef.current)
            } catch (e) {
                log(e)
                setShowM3uBodyStatus(one.index, 2, null, null, 0)
                let videoInfoMap = videoInfoRef.current
                videoInfoMap[one.url] = {
                    "status": 2,
                }
                hasCheckedCountRef.current += 1
                setHasCheckedCount(hasCheckedCountRef.current)
            }
            await sleep(settings.checkSleepTime)
        }
        log("check finished.....")
        log("showM3uBody", showM3uBody)
        log("videoInfoRef.current", videoInfoRef.current)
        if (nowCheckUrlModRef.current === 1) {
            setHandleMod(2)
            setCheckUrlMod(0)
            nowCheckUrlModRef.current = 0
        }
    }

    const onCheckTheseLinkIsAvailable = async () => {
        if (handleMod === 1) {
            return
        }
        setCheckUrlMod(1)
        nowCheckUrlModRef.current = 1
        setHandleMod(1)
        let data = prepareCheckData()
        doCheck(data)
    }

    const onChangeExportData = (value) => {
        setExportData(value)
    }

    const onChangeExportStr = () => {
        setExportDataStr(_toOriginalStr(exportData))
    }

    const batchChangeGroupName = (selectArr, groupName) => {
        updateDataByIndex(selectArr, { "groupTitle": groupName })
    }

    const addGroupName = (name) => {
        addGroup(name)
    }

    const updateDataByIndex = (indexArr, mapData) => {
        let row = deepCopyJson(showM3uBody)
        if (mapData["groupTitle"] !== undefined && mapData["groupTitle"] !== null) {
            addGroup(mapData["groupTitle"])
        }
        for (let i = 0; i < row.length; i++) {
            if (inArray(indexArr, row[i].index)) {
                for (let j in mapData) {
                    if (j === 'name') {
                        row[i]['sName'] = mapData[j]
                    }
                    row[i][j] = mapData[j]
                }
            }
        }
        let data = ParseM3u.parseOriginalBodyToList(originalM3uBody)
        for (let i = 0; i < data.length; i++) {
            if (inArray(indexArr, data[i].index)) {
                for (let j in mapData) {
                    if (j === 'name') {
                        data[i]['sName'] = mapData[j].toLowerCase()
                    }
                    data[i][j] = mapData[j]
                }
            }
        }
        setOriginalM3uBody(_toOriginalStr(data))
        setShowM3uBody(row)
    }

    const _toOriginalStr = (data) => {
        let body = `#EXTM3U\n`;
        for (let i = 0; i < data.length; i += 1) {
            body += `#EXTINF:-1 tvg-id="${data[i].tvgId}" tvg-logo="${data[i].tvgLogo}" group-title="${data[i].groupTitle}",${data[i].name}\n${data[i].url}\n`
        }
        return body
    }

    const pauseCheckUrlData = () => {
        setCheckUrlMod(2)
        nowCheckUrlModRef.current = 2
    }

    const resumeCheckUrlData = async () => {
        setCheckUrlMod(1)
        nowCheckUrlModRef.current = 1
        await sleep(100)
        doCheck(checkData)
    }

    return (
        <MainContext.Provider value={{
            originalM3uBody, changeOriginalM3uBody,
            exportDataStr, setExportDataStr,
            exportData, onChangeExportData,
            uGroups, setUGroups,
            videoResolution, changeVideoResolution,
            settings, onChangeSettings,
            showM3uBody, handleMod, hasCheckedCount,
            headerHeight, checkUrlMod,
            onCheckTheseLinkIsAvailable, filterM3u,
            deleteShowM3uRow, onExportValidM3uData,
            onSelectedRow, onSelectedOrNotAll, getAvailableOrNotAvailableIndex,
            changeDialogBodyData,
            changeOriginalM3uBodies, updateDataByIndex,
            onChangeExportStr, batchChangeGroupName, addGroupName, getCheckUrl,
            pauseCheckUrlData, resumeCheckUrlData, strToCsv,
            getM3uBody
        }}>
            {children}
        </MainContext.Provider>
    )
}