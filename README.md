# BTC 抄底信号体系 📊

基于链上数据和市场情绪的多维度比特币底部识别系统。

![BTC Signals](https://img.shields.io/badge/BTC-Signals-orange)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 功能特性

### 五大抄底指标

| 指标 | 说明 | 触发条件 |
|------|------|----------|
| 恐惧贪婪指数 | 市场情绪指标 | ≤ 10 |
| MVRV 比率 | 市值与已实现价值比 | < 1 |
| LTH 成本基础 | 长期持有者平均成本 | 价格跌破 |
| NUPL | 净利润/亏损比率 | < 0 |
| Puell 倍数 | 矿工收入比率 | < 0.5 |

### 实时数据

- **自动刷新**: 每5分钟自动获取最新数据
- **倒计时显示**: 显示下次刷新剩余时间
- **手动刷新**: 点击按钮立即更新
- **实时价格**: 显示 BTC 当前价格

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui
- **数据源**:
  - 恐惧贪婪指数: [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/)
  - 链上数据: [BGeometrics](https://bitcoin-data.com/)
  - BTC 价格: [Mempool.space](https://mempool.space/)

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/btc-signals.git
cd btc-signals
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist/` 目录。

## 项目结构

```
btc-signals/
├── src/
│   ├── components/
│   │   ├── custom/
│   │   │   └── SignalCard.tsx    # 信号卡片组件
│   │   └── ui/                    # shadcn/ui 组件
│   ├── App.tsx                    # 主应用
│   ├── index.css                  # 全局样式
│   └── main.tsx                   # 入口文件
├── scripts/
│   └── fetch-data.js              # 数据获取脚本
├── dist/                          # 构建输出
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 数据获取

项目使用以下免费 API 获取实时数据：

```javascript
// 恐惧贪婪指数
GET https://api.alternative.me/fng/?limit=1

// MVRV 比率
GET https://bitcoin-data.com/api/v1/mvrv

// NUPL
GET https://bitcoin-data.com/api/v1/nupl

// Puell 倍数
GET https://bitcoin-data.com/api/v1/puell-multiple

// LTH 成本基础 (Realized Price)
GET https://bitcoin-data.com/api/v1/realized-price

// BTC 当前价格
GET https://mempool.space/api/v1/prices
```

## 部署

### 静态部署

构建时会自动获取最新数据并生成 `btc-data.json`：

```bash
npm run build
```

将 `dist/` 目录部署到任何静态托管服务：
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

### 自动更新

由于静态部署限制，数据每5分钟通过前端自动刷新获取。

## 自定义配置

### 修改触发阈值

编辑 `src/App.tsx` 中的信号配置：

```typescript
{
  id: 'fear_greed',
  threshold: '≤ 10',    // 修改这里
  isTriggered: fearGreed.value <= 10  // 修改判断条件
}
```

### 修改刷新间隔

编辑 `src/App.tsx`：

```typescript
// 自动刷新间隔（毫秒）
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟
```

## 截图

![Dashboard Preview](./screenshot.png)

## 免责声明

⚠️ **风险提示**

- 本工具仅供参考，不构成投资建议
- 加密货币投资有风险，请谨慎决策
- 历史数据不代表未来表现

## License

MIT License © 2024
