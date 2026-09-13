<div align="center">
  <img src="https://github.com/zhimin-dev/iptv-checker/blob/main/icon.png" width="150" height="150" alt="IPTV Checker logo" />

  <h1>iptv-checker</h1>

  <p><strong>Check if your IPTV playlist is available</strong></p>

  <p>
    <a href="https://discord.gg/vPTv6UUA"><img src="https://img.shields.io/badge/chat-discord-7289da.svg" alt="Discord" /></a>
    <a href="https://hub.docker.com/r/zmisgod/iptvchecker"><img src="https://img.shields.io/docker/pulls/zmisgod/iptvchecker?color=2496ED&logo=docker&label=docker%20pulls" alt="Docker Pulls" /></a>
    <a href="https://github.com/zhimin-dev/iptv-checker/stargazers"><img src="https://img.shields.io/github/stars/zhimin-dev/iptv-checker?color=FFD700&logo=github" alt="Stars" /></a>
    <a href="https://github.com/zhimin-dev/iptv-checker/releases"><img src="https://img.shields.io/github/v/release/zhimin-dev/iptv-checker?color=blue&label=release" alt="Release" /></a>
    <a href="https://github.com/zhimin-dev/iptv-checker/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>
  </p>

  <p>
    <a href="https://github.com/zhimin-dev/iptv-checker/blob/main/README.md">中文</a> / English
  </p>

  <a href="https://trendshift.io/repositories/5647" target="_blank"><img src="https://trendshift.io/api/badge/repositories/5647" alt="zhimin-dev/iptv-checker | Trendshift" width="250" height="55" /></a>

  <br/><br/>
  <img src="https://github.com/zhimin-dev/iptv-checker/blob/main/web-snapshot-en.png" alt="Web UI Screenshot" width="80%" />
</div>

## 📖 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Quick Start](#quick-start)
  - [Docker](#docker)
  - [Docker Compose](#docker-compose)
  - [CLI / Binary](#cli--binary)
- [Configuration](#configuration)
  - [GitHub Token](#github-token)
- [Changelog](#changelog)
- [License](#license)
- [Contact](#contact)

## Introduction

IPTV Checker is a high-performance IPTV playlist validation tool available for both Docker and CLI usage. It helps you quickly verify whether channels in M3U / M3U8 / TXT playlists are accessible.

**Use Cases:**

- Periodically check IPTV source availability and filter out dead links
- Manage and configure check tasks via an intuitive Web admin panel
- Batch export working IPv4 / IPv6 channel lists
- Automate playlist quality checks in CI/CD pipelines

## Features

- 🚀 **Multiple Deployment Options** — Docker, Docker Compose, or standalone CLI binary
- 🌐 **Web Admin Panel** — Intuitive web UI for task management, configuration editing, and result export
- 🔍 **Multiple Check Methods** — HTTP checks + FFmpeg validation for more accurate results
- 📋 **Background Task System** — Concurrent checks, scheduled tasks, import/export support
- 📊 **Flexible Export** — Export as M3U / TXT, with optional IPv4 / IPv6 separation
- 🎨 **Dark Mode** — Built-in dark theme for eye comfort
- 🔄 **EPG Support** — Electronic Program Guide configuration and management
- 📡 **Multi-format Support** — M3U, M3U8, and TXT playlist files
- 🏷️ **Smart Channel Naming** — Auto-normalize tvg-name/tvg-id from EPG data, stripping quality suffixes like "4K"
- 📺 **Channel Name Display Mode** — Append resolution labels (HD/FHD) or numeric values (720p/1080p) to channel names, multi-resolution marked with *
- 📁 **Channel Group Mapping** — Maintain local tvg-name to group-title mappings with EPG-assisted quick matching
- 🔧 **Highly Configurable** — Timeout, custom sorting, keyword matching, fastest network selection

## Quick Start

### Docker

```bash
# Pull the image
docker pull zmisgod/iptvchecker

# Run the container
docker run -d \
  -p 8081:8089 \
  --name iptv-checker \
  zmisgod/iptvchecker
```

Visit [http://127.0.0.1:8081](http://127.0.0.1:8081) to access the admin panel.

> The image is hosted on [Docker Hub](https://hub.docker.com/r/zmisgod/iptvchecker), where you can find all available tags.

### Docker Compose

Create a `docker-compose.yaml`:

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

### CLI / Binary

Download the latest binary for your platform from [GitHub Releases](https://github.com/zhimin-dev/iptv-checker/releases) and run it directly from the command line.

## Configuration

### GitHub Token

GitHub API has strict rate limits for unauthenticated requests (60 req/h). Configuring a token increases the limit to 5000 req/h.

**How to Get a Token:**

1. Log in to GitHub and visit **[github.com/settings/tokens](https://github.com/settings/tokens)**
2. Click **Generate new token** → Select **Fine-grained token** (recommended)
3. Configure permissions (principle of least privilege):
   - **Expiration** — Set a custom expiration date
   - **Repository access** — Select `Public repositories (read-only)`
   - **Permissions** — `Contents` → `Read-only`
4. Copy the generated token, go to Web Admin → System Config → base config, and fill it into the `github_token` field

> The system automatically verifies the token via the GitHub API on save.

**Request Strategy:**

| Scenario | Behavior |
| --- | --- |
| Valid token configured | Uses authenticated API (5000 req/h) |
| No token configured | Tries API first, falls back to HTML parsing on rate limit |
| Invalid token | Rejected on save with error message |

## Changelog

See [CHANGELOG.md](https://github.com/zhimin-dev/iptv-checker/blob/main/CHANGELOG.md) for the full history.

### Recent Updates

- **5.0.1** — Unified player channel list (checked + favourites merged, "favourites" group filter), Android info removed from playback intro, version info moved to donate page, dead code cleanup (warnings 75→6), auto-build CI for player
- **5.0.0** — Auto channel icon collection (favourite-channel + check task sources), scheduled-task hang fix with concurrent execution, "run now" button shown only when next run is >3 minutes away, relative snapshot age badges, fixed-width player grid
- **4.7.0** — EPG channel name auto-matching, resolution suffix display modes, channel group mapping, unified global host management, group mapping import/export support
- **4.6.0** — GitHub scraping migration to REST API, security hardening (SSRF / path traversal fixes), performance optimizations (connection pool reuse, reduced cloning), code quality improvements, 11 bug fixes
- **4.5.1** — Fixed issues with checks not executing, added CLI trigger support
- **4.5.0** — EPG configuration support
- **4.4.0** — Config backup/restore, separate IPv4/IPv6 export

[View full changelog →](https://github.com/zhimin-dev/iptv-checker/blob/main/CHANGELOG.md)

## License

This project is open source under the [MIT License](https://github.com/zhimin-dev/iptv-checker/blob/main/LICENSE).

## Contact

- Blog: [Zhimin's Blog](https://zmis.me/user/zmisgod)
- Issues: [GitHub Issues](https://github.com/zhimin-dev/iptv-checker/issues)
- Chat: [Discord](https://discord.gg/vPTv6UUA)
