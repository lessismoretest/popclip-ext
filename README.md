# PopClip 扩展合集

一组面向 macOS 的 [PopClip](https://www.popclip.app/) 扩展，共 20 个，覆盖常用搜索、文本工具、终端命令、跨应用发送、地图与公司查询。扩展都在本机运行：搜索类只打开对应网站，脚本类通过 AppleScript 或本机 API 操作目标应用。

## 安装

1. 安装 [PopClip](https://www.popclip.app/)。本仓库扩展在 PopClip 2026.8.1 上使用。
2. 下载或克隆本仓库。
3. 双击 `*.popclipext` 目录或 `*.popclipextz` 文件，按 PopClip 提示安装。
4. 首次使用脚本类扩展时，如果弹出权限提示，前往「系统设置 → 隐私与安全性 → 辅助功能」，允许 PopClip 控制电脑。

## 扩展一览

### 搜索

| 扩展 | 搜索目标 |
| --- | --- |
| `Google搜索` | [Google](https://www.google.com/) 网页搜索 |
| `YouTube搜索` | [YouTube](https://www.youtube.com/) 视频搜索 |
| `百度搜索` | [百度](https://www.baidu.com/) 网页搜索 |
| `知乎搜索` | [知乎](https://www.zhihu.com/) 内容搜索 |
| `哔哩哔哩搜索` | [哔哩哔哩](https://www.bilibili.com/) 全站搜索 |
| `抖音搜索` | [抖音](https://www.douyin.com/) 站内搜索 |
| `小红书搜索` | [小红书](https://www.xiaohongshu.com/) 站内搜索 |

### 文本工具

| 扩展 | 功能 |
| --- | --- |
| `字数统计` | 在 PopClip 中显示选中文本的字符数；点击后显示总字数、中文、英文、单词和句子数量。 |
| `颜色预览` | 识别 `#RRGGBB`、`#RGB`、`rgb()`、`rgba()`、`hsl()`，用对应颜色作为图标；点击复制原文。 |

### 终端

| 扩展 | 功能 |
| --- | --- |
| `在终端运行` | 将选中文字作为命令在 Terminal 中执行。 |
| `在Ghostty运行` | 新开一个 Ghostty 实例执行选中文字。 |

这两个扩展会直接执行选中内容，没有二次确认，只对确认安全的命令使用。

### 发送到应用

| 扩展 | 功能 |
| --- | --- |
| `发送到ChatGPT` | 在 ChatGPT 桌面版中新建聊天，粘贴并发送选中文字。 |
| `发送到Telegram` | 打开 Telegram，搜索目标联系人或 Bot，粘贴并发送选中文字。 |
| `发送到Hermes` | 发送到本机 Hermes 桌面版的固定会话「PopClip 快捷发送」。 |

发送类扩展会临时使用剪贴板，发送完成后恢复原内容。

### 地址与公司

以下扩展会根据选中文字自动判断，不符合条件时不会出现在 PopClip 菜单中。

| 扩展 | 触发条件 | 动作 |
| --- | --- | --- |
| `百度地图` | 选中文字像地址 | 用百度地图搜索 |
| `高德地图` | 选中文字像地址 | 用高德地图搜索 |
| `天眼查` | 选中文字像公司名 | 用天眼查搜索 |
| `BOSS直聘` | 选中文字像公司名 | 用 BOSS 直聘搜索职位 |
| `脉脉` | 选中文字像公司名 | 用脉脉搜索 |

### Obsidian

`Obsidian.popclipextz` 将选中文本追加到 Obsidian。默认写入 Daily Note，也可以指定文件、标题，附带来源链接和时间戳。需要安装并启用 [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri) 社区插件，并在扩展设置中填写 Vault 名称。

## 特殊配置

### 辅助功能权限

`发送到ChatGPT`、`发送到Telegram`、`发送到Hermes` 需要通过 System Events 模拟粘贴和回车，必须在「系统设置 → 隐私与安全性 → 辅助功能」中允许 PopClip（以及 osascript）。缺少权限时，扩展会弹出提示并打开对应设置页。

### Telegram

在扩展设置中填写「目标联系人（用户名）」，默认 `xiaolin_clawdbot`，可以带或不带 `@`。扩展会用 `⌘K` 搜索该用户名并发送，请确保目标会话能在 Telegram 搜索结果中找到。

### Hermes

需要满足以下条件：

- 本机运行 Hermes 桌面版，并开启本地 API 服务（默认 `http://127.0.0.1:8642`）。
- `~/.hermes/.env` 中存在 `API_SERVER_KEY`。
- 安装 `jq`（脚本调用 `/usr/bin/jq`，若你的 jq 在其他路径，需要同步修改脚本）。

首次发送会自动创建标题为「PopClip 快捷发送」的会话，并把会话 ID 记录到 `~/Library/Application Support/PopClipHermes/session-id`；之后复用同一会话。会话不存在时会按标题重新查找或新建。

### 地图与公司识别

`百度地图`、`高德地图`、`天眼查`、`BOSS直聘`、`脉脉` 使用 `Config.js` 中的规则判断选中文字。地址规则匹配省、市、区、道路、门牌、建筑等组合；公司规则匹配「有限公司」「集团」等后缀、常见公司别名和行业关键词。规则都在对应 `Config.js` 中，可按需增删。

## 自定义

- 搜索类扩展在 `Config.yaml` 中用 `***` 表示选中文字，`clean query: true` 会先清理首尾空白。
- 脚本类扩展从环境变量 `POPCLIP_TEXT` 读取选中文字；Telegram 的目标用户名来自 `POPCLIP_OPTION_TARGETUSERNAME`。
- 所有扩展标识符使用 `com.lessismore.popclip.*`。如果基于本仓库二次分发，建议改成自己的标识符，避免与已安装版本冲突。
- 修改后重新双击扩展目录即可覆盖安装。

## 许可证

本项目采用 [MIT](LICENSE) 许可证。部分扩展来自或基于第三方项目（例如 `Obsidian.popclipextz`），相关部分仍遵循其原始许可证与署名要求。
