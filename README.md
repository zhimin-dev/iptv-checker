<img alt="iptv-checker" src="https://github.com/zhimin-dev/iptv-checker-web/blob/main/src/assets/icon.png" height=80>

# iptv-checker

本项目拆成2个项目

- 前端[iptv-checker-web:v3.2.1](https://github.com/zhimin-dev/iptv-checker-web),提供iptv-checker后台页面
- 后端[iptv-checker-rs:v3.2.1](https://github.com/zhimin-dev/iptv-checker-rs),提供iptv的cmd命令以及web api

## docker本地打包

先将下面3个项目clone到本地(比如放在node文件夹下)，下面为文件夹目录示例

- node
  - iptv-checker
  - iptv-checker-web
  - iptv-checker-rs

```bash
# 进入node文件夹
cd node

# 执行build
docker build -f iptv-checker/dockerfile -t ipserver .

# 运行
docker run -d -p 8081:8089 --name myIp ipserver  

# 或者指定端口（本次指定端口为 10001，下面2个10001的地方都需要改动）、输出文件映射本地目录
docker run -d -p 8081:10001 -e WEB_PORT=10001 -v ~/icStatic/output:/app/static/output  --name myIp ipserver
```

### Docker官方包使用方法

[DockerHub](https://hub.docker.com/r/zmisgod/iptvchecker)

按照下面的命令运行docker版本的iptv-checker

```bash
docker pull zmisgod/iptvchecker
docker run -d -p 8081:8089 --name myIp zmisgod/iptvchecker
```

再打开浏览器访问`http://127.0.0.1:8081/`即可

### Docker本地打多平台包方法

```bash
docker buildx create --name mybuilder
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t zmisgod/iptvchecker:latest --push -f iptv-checker/dockerfile . 
```

### Docker-Compose 部署

```bash
docker-compose up -d
```

## 更新日志

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
