import { useState, createContext, useEffect } from "react"
import axios from "axios"
export const MainContext = createContext();
import ParseM3u from '../utils/utils'

export const MainContextProvider = function ({ children }) {
    const headerHeight = 152
    const [scene, setScene] = useState(0);//0欢迎页 1详情页 2观看页
    const [originalM3uBody, setOriginalM3uBody] = useState('');//原始的m3u信息
    const [showM3uBody, setShowM3uBody] = useState([])//m3u信息转换成list 数组
    const [handleMod, setHandleMod] = useState(0);//当前的操作模式 0无操作 1操作处理检查 2检查完成
    const [checkMillisSeconds, setCheckMillisSeconds] = useState(1000);//检查url最多的
    const [httpRequestTimeout, setHttpRequestTimeout] = useState(3000);//http超时3000毫秒
    const [dialogBody, setBialogBody] = useState('')
    const [hasCheckedCount, setHasCheckedCount] = useState(0)
    const [showUrl, setShowUrl] = useState(false)
    const [uGroups, setUGroups] = useState([])

    const goToDetailScene = () => {
        setScene(1);
    }

    const goToWelcomeScene = () => {
        clearDetailData()
        setScene(0)
    }

    const clearDetailData = () => {
        setShowUrl(false)
        setHasCheckedCount(0)
        setBialogBody('')
        setHandleMod(0)
        setShowM3uBody([])
        setOriginalM3uBody('')
    }

    const goToWatchPage = () => {
        setScene(2)
    }

    const getMillisSeconds = () => {
        return (new Date()).getTime()
    }

    const changeShowUrl = (b) => {
        setShowUrl(b)
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

    const changeHttpRequestTimeout = (timeout) => {
        setHttpRequestTimeout(timeout)
    }

    const getSelectedGroupTitle = () => {
        let row = []
        for(let i = 0;i <uGroups.length;i++ ) {
            if(uGroups[i].checked) {
                row.push(uGroups[i].key)
            }
        }
        return row
    }

    const inArray = (arr, val) => {
        for(let i = 0;i< arr.length; i++) {
            if(arr[i] === val) {
                return true
            }
        }
        return false
    }

    const filterM3u = (filterNames) => {
        let selectedGroupTitles = getSelectedGroupTitle()
        if (filterNames.length === 0 && selectedGroupTitles.length === 0) {
            setShowM3uBody(ParseM3u.parseOriginalBodyToList(originalM3uBody))
            return
        }
        let temp = ParseM3u.parseOriginalBodyToList(originalM3uBody)
        let rows = [];
        for (let i = 0; i < temp.length; i++) {
            let hit = false;
            if(filterNames.length > 0) {
                for (let j = 0; j < filterNames.length; j++) {
                    let nameHit = contains(temp[i].sName, filterNames[j])
                    let groupTitleHit = selectedGroupTitles.length > 0 ? inArray(selectedGroupTitles, temp[i].groupTitle)  : true
                    if (nameHit && !hit && groupTitleHit) {
                        let one = temp[i]
                        one.index = rows.length
                        rows.push(one);
                        hit = true;
                    }
                }
            }else{
                let groupTitleHit = selectedGroupTitles.length > 0 ? inArray(selectedGroupTitles, temp[i].groupTitle)  : true
                if(groupTitleHit) {
                    let one = temp[i]
                    one.index = rows.length
                    rows.push(one);
                }
            }
        }
        setShowM3uBody(rows)
        setHandleMod(0)
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
        for(let i =0;i<groupList.length;i++) {
            _group[groupList[i].groupTitle] = groupList[i].groupTitle
        }
        let _tempGroup = []
        for (let i in _group) {
            _tempGroup.push({
                key:_group[i],
                checked:false
            })
        }
        setUGroups(_tempGroup)
    }

    const changeOriginalM3uBodies = (bodies) => {
        let res = []
        let bodyStr = ''
        for (let i = 0; i < bodies.length; i++) {
            bodyStr += bodies[i] + "\n"
            let one = ParseM3u.parseOriginalBodyToList(bodies[i])
            for (let j = 0; j < one.length; j++) {
                res.push(one[j])
            }
        }
        setShowM3uBody(res)
        parseGroup(res)
        setOriginalM3uBody(bodyStr);
    }

    const deepCopyJson = (obj) => {
        return JSON.parse(JSON.stringify(obj))
    }

    const setShowM3uBodyStatus = (index, status) => {
        setShowM3uBody(prev =>
            prev.map((item, idx) => idx === index ? { ...item, status: status } : item)
        )
    }

    const changeCheckMillisSeconds = (mill) => {
        setCheckMillisSeconds(mill)
    }

    const onExportValidM3uData = () => {
        let name = `#EXTM3U x-tvg-url="https://iptv-org.github.io/epg/guides/ao/guide.dstv.com.epg.xml,https://iptv-org.github.io/epg/guides/ar/directv.com.ar.epg.xml,https://iptv-org.github.io/epg/guides/ar/mi.tv.epg.xml,https://iptv-org.github.io/epg/guides/bf/canalplus-afrique.com.epg.xml,https://iptv-org.github.io/epg/guides/bi/startimestv.com.epg.xml,https://iptv-org.github.io/epg/guides/bo/comteco.com.bo.epg.xml,https://iptv-org.github.io/epg/guides/br/mi.tv.epg.xml,https://iptv-org.github.io/epg/guides/cn/tv.cctv.com.epg.xml,https://iptv-org.github.io/epg/guides/cz/m.tv.sms.cz.epg.xml,https://iptv-org.github.io/epg/guides/dk/allente.se.epg.xml,https://iptv-org.github.io/epg/guides/fr/chaines-tv.orange.fr.epg.xml,https://iptv-org.github.io/epg/guides/ga/startimestv.com.epg.xml,https://iptv-org.github.io/epg/guides/gr/cosmote.gr.epg.xml,https://iptv-org.github.io/epg/guides/hk-en/nowplayer.now.com.epg.xml,https://iptv-org.github.io/epg/guides/id-en/mncvision.id.epg.xml,https://iptv-org.github.io/epg/guides/it/guidatv.sky.it.epg.xml,https://iptv-org.github.io/epg/guides/my/astro.com.my.epg.xml,https://iptv-org.github.io/epg/guides/ng/dstv.com.epg.xml,https://iptv-org.github.io/epg/guides/nl/delta.nl.epg.xml,https://iptv-org.github.io/epg/guides/tr/digiturk.com.tr.epg.xml,https://iptv-org.github.io/epg/guides/uk/bt.com.epg.xml,https://iptv-org.github.io/epg/guides/us-pluto/i.mjh.nz.epg.xml,https://iptv-org.github.io/epg/guides/us/tvtv.us.epg.xml,https://iptv-org.github.io/epg/guides/za/guide.dstv.com.epg.xml"\n`;
        for (let i = 0; i < showM3uBody.length; i += 1) {
            if (showM3uBody[i].checked) {
                name += `${showM3uBody[i].originalData}\n`;
            }
        }
        setBialogBody(name)
    }

    const changeDialogBodyData = () => {
        setBialogBody(originalM3uBody)
    }

    const onSelectedRow = (index) => {
        let updatedList = [...showM3uBody]
        const objIndex = updatedList.findIndex(obj => obj.index == index);
        updatedList[objIndex].checked = !updatedList[objIndex].checked;
        setShowM3uBody(updatedList)
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

    const onCheckTheseLinkIsAvailable = async () => {
        if (handleMod === 1) {
            return
        }
        setHandleMod(1)
        let nowIsCheckingHostMap = {};
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
        let nowCount = 0
        while (randomArr.length !== 0) {
            let one = randomArr.shift()
            let hostName = parseUrlHost(one.url)
            if (nowIsCheckingHostMap[hostName] === undefined) {
                nowIsCheckingHostMap[hostName] = getMillisSeconds()
            }
            if (getMillisSeconds() - nowIsCheckingHostMap[hostName] < checkMillisSeconds) {
                randomArr.push(one)
                continue
            } else {
                try {
                    let res = await axios.get(one.url, { timeout: httpRequestTimeout })
                    if (res.status === 200) {
                        setShowM3uBodyStatus(one.index, 1)
                    } else {
                        setShowM3uBodyStatus(one.index, 2)
                    }
                    nowCount++
                    setHasCheckedCount(nowCount)
                    nowIsCheckingHostMap[hostName] = getMillisSeconds()
                } catch (e) {
                    nowCount++
                    setHasCheckedCount(nowCount)
                    setShowM3uBodyStatus(one.index, 2)
                    nowIsCheckingHostMap[hostName] = getMillisSeconds()
                }
            }
        }
        console.log("check finished.....")
        setHandleMod(2)
    }

    return (
        <MainContext.Provider value={{
            scene, originalM3uBody, showM3uBody, handleMod, checkMillisSeconds, dialogBody, hasCheckedCount, httpRequestTimeout, showUrl,
            headerHeight, uGroups, 
            onCheckTheseLinkIsAvailable, goToDetailScene, changeOriginalM3uBody, filterM3u, changeCheckMillisSeconds,
            deleteShowM3uRow, onExportValidM3uData, onSelectedRow, onSelectedOrNotAll, getAvailableOrNotAvailableIndex,
            changeHttpRequestTimeout, changeDialogBodyData, changeShowUrl, goToWatchPage, goToWelcomeScene,
            changeOriginalM3uBodies, setUGroups
        }}>
            {children}
        </MainContext.Provider>
    )
}