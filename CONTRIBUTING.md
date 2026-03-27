# 贡献指南

感谢你对 BTC 抄底信号体系的兴趣！

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议，请通过 GitHub Issues 提交：

1. 检查是否已有类似 issue
2. 创建新 issue，描述清楚问题和复现步骤
3. 如果是数据问题，请说明数据源和期望值

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循现有的代码风格
- 添加必要的注释
- 确保 `npm run build` 能成功构建

## 开发流程

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 添加新的信号指标

如果你想添加新的抄底指标：

1. 在 `src/App.tsx` 中的 `signals` 数组添加新指标
2. 在 `scripts/fetch-data.js` 中添加数据获取逻辑
3. 更新 README.md 文档

示例：

```typescript
{
  id: 'new_indicator',
  name: '新指标名称',
  description: '指标说明',
  threshold: '< 1',
  currentValue: value.toString(),
  displayValue: value.toFixed(4),
  isTriggered: value < 1,
  icon: 'new_icon',
  date: new Date().toISOString().split('T')[0]
}
```

## 联系方式

如有问题，欢迎通过 GitHub Issues 讨论。
