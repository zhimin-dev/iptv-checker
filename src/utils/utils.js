const ParseM3u = {
    parseOneM3uData: (str) => {
        let dataArr = str.split('\n')
        if (dataArr.length > 0) {
            let obj = {}
            obj.url = dataArr[dataArr.length - 1]
            let copt = []
            if (dataArr.length > 2) {
                for (let i = 1; i < dataArr.length - 1; i++) {
                    let one = dataArr[i]
                    let rep = one.replace("#EXTVLCOPT:", "")
                    let two = rep.split("=")
                    let vTwo = []
                    for (let j = 0; j < two.length; j++) {
                        if (j !== 0) {
                            vTwo.push(two[j])
                        }
                    }
                    let _key = two[0].replace("http-", "")
                    let _keyExp = _key.split("-")
                    let _keyExpArr = []
                    for (let i = 0; i < _keyExp.length; i++) {
                        _keyExpArr.push(_keyExp[i].charAt(0).toUpperCase() + _keyExp[i].slice(1))
                    }
                    let _rKey = _keyExpArr.join("-")
                    let _value = vTwo.join(":")
                    copt.push({ key: _rKey, value: _value })
                }
            }
            obj.tvgId = ParseM3u.pregValue(dataArr[0], "tvg-id")
            obj.copt = copt
            obj.name = ParseM3u.parseName(dataArr[0])
            obj.logoUrl = ParseM3u.pregValue(dataArr[0], "tvg-logo")
            obj.exist = true
            return obj;
        }
        return []
    },
    parseOriginalBodyToList: (originalM3uBody, videoInfoMap) => {
        const regex = /#EXTINF:(.*)\n(#EXTVLCOPT:.*\n)*(http[s]*)(.*)/gm;
        let rows = [];
        let m;
        while ((m = regex.exec(originalM3uBody)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            let one = [];
            m.forEach((match, groupIndex) => {
                one.push(match);
            });
            rows.push(one);
        }
        let resultList = []
        for (let i = 0; i < rows.length; i += 1) {
            resultList.push(ParseM3u.parseRowToData(
                i+1,
                "#EXTINF:" + rows[i][1],
                rows[i][3] + "" + rows[i][4],
                rows[i][0]
            )) !== null
        }
        if (resultList.length === 0) {
            return ParseM3u.removeRepeatList(ParseM3u.parseQuoteFormat(originalM3uBody), videoInfoMap)
        }
        return ParseM3u.removeRepeatList(resultList,videoInfoMap)
    },
    removeRepeatList(list, videoInfoMap) {
        let saveMap = {};
        let _rows = []
        for (let i = 0; i < list.length; i++) {
            if (saveMap[list[i].url] === undefined) {
                let item = list[i]
                if(videoInfoMap !== undefined && videoInfoMap[list[i].url] !== undefined &&  
                    videoInfoMap[list[i].url] !== null) {
                    item = {
                        ...item,
                        ...videoInfoMap[list[i].url]
                    }
                }
                _rows.push(item);
                saveMap[list[i].url] = true
            }
        }
        return _rows
    },
    parseQuoteFormat(body) {
        let rows = []
        let groupTitle = "Undefined"
        let arr = body.split("\n")
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== "") {
                let item = arr[i].split(",")
                if (item !== "") {
                    if (item.length >= 2 && ParseM3u.checkStrIsLink(item[1])) {
                        let originalData = `#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Undefined",` + item[0] + `\n` + item[1]
                        let raw = `#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Undefined",` + item[0] + `\n` + item[1]
                        let data = this.buildM3uBaseObject(i, item[1],
                            groupTitle, "", "", "", "",
                            item[0], originalData, raw)
                        rows.push(data)
                    } else {
                        groupTitle = item[0]
                    }
                } else {
                    groupTitle = "Undefined"
                }
            }
        }
        if (rows.length === 0) {
            throw new Error("未成功解析到数据，请检查输入")
        }
        return rows
    },
    buildM3uBaseObject(index, url, groupTitle, tvgLogo, tvgLanguage, tvgCountry, tvgId, name, originalData, raw) {
        return {
            index: index,
            url: url,
            groupTitle: groupTitle,
            tvgLogo: tvgLogo,
            tvgLanguage: tvgLanguage,
            tvgCountry: tvgCountry,
            tvgId: tvgId,
            name: name,
            sName: name.toLowerCase(),
            originalData: originalData,
            raw: raw,

            status: 0,// 状态 0未检查 1成功 2失败
            checked: false,// 当前是否检查过
            video: null,// 视频信息
            audio: null,// 音频信息
            videoType: '',//视频类型 ，sd、hd...
            delay:0,//网络延迟，单位ms
        }
    },
    getVideoResolutionList () {
        return [
            {
                'name':'普清',
                'value':'SD'
            },
            {
                'name':'高清720P',
                'value':'HD'
            },
            {
                'name':'全高清1080P',
                'value':'FHD'
            },
            {
                'name':'超高清4K',
                'value':'UHD'
            },
            {
                'name':'全超高清8K',
                'value':'FUHD'
            }
        ]
    },
    getVideoResolution(width, height) {
        if (width < 1280 || height < 720) {
            return "SD";
        } else if (width < 1920 || height < 1080) {
            return "HD";
        } else if (width < 3840 || height < 2160) {
            return "FHD";
        } else if (width < 8192 || height < 4320) {
            return "UHD";
        } else {
            return "FUHD";
        }
    },
    checkStrIsLink(_str) {
        const regex = /(http|https|lwb|P2p|p2p|p9p|rmtp):\/\/([\w.]+\/?)\S*/;

        // Alternative syntax using RegExp constructor
        // const regex = new RegExp('(http|https):\\/\\/([\\w.]+\\/?)\\S*', '')
        let m = [];

        if ((m = regex.exec(_str)) !== null) {
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                m.push(match)
            });
        }
        if (m !== null && m.length > 0) {
            return true
        }
        return false
    },
    parseRowToData(index, one, two, raw) {
        let groupTitle = ParseM3u.pregValue(one, "group-title")
        if (groupTitle === '') {
            groupTitle = 'Undefined'
        }
        let originalData = `${one}\n${two}`
        let data = this.buildM3uBaseObject(index,
            two,
            groupTitle,
            ParseM3u.pregValue(one, "tvg-logo"),
            ParseM3u.parseLanguages(ParseM3u.pregValue(one, "tvg-language")),
            ParseM3u.pregValue(one, "tvg-country"),
            ParseM3u.pregValue(one, "tvg-id"),
            ParseM3u.parseName(one),
            originalData,
            raw)
        return data;
    },
    parseName: (name) => {
        const row = name.split(",");
        return row[row.length - 1];
    },
    parseLanguages: (name) => {
        if (name !== "") {
            return name.split(";");
        }
        return [];
    },
    pregValue: (str, name) => {
        let regex;
        if (name === "group-title") {
            regex = /group-title="(.*)"/gm;
        } else if (name === "tvg-logo") {
            regex = /tvg-logo="(.*)"/gm;
        } else if (name === "tvg-language") {
            regex = /tvg-language="(.*)"/gm;
        } else if (name === "tvg-country") {
            regex = /tvg-country="(.*)"/gm;
        } else if (name === "tvg-id") {
            regex = /tvg-id="(.*)"/gm;
        }
        let m;
        let value = "";
        while ((m = regex.exec(str)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex += 1;
            }
            m.forEach((match, groupIndex) => {
                if (groupIndex === 1) {
                    value = match;
                }
            });
        }
        if (value !== "") {
            return value.split('" ')[0];
        }
        return "";
    },
    checkRespIsValudM3u8Data: (body) => {
        let data = body.split('\n')
        if (data[0].indexOf('#EXTM3U') !== -1) {
            return true
        }
        return false
    }
}

export default ParseM3u