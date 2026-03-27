import { Check, X, TrendingUp, AlertCircle, DollarSign, Activity, BarChart3, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SignalCardProps {
  name: string;
  description: string;
  threshold: string;
  currentValue: string;
  isTriggered: boolean;
  icon: 'fear' | 'mvrv' | 'lth' | 'nupl' | 'puell';
  date?: string;
}

const iconMap = {
  fear: AlertCircle,
  mvrv: BarChart3,
  lth: DollarSign,
  nupl: TrendingUp,
  puell: Activity,
};

export function SignalCard({ name, description, threshold, currentValue, isTriggered, icon, date }: SignalCardProps) {
  const Icon = iconMap[icon];
  
  return (
    <Card className={`
      relative overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02]
      ${isTriggered 
        ? 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border-emerald-500/30 signal-triggered' 
        : 'bg-gradient-to-br from-rose-950/30 to-rose-900/10 border-rose-500/20 signal-pending'
      }
      border backdrop-blur-sm
    `}>
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
          ${isTriggered 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }
        `}>
          {isTriggered ? (
            <>
              <Check className="w-4 h-4" />
              <span>已触发</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              <span>未触发</span>
            </>
          )}
        </div>
      </div>

      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-4
        ${isTriggered 
          ? 'bg-emerald-500/20 text-emerald-400' 
          : 'bg-rose-500/20 text-rose-400'
        }
      `}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
        
        <div className="pt-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">触发条件</span>
            <span className="text-zinc-300 font-medium">{threshold}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">当前数值</span>
            <span className={`font-bold text-lg ${isTriggered ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentValue}
            </span>
          </div>
        </div>

        {/* Date */}
        {date && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
            <Calendar className="w-3 h-3" />
            <span>数据日期: {date}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isTriggered 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                : 'bg-gradient-to-r from-rose-500 to-rose-400'
            }`}
            style={{ width: isTriggered ? '100%' : '40%' }}
          />
        </div>
      </div>
    </Card>
  );
}
