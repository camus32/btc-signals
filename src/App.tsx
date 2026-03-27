import { useState, useEffect, useCallback } from 'react';
import { SignalCard } from '@/components/custom/SignalCard';
import { Bitcoin, TrendingDown, Activity, BarChart3, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Signal {
  id: string;
  name: string;
  description: string;
  threshold: string;
  currentValue: string;
  displayValue: string;
  isTriggered: boolean;
  icon: 'fear' | 'mvrv' | 'lth' | 'nupl' | 'puell';
  date: string;
  btcPrice?: number;
  realizedPrice?: number;
}

interface Summary {
  triggeredCount: number;
  totalSignals: number;
  btcPrice: number;
  realizedPrice: number;
  lthDistance: number;
  lastUpdated: string;
}

interface BTCData {
  signals: Signal[];
  summary: Summary;
}

function App() {
  const [data, setData] = useState<BTCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLastRefresh] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(300); // 5分钟 = 300秒

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // 从静态 JSON 文件获取数据
      const response = await fetch('./btc-data.json?t=' + Date.now());
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const newData = await response.json();
      setData(newData);
      setLastRefresh(new Date());
      setCountdown(300); // 重置倒计时
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新 - 每5分钟
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5分钟

    return () => clearInterval(interval);
  }, [fetchData]);

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggeredCount = data?.summary.triggeredCount || 0;
  const totalSignals = data?.summary.totalSignals || 5;
  const progressPercent = (triggeredCount / totalSignals) * 100;
  const btcPrice = data?.summary.btcPrice || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Bitcoin className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              BTC 抄底信号体系
            </h1>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            基于链上数据和市场情绪的多维度比特币底部识别系统
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            数据自动刷新 | 实时更新
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Button
            onClick={fetchData}
            disabled={loading}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            立即刷新
          </Button>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>下次刷新: {formatCountdown(countdown)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-400 text-center">
            数据获取失败: {error}
          </div>
        )}

        {/* BTC Price Display */}
        {btcPrice > 0 && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
              <Bitcoin className="w-6 h-6 text-amber-400" />
              <span className="text-zinc-400">BTC 当前价格</span>
              <span className="text-2xl font-bold text-white">${btcPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <Card className="mb-10 p-6 bg-gradient-to-r from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                    className={triggeredCount >= 3 ? 'text-emerald-500' : triggeredCount >= 1 ? 'text-amber-500' : 'text-rose-500'}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{triggeredCount}/{totalSignals}</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">信号触发进度</h2>
                <p className="text-zinc-400">
                  当前已触发 <span className={triggeredCount > 0 ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>{triggeredCount}</span> 个信号
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-zinc-500 mb-1">抄底建议</div>
                <div className={`text-lg font-semibold ${
                  triggeredCount >= 4 ? 'text-emerald-400' : 
                  triggeredCount >= 2 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {triggeredCount >= 4 ? '强烈建议抄底' : 
                   triggeredCount >= 2 ? '谨慎观望' : '继续等待'}
                </div>
              </div>
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center
                ${triggeredCount >= 4 ? 'bg-emerald-500/20 text-emerald-400' : 
                  triggeredCount >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}
              `}>
                {triggeredCount >= 4 ? <TrendingDown className="w-7 h-7" /> : 
                 triggeredCount >= 2 ? <Activity className="w-7 h-7" /> : <BarChart3 className="w-7 h-7" />}
              </div>
            </div>
          </div>
        </Card>

        {/* Signal Cards Grid */}
        {loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6 bg-zinc-900/50 border-zinc-800 animate-pulse">
                <div className="h-12 w-12 bg-zinc-800 rounded-xl mb-4" />
                <div className="h-6 bg-zinc-800 rounded w-3/4 mb-3" />
                <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.signals.map((signal) => (
              <SignalCard
                key={signal.id}
                name={signal.name}
                description={signal.description}
                threshold={signal.threshold}
                currentValue={signal.displayValue}
                isTriggered={signal.isTriggered}
                icon={signal.icon}
                date={signal.date}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            指标说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
            <div className="space-y-2">
              <p><span className="text-emerald-400 font-medium">✓ 已触发</span> - 该指标已达到抄底条件</p>
              <p><span className="text-rose-400 font-medium">✗ 未触发</span> - 该指标尚未达到抄底条件</p>
            </div>
            <div className="space-y-2">
              <p><span className="text-amber-400 font-medium">恐惧贪婪</span> - Alternative.me 市场情绪指数</p>
              <p><span className="text-amber-400 font-medium">MVRV / NUPL / Puell</span> - 链上数据分析指标</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-zinc-500 text-sm">
          <p>数据仅供参考，不构成投资建议 | 加密货币投资有风险</p>
          <p className="mt-2">
            数据来源: Alternative.me, BGeometrics, Mempool.space
          </p>
          <p className="mt-1">
            最后更新: {data?.summary.lastUpdated ? new Date(data.summary.lastUpdated).toLocaleString('zh-CN') : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
