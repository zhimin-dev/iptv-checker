<img alt="iptv-checker" src="https://github.com/zhimin-dev/iptv-checker-web/blob/main/src/assets/icon.png" height=80>

[中文版本](https://github.com/zhimin-dev/iptv-checker/blob/main/cn.md)

# iptv-checker

This project is split into 2 projects

- Frontend [iptv-checker-web:v4.0.1](https://github.com/zhimin-dev/iptv-checker-web), providing the backend page for iptv-checker
- Backend [iptv-checker-rs:v4.0.1](https://github.com/zhimin-dev/iptv-checker-rs), providing cmd commands and web API for IPTV

## Docker Local Packaging

First, clone the following 3 projects to your local machine (for example, place them in a node folder). Below is an example of the folder structure.

- node
  - iptv-checker
  - iptv-checker-web
  - iptv-checker-rs

```bash
# Enter the node folder
cd node

# Execute build
docker build -f iptv-checker/dockerfile -t ipserver .

# Run
docker run -d -p 8081:8089 --name myIp ipserver  

# Alternatively, specify the port (this time specifying the port as 10001, you need to change the two 10001 places below), output file mapping to local directory
docker run -d -p 8081:10001 -e WEB_PORT=10001 -v ~/icStatic/output:/app/static/output  --name myIp ipserver
```

### Docker Official Package Usage

[DockerHub](https://hub.docker.com/r/zmisgod/iptvchecker)

Run the docker version of iptv-checker with the following commands

```bash
docker pull zmisgod/iptvchecker
docker run -d -p 8081:8089 --name myIp zmisgod/iptvchecker
```

Then open your browser and visit `http://127.0.0.1:8081/`.

### Docker Local Multi-Platform Package Method

```bash
docker buildx create --name mybuilder
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t zmisgod/iptvchecker:latest --push -f iptv-checker/dockerfile . 
```

### Docker-Compose Deployment

```bash
docker-compose up -d
```

## Changelog

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

[Myblog Blog](https://zmis.me/user/zmisgod)