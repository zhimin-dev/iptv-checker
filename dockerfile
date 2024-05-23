# 基础镜像（用于构建前端代码）
FROM debian:buster-slim as frontend-builder
# 设置工作目录
WORKDIR /usr/src/app
# 复制前端代码
COPY iptv-checker-web/dist ./frontend

# 后端构建阶段
FROM rust:latest as backend-builder
# 设置工作目录
WORKDIR /usr/src/app
# 复制整个后端项目到容器中
COPY iptv-checker-rs/ .
# 构建最终的后端二进制文件
RUN cargo build --release

# 最终的镜像
FROM ubuntu:latest
# 设置工作目录
WORKDIR /app

RUN apt-get update -y
# RUN apt-get install libc6 openssl libssl-dev build-essential curl -y
RUN apt-get install openssl -y
RUN apt-get install ffmpeg -y

# 复制前端代码
COPY --from=frontend-builder /usr/src/app/frontend ./web
RUN mkdir -p ./static/input
RUN mkdir -p ./static/output
# 复制后端构建结果
COPY --from=backend-builder /usr/src/app/target/release/iptv-checker-rs ./iptv-checker-rs
# 暴露服务端口
ENV WEB_PORT=8089
EXPOSE $WEB_PORT
# 启动服务
CMD ./iptv-checker-rs web --port ${WEB_PORT} --start