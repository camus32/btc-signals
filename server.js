const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 缓存数据
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 获取所有 BTC 指标数据
async function fetchBTCData() {
  const now = Date.now();
  
  // 如果缓存有效，直接返回
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    // 并行获取所有数据
    const [
      fearGreedRes,
      mvrvRes,
      nuplRes,
      puellRes,
      realizedPriceRes,
      btcPriceRes
    ] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1', { timeout: 10000 }),
      fetch('https://bitcoin-data.com/api/v1/mvrv', { timeout: 10000 }),
      fetch('https://bitcoin-data.com/api/v1/nupl', { timeout: 10000 }),
      fetch('https://bitcoin-data.com/api/v1/puell-multiple', { timeout: 10000 }),
      fetch('https://bitcoin-data.com/api/v1/realized-price', { timeout: 10000 }),
      fetch('https://mempool.space/api/v1/prices', { timeout: 10000 })
    ]);

    // 解析数据
    const fearGreedData = await fearGreedRes.json();
    const mvrvData = await mvrvRes.json();
    const nuplData = await nuplRes.json();
    const puellData = await puellRes.json();
    const realizedPriceData = await realizedPriceRes.json();
    const btcPriceData = await btcPriceRes.json();

    // 提取最新值
    const fearGreed = {
      value: parseInt(fearGreedData.data[0].value),
      classification: fearGreedData.data[0].value_classification,
      timestamp: parseInt(fearGreedData.data[0].timestamp)
    };

    const latestMvrv = mvrvData[mvrvData.length - 1];
    const mvrv = {
      value: parseFloat(latestMvrv.mvrv),
      date: latestMvrv.d
    };

    const latestNupl = nuplData[nuplData.length - 1];
    const nupl = {
      value: parseFloat(latestNupl.nupl),
      date: latestNupl.d
    };

    const latestPuell = puellData[puellData.length - 1];
    const puell = {
      value: parseFloat(latestPuell.puellMultiple),
      date: latestPuell.d
    };

    const latestRealizedPrice = realizedPriceData.reduce((max, item) => 
      parseInt(item.unixTs) > parseInt(max.unixTs) ? item : max
    , realizedPriceData[0]);
    const realizedPrice = parseFloat(latestRealizedPrice.realizedPrice);

    const btcPrice = btcPriceData.USD;

    // 计算 LTH Cost 距离
    const lthDistance = ((btcPrice - realizedPrice) / realizedPrice) * 100;

    // 构建信号数据
    const signals = [
      {
        id: 'fear_greed',
        name: '恐惧贪婪指数',
        description: '市场情绪指标，极度恐惧时可能为底部信号',
        threshold: '≤ 10',
        currentValue: fearGreed.value.toString(),
        displayValue: `${fearGreed.value} (${fearGreed.classification})`,
        isTriggered: fearGreed.value <= 10,
        icon: 'fear',
        date: new Date(fearGreed.timestamp * 1000).toISOString().split('T')[0]
      },
      {
        id: 'mvrv',
        name: 'MVRV 比率',
        description: '市值与已实现价值比率，<1 表示被低估',
        threshold: '< 1',
        currentValue: mvrv.value.toFixed(4),
        displayValue: mvrv.value.toFixed(4),
        isTriggered: mvrv.value < 1,
        icon: 'mvrv',
        date: mvrv.date
      },
      {
        id: 'lth_cost',
        name: 'LTH 成本基础',
        description: '长期持有者平均成本，跌破可能形成支撑',
        threshold: `$${realizedPrice.toLocaleString()}`,
        currentValue: `${lthDistance > 0 ? '+' : ''}${lthDistance.toFixed(2)}%`,
        displayValue: `距离 ${lthDistance > 0 ? '+' : ''}${lthDistance.toFixed(2)}%`,
        isTriggered: lthDistance < 0,
        icon: 'lth',
        date: latestRealizedPrice.theDay,
        btcPrice: btcPrice,
        realizedPrice: realizedPrice
      },
      {
        id: 'nupl',
        name: 'NUPL',
        description: '净利润/亏损比率，<0 表示整体亏损',
        threshold: '< 0',
        currentValue: nupl.value.toFixed(4),
        displayValue: nupl.value.toFixed(4),
        isTriggered: nupl.value < 0,
        icon: 'nupl',
        date: nupl.date
      },
      {
        id: 'puell',
        name: 'Puell 倍数',
        description: '矿工收入比率，<0.5 表示矿工收入低迷',
        threshold: '< 0.5',
        currentValue: puell.value.toFixed(4),
        displayValue: puell.value.toFixed(4),
        isTriggered: puell.value < 0.5,
        icon: 'puell',
        date: puell.date
      }
    ];

    const triggeredCount = signals.filter(s => s.isTriggered).length;

    cachedData = {
      signals,
      summary: {
        triggeredCount,
        totalSignals: signals.length,
        btcPrice,
        realizedPrice,
        lthDistance,
        lastUpdated: new Date().toISOString()
      }
    };

    lastFetchTime = now;
    return cachedData;

  } catch (error) {
    console.error('Error fetching BTC data:', error);
    // 如果有缓存数据，返回缓存
    if (cachedData) {
      return cachedData;
    }
    throw error;
  }
}

// API 路由
app.get('/api/btc-signals', async (req, res) => {
  try {
    const data = await fetchBTCData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BTC data', message: error.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`BTC Signals API server running on port ${PORT}`);
});

module.exports = app;
