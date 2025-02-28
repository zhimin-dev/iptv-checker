<div align='center'>
<img src="https://github.com/zhimin-dev/iptv-checker/blob/main/icon.png" width="150" height="150" alt="logo" />

iptv-checker

<sup>iptv-checker, 检查你的播放列表是否可用</sup>

[![Chat Server](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/vPTv6UUA)

中文</a> / <a href="https://github.com/zhimin-dev/iptv-checker/blob/main/cn.md">English</a>

<a href="https://trendshift.io/repositories/5647" target="_blank"><img src="https://trendshift.io/api/badge/repositories/5647" alt="zhimin-dev%2Fiptv-checker | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

<img src="https://github.com/zhimin-dev/iptv-checker/blob/main/web-snapshot.png" />

</div>

## 介绍

适用于Docker & Desktop & & CMD的IPTV检查工具，请检查您的播放列表是否可用

- 对于容器版本，请前往 [docker hub](https://hub.docker.com/r/zmisgod/iptvchecker) 页面查找相关命令

- 在命令行模式下，转到 [GitHub 的发布页面](https://github.com/zhimin-dev/iptv-checker/releases) 并查找版本号以 'v' 开头的下载文件

- 对于桌面版本，请前往 [GitHub 的发布页面](https://github.com/zhimin-dev/iptv-checker/releases) 并查找版本号以 'd' 开头的下载文件

### Docker官方包使用方法

[DockerHub](https://hub.docker.com/r/zmisgod/iptvchecker)

按照下面的命令运行docker版本的iptv-checker

```bash
# 拉取镜像
docker pull zmisgod/iptvchecker

# 运行镜像
docker run -d -p 8081:8089 --name myIp zmisgod/iptvchecker

# 或者指定端口（本次指定端口为 10001，下面2个10001的地方都需要改动）、输出文件映射本地目录
docker run -d -p 8081:10001 -e WEB_PORT=10001 -v ~/icStatic/output:/app/static/output  --name myIp ipserver
```

再打开浏览器访问`http://127.0.0.1:8081/`即可

### Docker-Compose 部署

```bash
docker-compose up -d
```

### 常见问题

- 如果mac系统安装后提示文件已损坏，输入`xattr -cr /Applications/iptv-checker-desktop.app`可解决

## 更新日志

- v4.1.4
  - 新增
    - 增加捐赠入口
    - 后台任务支持仅保留2个相同名称
    - 后台任务新增支持http检查时rtmp等非http源，可跳过
  - 优化
    - 后台新增任务UI、逻辑变化，更加符合用户操作逻辑
    - 后台任务列表优化
    - 后台任务删除时，增加弹框提示
  - bug修复
    - 修复了ffmepg检查导致后台任务无法进行的问题
    - 优化了重命名频道名称导致检查卡住的问题
- 4.1.3
  - 修复后台检查失败，导致所有任务无法进行
- 4.1.2
  - 去掉节目名称中的一些无用字符，比如`[HD]`或者`123231 [SD]`
  - 修复不检查时导出的文件为空的bug
  - cmd模式搜索频道模式
  - 支持强制ffmpeg检查，检测结果更加准确
- 4.1.1
  - 修复无法解析复杂的m3u文件的bug
- v4.1.0
  - [修复bug 77](https://github.com/zhimin-dev/iptv-checker/issues/77)
  - [增加自定义排序](https://github.com/zhimin-dev/iptv-checker/issues/69)
  - [支持txt文件](https://github.com/zhimin-dev/iptv-checker/issues/74)
  - 修复黑夜模式的ui样式bug
  - 增加快速检测的页面
- v4.0.4
  - 升级tauri 2.0
  - 在线播放支持全屏并显示正确位置
- v4.0.3
  - 修复windows平台无法播放的问题
- v4.0.1
  - bug修复
    - 检测源输入框无法识别数据问题
    - 桌面版检查详情页无法拖动问题
    - 桌面版检查详情页在线播放体验优化
    - 检查数据后再通过公共订阅源菜单进入检查详情页会出现检查设置菜单还是上一次状态
    - 修复源检测无法暂停、检查失败的问题
  - 后台任务支持导出、导入
  - 后台任务增加不检查任务
- 4.0.0
  - UI更新
  - 支持windows && mac os && linux 桌面端
- 3.2.1
  - 后台任务支持并发、排序设置
  - 优化任务列表下载界面
  - 修复智能框解析数据错误问题
- 3.2.0
  - 支持关键词匹配
  - 支持超时时间配置
- 3.1.1
  - 修复后台检查后cpu增高的问题
- 3.1.0
  - 支持任务编辑
  - 支持任务立即执行
- 3.0.0
  - 支持后台检查

## 联系

[知敏博客](https://zmis.me/user/zmisgod)
