<div align="center">
  <img src="https://github.com/zhimin-dev/iptv-checker/blob/main/icon.png" width="150" height="150" alt="IPTV Checker logo" />

  <h1>iptv-checker</h1>

  <p><strong>检查你的 IPTV 播放列表是否可用</strong></p>

  <p>
    <a href="https://discord.gg/vPTv6UUA"><img src="https://img.shields.io/badge/chat-discord-7289da.svg" alt="Discord" /></a>
    <a href="https://hub.docker.com/r/zmisgod/iptvchecker"><img src="https://img.shields.io/docker/pulls/zmisgod/iptvchecker?color=2496ED&logo=docker&label=docker%20pulls" alt="Docker Pulls" /></a>
    <a href="https://github.com/zhimin-dev/iptv-checker/stargazers"><img src="https://img.shields.io/github/stars/zhimin-dev/iptv-checker?color=FFD700&logo=github" alt="Stars" /></a>
    <a href="https://github.com/zhimin-dev/iptv-checker/releases"><img src="https://img.shields.io/github/v/release/zhimin-dev/iptv-checker?color=blue&label=release" alt="Release" /></a>
    <a href="https://github.com/zhimin-dev/iptv-checker/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>
  </p>

  <p>
    中文 / <a href="https://github.com/zhimin-dev/iptv-checker/blob/main/README_EN.md">English</a>
  </p>

  <a href="https://trendshift.io/repositories/5647" target="_blank"><img src="https://trendshift.io/api/badge/repositories/5647" alt="zhimin-dev/iptv-checker | Trendshift" width="250" height="55" /></a>

  <br/><br/>
  <img src="https://github.com/zhimin-dev/iptv-checker/blob/main/web-snapshot.png" alt="Web 界面截图" width="80%" />
</div>

## 📖 目录

- [介绍](#介绍)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
  - [Docker](#docker)
  - [Docker Compose](#docker-compose)
  - [CLI / 二进制文件](#cli--二进制文件)
- [配置](#配置)
  - [GitHub Token](#github-token)
- [更新日志](#更新日志)
- [开源协议](#开源协议)
- [联系](#联系)

## 介绍

IPTV Checker 是一款高性能的 IPTV 播放列表检测工具，支持 Docker 部署和命令行两种使用方式。它可以帮助你快速验证 M3U / M3U8 / TXT 格式的播放列表中的频道是否可用。

**适用场景：**

- 定期检测 IPTV 源的有效性，过滤失效链接
- 通过 Web 管理界面对检测任务进行可视化管理和配置
- 批量导出可用的 IPv4 / IPv6 频道列表
- 在 CI/CD 流程中自动化检测播放列表质量

## 功能特性

- 🚀 **多种部署方式**：Docker、Docker Compose、CLI 二进制文件，灵活选择
- 🌐 **Web 管理后台**：直观的 Web 界面，支持任务管理、配置编辑、结果导出
- 🔍 **多种检测方式**：HTTP 检测 + FFmpeg 强制检测，结果更准确
- 📋 **后台任务系统**：支持并发检测、定时任务、任务导入导出
- 📊 **灵活导出**：支持 M3U / TXT 格式导出，可按 IPv4 / IPv6 分别输出
- 🎨 **深色模式**：内置深色主题，保护眼睛
- 🔄 **EPG 支持**：支持电子节目单（EPG）配置与管理
- 📡 **多格式兼容**：支持 M3U、M3U8、TXT 播放列表文件
- 🏷️ **频道名智能匹配**：解析时自动通过 EPG 数据规范化 tvg-name/tvg-id，去除 4K 等质量后缀
- 📺 **频道名显示模式**：支持在频道名后追加分辨率标签（HD/FHD）或数值（720p/1080p），多分辨率标记 *
- 📁 **频道分组映射**：本地维护 tvg-name 与 group-title 的映射关系，支持 EPG 未映射频道快速匹配
- 🔧 **高度可配置**：超时时间、自定义排序、关键词匹配、网速最快筛选

## 快速开始

### Docker

```bash
# 拉取镜像
docker pull zmisgod/iptvchecker

# 启动容器
docker run -d \
  -p 8081:8089 \
  --name iptv-checker \
  zmisgod/iptvchecker
```

启动后访问 [http://127.0.0.1:8081](http://127.0.0.1:8081) 即可进入管理界面。

> 镜像托管在 [Docker Hub](https://hub.docker.com/r/zmisgod/iptvchecker)，可查看所有可用 tag。

### Docker Compose

创建 `docker-compose.yaml`：

```yaml
version: "3"
services:
  iptv-checker:
    image: zmisgod/iptvchecker
    ports:
      - "8081:8089"
    restart: always
```

```bash
docker-compose up -d
```

### CLI / 二进制文件

前往 [GitHub Releases](https://github.com/zhimin-dev/iptv-checker/releases) 下载对应平台的二进制文件，在命令行中直接运行。

## 配置

### GitHub Token

GitHub API 对未认证请求有严格的频率限制（60 次/小时），配置 token 后可提升至 5000 次/小时。

**申请步骤：**

1. 登录 GitHub，访问 **[github.com/settings/tokens](https://github.com/settings/tokens)**
2. 点击 **Generate new token** → 选择 **Fine-grained token**（推荐）
3. 配置权限（最小化原则）：
   - **Expiration**：自定义过期时间
   - **Repository access**：选择 `Public repositories (read-only)`
   - **Permissions**：`Contents` → `Read-only`
4. 生成后复制 token，打开 Web 管理后台 → 系统配置 → 基础配置，填入 `github_token` 字段

> 保存时系统会自动调用 GitHub API 验证 token 有效性。

**请求策略：**

| 场景 | 行为 |
| --- | --- |
| 已配置有效 token | 使用认证 API（5000 次/时） |
| 未配置 token | 优先尝试 API，触发限流后自动降级为 HTML 解析 |
| token 无效 | 保存时拒绝并提示错误 |

## 更新日志

详见 [CHANGELOG.md](https://github.com/zhimin-dev/iptv-checker/blob/main/CHANGELOG.md)。

### 最近更新

- **5.0.1** — 播放器统一频道列表（已检查 + 已收藏合并、「已收藏」分组筛选）、播放介绍去掉安卓信息、版本信息移至捐赠页、死代码清理（警告 75→6）、player 自动打包 CI
- **5.0.0** — 频道图标自动取数（favourite-channel + 检查任务源数据）、定时任务卡死修复与并发执行、立即执行按钮按下次运行时间显示、频道画面相对时间角标、播放器网格固定宽度
- **4.7.1** — 修复 bool 字段类型校验 400 错误、`x-tvg-url` 缺失、`no_check` + `video_quality` 组合 Bug、URL 空格过滤等 7 项修复
- **4.7.0** — 网络配置独立、EPG 管理（源/同步/缓存）、频道分组映射、配置导入导出、SSRF 安全防护

[查看完整更新日志 →](https://github.com/zhimin-dev/iptv-checker/blob/main/CHANGELOG.md)

## 开源协议

本项目基于 [MIT License](https://github.com/zhimin-dev/iptv-checker/blob/main/LICENSE) 开源。

## 联系

- 博客：[知敏博客](https://zmis.me/user/zmisgod)
- 问题反馈：[GitHub Issues](https://github.com/zhimin-dev/iptv-checker/issues)
- 讨论交流：[Discord](https://discord.gg/vPTv6UUA)
