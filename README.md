<img alt="iptv-checker" src="https://github.com/zhimin-dev/iptv-checker/blob/main/icon.png" height=80>

[中文版本](cn.md)

## iptv-checker

IPTV checker tool for Docker && Desktop && CMD, check your playlist is available

- For container versions, go to the [docker hub](https://hub.docker.com/r/zmisgod/iptvchecker) page to find the relevant commands

- In command-line mode, go to [GitHub's release page](https://github.com/zhimin-dev/iptv-checker/releases) and look for the download file with a version number that starts with `v`(default version)

- For the desktop version, please go to [GitHub's release page](https://github.com/zhimin-dev/iptv-checker/releases) and look for the download file with a version number that starts with `d`(means desktop)

### Docker Official Package Usage

[DockerHub](https://hub.docker.com/r/zmisgod/iptvchecker)

Run the docker version of iptv-checker with the following commands

```bash
docker pull zmisgod/iptvchecker

docker run -d -p 8081:8089 --name myIp zmisgod/iptvchecker

# Alternatively, specify the port (this time specifying the port as 10001, you need to change the two 10001 places below), output file mapping to local directory
docker run -d -p 8081:10001 -e WEB_PORT=10001 -v ~/icStatic/output:/app/static/output  --name myIp ipserver
```

Then open your browser and visit `http://127.0.0.1:8081/`.

### Docker-Compose Deployment

```bash
docker-compose up -d
```

### frequently asked questions

- If the file is corrupted after the macos is installed, type `xattr -cr /Applications/iptv-checker-desktop.app` to solve the problem

## Changelog

- v4.0.4
  - upgrade tauri 1.0 to 2.0
  - The online playback supports full screen and shows the correct position
- v4.0.3
  - fixed the issue that it could not be played on the Windows platform
- v4.0.1
  - Bug Fixes
    - Issue with the source input box not recognizing data
    - Desktop version details page unable to drag issue
    - Optimized online viewing experience on the desktop version details page
    - Entering details page through public subscription source menu after checking data would show the last state of the check settings menu
    - Fixed issue with source detection not being able to pause and check failure
  - Background tasks support export and import
  - Background tasks added option to not check tasks
- v4.0.0
  - UI Update
  - Support for Windows, macOS, and Linux desktop clients
- v3.2.1
  - Background tasks support concurrency and sorting settings
  - Optimized task list download interface
  - Fixed issue with smart box parsing data incorrectly
- v3.2.0
  - Support for keyword matching
  - Support for timeout configuration
- v3.1.1
  - Fixed issue with increased CPU usage after background checks
- v3.1.0
  - Support for task editing
  - Support for immediate task execution
- v3.0.0
  - Support for background checking

## Contact

[My blog](https://zmis.me/user/zmisgod)
