# 更新日志

本项目所有重要变更都将记录在此文件中。

## 5.0.1

- **播放器**：去掉「已检查 / 已收藏」双 Tab，改为统一频道列表（已检查 + 已收藏合并去重），顶部「全部」旁增加「已收藏」分组筛选，可直接在列表里取消收藏
- **播放介绍**：移除 Android 电视 / APK 相关内容
- **基础设置**：版本信息（当前版本 / 有新版本）移至「捐赠」页面展示
- **Bug 修复**：修复定时检查配置页（黑名单）`fmtTime is not defined` 报错
- **代码清理**：移除 55 个未使用的函数/结构体（编译器死代码警告 75 → 6），移除 base.json 中从未被读取的 `replace_string` 字段，降低配置导入导出日志噪音
- **CI**：iptv-checker-player 新增 GitHub Action，推送 `v*` tag 自动打包 Windows / Linux / macOS（x64 + arm64）安装包并创建 Release 草稿

## 5.0.0

- **频道图标自动取数**：后台频道图标改为从「爬取的全部频道列表」（`/system/get-favourite-channel?channel_type=all`）与每个检查任务的源数据中自动收集 `tvg-logo`，只补充还没有图标的频道，不覆盖人工配置
- **定时检查任务**：
  - 修复单源检查无硬超时导致任务永久卡住、后续任务不执行的问题（单源检查强制超时 + 运行超 2 小时自动复位 + 到期任务并发执行）
  - 「立即执行」按钮仅在距下一次运行时间超过 3 分钟时展示
- **播放设置-频道画面**：画面角标改为展示距当前时间多久（刚刚 / X 秒前 / X 分钟前 / X 小时前），与桌面客户端逻辑一致
- **播放器**：频道卡片固定宽度，最后一行的卡片宽度与上面各行保持一致，一页至少展示 2 行
- **想看频道**：「包含匹配」「完全匹配」的频道名称改为横排展示，超出屏幕自动换行
- **分组映射**：移除「未映射频道图标」入口

## 4.7.1

- **Bug 修复**：
  - 修复 `fast_sort` 等 bool 字段接收字符串 `"true"`/`"false"` 导致 400 错误的问题
  - 修复创建任务时 URL 前导空格导致后续请求失败的问题
  - 修复 `/tasks/detail` 返回的 M3U 内容缺少 `x-tvg-url` header 的问题
  - 修复 `no_check=true` + `ffmpeg_check=true` + `video_quality` 组合导致所有频道被清空的 Bug
  - 修复 `video_quality` 在 `ffmpeg_check=false` 时被静默忽略、无任何提示的问题
  - 修复 `valid()` 中 `result_name` 校验后的死代码
  - 移除 `SearchOptions.quality` 未使用的字段
- **安全加固**：
  - 所有 `web::Json` 接收结构体中的 bool 字段统一使用灵活反序列化，接受 `true`/`false`/`"true"`/`"false"`/`"1"`/`"0"`

## 4.7.0

- **网络配置独立**：将网络相关配置（proxy、headers、user_agent）从 base.json 分离到 network.json
- **EPG 管理**：
  - 新增 EPG 源配置、同步、缓存管理 API
  - 新增 EPG 频道列表和节目查询 API
  - 支持自定义 EPG XML 生成
- **分组映射**：新增频道分组映射功能，支持未映射频道查询
- **配置导入导出**：支持系统配置的 ZIP 打包导出和导入恢复
- **安全加固**：
  - 新增 SSRF 防护，拦截内网 IP 和危险协议
  - 新增 URL 合法性校验
- **API 新增**：
  - `/system/network-config` — 网络配置管理
  - `/system/epg-config` — EPG 配置管理
  - `/epg/sources`、`/epg/sync`、`/epg/cache` — EPG 源管理
  - `/system/group-mapping` — 分组映射管理
  - `/system/export`、`/system/import` — 配置导入导出

## 4.6.0

- **GitHub 抓取迁移至 REST API**：将 GitHub 仓库文件获取从 HTML 页面解析改为 GitHub REST API（`api.github.com`）
  - `github_token` 配置在 base.json 中，保存时自动验证有效性
  - 未配置 token 时 API 优先，触发限流自动降级为 HTML 页面解析
  - 修复 `extensions` 为空且 `include_files` 非空时无法获取文件的问题
- **安全加固**：
  - 修复 `/system/open-url` 端点 SSRF 漏洞，增加内网 IP 和危险协议拦截
  - 修复 `/media/upload` 端点路径穿越漏洞，文件名增加安全过滤
  - GitHub API 客户端移除 `danger_accept_invalid_certs`，始终验证 TLS 证书
- **性能优化**：
  - 新增共享 HTTP 客户端（`HTTP_CLIENT` / `GITHUB_CLIENT`），复用连接池
  - 修复 `Task::run_inner` 中 15+ 次不必要的 `self.clone()`，改为借用
  - EPG HTML 解析的正则表达式改为静态编译
  - 删除重复的 `get_url_body` 函数
- **代码质量**：
  - 将所有 `println!` / `eprintln!` 迁移至 `log` 宏
  - 清理未使用的导入和依赖（移除 `tempfile` crate）
- **Bug 修复**：
  - 修复 EPG 定时刷新从未执行的问题（`init_epg_data` 漏了 `.await`）
  - 修复任务 panic 后 `is_running` 永久卡在 true 的问题
  - 修复字符串替换默认配置 `" ": ""` 会删除所有空格的问题
  - 修复替换配置保存时错误调用无关初始化函数的问题
  - 修复 `init_search_data` 使用 `.expect()` 导致 panic 的问题
  - 修复 `do_check` 错误返回值被丢弃的问题
  - 修复调度器线程无法优雅退出的问题
  - 修复检查结果计数在去重前计算导致终端显示数量与实际输出不一致的问题
  - 修复 `/q` 端点 host 只从 logos.json 读取，base.json 配置不生效的问题
  - 修复 `/q` 端点 host 为空时仍输出无效 `x-tvg-url` 的问题
  - 修复 gz 解压失败无降级方案的问题（尝试作为原始 XML 处理）
  - 新增默认 EPG 源：`http://epg.51zmt.top:8000/e.xml.gz`

## 4.5.1

- 尝试修复不检查的问题
- 支持 CLI 触发检查

## 4.5.0

- 支持 EPG 配置

## 4.4.0

- 支持配置备份和恢复
- 支持 IPv4、IPv6 结果的单独导出
- 一些问题修复（0203）

## 4.3.0

- 新增台标上传配置
- 修复爬取频道的错误导致服务异常

## 4.2.0

- 新增
  - 想看的频道
  - 设置-爬取配置
  - 特殊字符替换移动到设置菜单下
- Bug 修复
  - 解决繁体转简体无效的 bug

## 4.1.9

- 修复部分缺失的翻译
- 修复任务执行完毕后，没有更新最后更新时间
- 增加「字符替换配置」功能

## 4.1.7

- 修复后台可能不正常执行的 bug
- 本地检测 UI 和后台检测 UI 复用

## 4.1.6

- 已解决 ffmpeg 检查卡顿的问题
- 解决网页刷新后显示不存在的问题

## v4.1.5

- 修复网页 icon 不能正常显示
- 解决部分英文翻译缺失
- 尝试解决 ffmpeg 检测卡顿问题

## v4.1.4

- 新增
  - 增加捐赠入口
  - 后台任务支持仅保留 2 个相同名称
  - 后台任务新增支持 HTTP 检查时 RTMP 等非 HTTP 源，可跳过
- 优化
  - 后台新增任务 UI、逻辑变化，更加符合用户操作逻辑
  - 后台任务列表优化
  - 后台任务删除时，增加弹框提示
- Bug 修复
  - 修复了 ffmpeg 检查导致后台任务无法进行的问题
  - 优化了重命名频道名称导致检查卡住的问题

## 4.1.3

- 修复后台检查失败，导致所有任务无法进行

## 4.1.2

- 去掉节目名称中的一些无用字符，比如 `[HD]` 或者 `123231 [SD]`
- 修复不检查时导出的文件为空的 bug
- CMD 模式搜索频道模式
- 支持强制 ffmpeg 检查，检测结果更加准确

## 4.1.1

- 修复无法解析复杂的 m3u 文件的 bug

## v4.1.0

- [修复 bug 77](https://github.com/zhimin-dev/iptv-checker/issues/77)
- [增加自定义排序](https://github.com/zhimin-dev/iptv-checker/issues/69)
- [支持 txt 文件](https://github.com/zhimin-dev/iptv-checker/issues/74)
- 修复黑夜模式的 UI 样式 bug
- 增加快速检测的页面

## v4.0.4

- 升级 Tauri 2.0
- 在线播放支持全屏并显示正确位置

## v4.0.3

- 修复 Windows 平台无法播放的问题

## v4.0.1

- Bug 修复
  - 检测源输入框无法识别数据问题
  - 桌面版检查详情页无法拖动问题
  - 桌面版检查详情页在线播放体验优化
  - 检查数据后再通过公共订阅源菜单进入检查详情页会出现检查设置菜单还是上一次状态
  - 修复源检测无法暂停、检查失败的问题
- 后台任务支持导出、导入
- 后台任务增加不检查任务

## v4.0.0

- UI 更新
- 支持 Windows、macOS、Linux 桌面端

## v3.2.1

- 后台任务支持并发、排序设置
- 优化任务列表下载界面
- 修复智能框解析数据错误问题

## v3.2.0

- 支持关键词匹配
- 支持超时时间配置

## v3.1.1

- 修复后台检查后 CPU 增高的问题

## v3.1.0

- 支持任务编辑
- 支持任务立即执行

## v3.0.0

- 支持后台检查
