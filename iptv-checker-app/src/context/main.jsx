import { useContext, useState, createContext, useEffect } from "react"
import axios from "axios"
export const MainContext = createContext();
import ParseM3u from './utils'

export const MainContextProvider = function ({ children }) {
    const [scene, setScene] = useState(0);//当前是欢迎页0 还是详情页1
    const [originalM3uBody, setOriginalM3uBody] = useState('');//原始的m3u信息
    const [showM3uBody, setShowM3uBody] = useState([]);//m3u信息转换成list 数组
    const [handleMod, setHandleMod] = useState(0);//当前的操作模式 0无操作 1操作处理检查 2检查完成
    const [checkMillisSeconds, setCheckMillisSeconds] = useState(3000);//检查url最多的

    useEffect(() => {
        setShowM3uBody(ParseM3u.parseOriginalBodyToList(originalM3uBody))
    }, [originalM3uBody])

    const goToDetailScene = () => {
        setScene(1);
    }

    const getMillisSeconds = () => {
        return (new Date()).getTime()
    }

    const contains = (str, substr) => {
        return str.indexOf(substr) != -1;
    }

    const parseUrlHost = (str) => {
        const url = new URL(str)
        return url.hostname
    }

    const deleteShowM3uRow = (index) => {
        setShowM3uBody(prev => prev.filter((_, i) => i !== index))
    }

    const filterM3u = (filterNames) => {
        if (filterNames.length === 0) {
            setShowM3uBody(ParseM3u.parseOriginalBodyToList(originalM3uBody))
            return
        }
        let rows = [];
        for (let i = 0; i < showM3uBody.length; i++) {
            let hit = false;
            for (let j = 0; j < filterNames.length; j++) {
                if (contains(showM3uBody[i].name, filterNames[j]) && !hit) {
                    rows.push(showM3uBody[i]);
                    hit = true;
                }
            }
        }
        setShowM3uBody(rows)
    }

    const changeOriginalM3uBody = (body) => {
        setOriginalM3uBody(body);
    }

    const deepCopyJson = (obj) => {
        return JSON.parse(JSON.stringify(obj))
    }

    const setShowM3uBodyStatus = (index, status) => {
        setShowM3uBody(prev => 
            prev.map((item, idx) => idx === index ? {...item, status:  status} : item)
        )
    }

    const changeCheckMillisSeconds = (mill) => {
        setCheckMillisSeconds(mill)
    }

    const onExportValidM3uData = () => {
        
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
                    let res = await axios.get(one.url)
                    if (res.status === 200) {
                        setShowM3uBodyStatus(one.index, 1)
                    } else {
                        setShowM3uBodyStatus(one.index, 2)
                    }
                    nowIsCheckingHostMap[hostName] = getMillisSeconds()
                } catch (e) {
                    setShowM3uBodyStatus(one.index, 2)
                    nowIsCheckingHostMap[hostName] = getMillisSeconds()
                }
            }
        }
        console.log("finished.....")
        setHandleMod(2)
    }

    return (
        <MainContext.Provider value={{
            scene, originalM3uBody, showM3uBody, handleMod,checkMillisSeconds,
            onCheckTheseLinkIsAvailable, goToDetailScene, changeOriginalM3uBody, filterM3u, changeCheckMillisSeconds,
            deleteShowM3uRow, onExportValidM3uData,
        }}>
            {children}
        </MainContext.Provider>
    )
}