const ParseM3u = {
    parseOriginalBodyToList: (originalM3uBody) => {
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
                i,
                "#EXTINF:" + rows[i][1],
                rows[i][3] + "" + rows[i][4]
            )) !== null
        }
        return resultList
    },
    parseRowToData(index, one, two) {
        const row = {
            index: index,
            url: two,
            groupTitle: ParseM3u.pregValue(one, "group-title"),
            tvgLogo: ParseM3u.pregValue(one, "tvg-logo"),
            tvgLanguage: ParseM3u.parseLanguages(ParseM3u.pregValue(one, "tvg-language")),
            tvgCountry: ParseM3u.pregValue(one, "tvg-country"),
            tvgId: ParseM3u.pregValue(one, "tvg-id"),
            status: 0,
            name: ParseM3u.parseName(one),
            originalData: `${one}\n${two}`,
            checked: false
        };
        return row;
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
    }
}

export default ParseM3u