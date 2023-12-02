const utils = {
    isValidUrl(url) {
        // 定义 URL 正则表达式模式
        var pattern = new RegExp(
            '^(https?:\\/\\/)?' + // http:// 或者 https://
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // 域名
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP 地址
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // 端口号和路径
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // 查询字符串
            '(\\#[-a-z\\d_]*)?$',
            'i'
        );

        return pattern.test(url);
    }
}

export default utils