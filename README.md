# iptv-checker

![icon](https://github.com/zhimin-dev/iptv-checker/blob/react-version/img/icon.png)

本扩展支持m3u链接、m3u源文件以及提供公共的源，选择对应的操作，然后点击确定，可以帮助你检查这些源是否有效，并将这些有效的另存为新的m3u文件

## 安装方法

- [点我下载](https://github.com/zhimin-dev/iptv-checker/releases)本扩展并解压（选择最新的release版本下载）
- 下载chrome浏览器，打开浏览器，选择设置-扩展-加载未打包的扩展，选择解压后的文件夹
- 在扩展中点击iptv-checker图标

## 变更日志

- v2.7
  - 首页的【我有m3u订阅源链接】，支持多链接，多个链接请用英文的【,】逗号分隔
  - 首页的【我有m3u订阅源链接】以及【我有m3u订阅源内容】新增解析格式为多行的【名称，url】的形式直播源数据，例如

    ```bash
    测试卫视, https://static.zmis.me/test.m3u8
    测试卫视2, https://static.zmis.me/test2.m3u8
    ```
  
  - 首页的【订阅模式】支持选择多个国家/地区的订阅源
- v2.6
  - 修复了筛选输入框输入延迟的BUG
- v2.5
  - 优化了`在线观看`模式的体验
- v2.4
  - 支持`github action`打包，请至`production`分支下载最新公共版本
- v2.3
  - 首页支持`在线观看`模式
- v2.2
  - 支持检查页返回首页
  - 🌟支持在线观看
  - 修复了UI
  - 修复了搜索名称因为大小写问题而搜索不出来的问题
- v2.1
  - 优化了UI
  - 将http的超时设置开放给用户设置
- v2.0
  - 使用react进行开发
  - 优化了老版本检查源数据较慢的问题

## 联系

[知敏博客](https://zmis.me/user/zmisgod)
