# GitHub 仓库设置指南

## 快速开始

### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写仓库信息：
   - **Repository name**: `btc-signals` (或你喜欢的名字)
   - **Description**: BTC 抄底信号体系 - 基于链上数据的多维度比特币底部识别系统
   - **Visibility**: Public (推荐，方便 GitHub Pages 部署)
   - 勾选 `Add a README file`
4. 点击 `Create repository`

### 2. 推送代码到 GitHub

```bash
# 在本地项目目录中执行

# 初始化 git 仓库
git init

# 添加远程仓库（替换 yourusername 为你的 GitHub 用户名）
git remote add origin https://github.com/yourusername/btc-signals.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: BTC Signals Dashboard"

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库的 `Settings` 页面
2. 左侧菜单点击 `Pages`
3. **Source** 选择 `GitHub Actions`
4. 保存设置

### 4. 自动部署

项目已配置 GitHub Actions，每次推送到 `main` 分支或每6小时会自动：
1. 获取最新 BTC 数据
2. 构建项目
3. 部署到 GitHub Pages

访问地址：`https://yourusername.github.io/btc-signals`

## 手动触发部署

1. 进入仓库的 `Actions` 页面
2. 选择 `Deploy to GitHub Pages` 工作流
3. 点击 `Run workflow`

## 更新数据

### 方式一：等待自动更新
- 每6小时自动获取最新数据并重新部署

### 方式二：手动触发
- 在 GitHub Actions 页面手动运行工作流

### 方式三：推送更新
```bash
# 修改任意文件后推送
git add .
git commit -m "Update data"
git push
```

## 自定义配置

### 修改刷新间隔

编辑 `.github/workflows/deploy.yml`：

```yaml
schedule:
  # 每6小时 (格式: 分钟 小时 日 月 星期)
  - cron: '0 */6 * * *'
```

常用 cron 表达式：
- 每小时：`0 * * * *`
- 每6小时：`0 */6 * * *`
- 每天午夜：`0 0 * * *`
- 每周一：`0 0 * * 1`

### 修改触发阈值

编辑 `src/App.tsx` 中的信号配置。

## 故障排除

### 部署失败

1. 检查 `Settings` → `Pages` → Source 是否为 `GitHub Actions`
2. 检查 `Settings` → `Actions` → `General` → Workflow permissions 是否允许读写
3. 查看 Actions 日志排查错误

### 数据不更新

1. 检查 API 是否可用
2. 查看 Actions 日志中的数据获取步骤
3. 手动运行工作流测试

## 项目结构

```
btc-signals/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── scripts/
│   └── fetch-data.js           # 数据获取脚本
├── src/                        # 源代码
├── .gitignore                  # Git 忽略文件
├── CONTRIBUTING.md             # 贡献指南
├── GITHUB_SETUP.md             # 本文件
├── LICENSE                     # MIT 许可证
├── README.md                   # 项目说明
├── index.html                  # HTML 入口
├── package.json                # 依赖配置
├── server.js                   # 开发服务器
├── vite.config.ts              # Vite 配置
└── tailwind.config.js          # Tailwind 配置
```

## 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Cron 表达式生成器](https://crontab.guru/)
