import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 简单的 fetch 实现
function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function fetchBTCData() {
  try {
    console.log('Fetching BTC data...');

    // 并行获取所有数据
    const [
      fearGreedRes,
      mvrvRes,
      nuplRes,
      puellRes,
      realizedPriceRes,
      btcPriceRes
    ] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1'),
      fetch('https://bitcoin-data.com/api/v1/mvrv'),
      fetch('https://bitcoin-data.com/api/v1/nupl'),
      fetch('https://bitcoin-data.com/api/v1/puell-multiple'),
      fetch('https://bitcoin-data.com/api/v1/realized-price'),
      fetch('https://mempool.space/api/v1/prices')
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

    const result = {
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

    // 写入文件
    const outputDir = path.join(__dirname, '../dist');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'btc-data.json'),
      JSON.stringify(result, null, 2)
    );

    console.log('BTC data saved successfully!');
    console.log(`Signals triggered: ${triggeredCount}/${signals.length}`);
    console.log(`BTC Price: $${btcPrice.toLocaleString()}`);
    
    return result;

  } catch (error) {
    console.error('Error fetching BTC data:', error);
    process.exit(1);
  }
}

fetchBTCData();
