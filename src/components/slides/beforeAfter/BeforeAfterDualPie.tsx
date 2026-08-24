import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useIsExportRender } from '../../../export/ExportRenderContext'
import type { AssetItem, BeforeAfterData, CurrencySettings, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { convertedItemAmount, formatMoney, formatWithConversion } from '../../../services/currencyService'
import { defaultCurrencySettings } from '../../../types'
import { ArrowRight } from 'lucide-react'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
  currencySettings?: CurrencySettings
}

/** 換算成顯示幣別後加總（不同幣別的資產不能直接相加） */
function convertedTotal(items: AssetItem[], settings: CurrencySettings): number {
  return items.filter((i) => i.visible).reduce((sum, i) => sum + Math.max(0, convertedItemAmount(i, settings)), 0)
}

function Side({ label, items, total, theme, settings }: { label: string; items: AssetItem[]; total: number; theme: ZetaTheme; settings: CurrencySettings }) {
  const visible = items.filter((i) => i.visible)
  // 圖表比例一律用換算後的數值計算，避免不同幣別直接混算
  const chartData = visible.map((it) => ({ ...it, convertedAmount: Math.max(0, convertedItemAmount(it, settings)) }))

  return (
    <div className="bg-white rounded-card shadow-soft p-4 flex-1 flex flex-col">
      <div className="font-semibold mb-2" style={{ color: theme.navy }}>{label}</div>
      {visible.length === 0 || total <= 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-zeta-text/40">尚無資產項目</div>
      ) : (
        <div className="flex-1 flex gap-3 items-center">
          <div className="w-24 h-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="convertedAmount" nameKey="name" innerRadius="55%" outerRadius="90%" isAnimationActive={!useIsExportRender()}>
                  {visible.map((it, i) => <Cell key={i} fill={it.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 text-xs space-y-1 min-w-0">
            {chartData.map((it) => {
              const pct = ((it.convertedAmount / total) * 100).toFixed(1)
              return (
                <div key={it.id} className="flex items-center gap-1 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                  <span className="truncate">{it.name} {formatWithConversion(it.amount, it.currency ?? 'TWD', settings, it.customCurrencyLabel)}（{pct}%）</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="text-sm font-bold mt-2" style={{ color: theme.navy }}>總計 {formatMoney(total, settings.primaryDisplayCurrency)}</div>
    </div>
  )
}

/** 模板A｜雙圓餅圖對照版：左右並排兩個環形圖，中央金色箭頭連接 */
export function BeforeAfterDualPie({ slide, theme, currencySettings }: Props) {
  const d = slide.data
  const settings = currencySettings ?? defaultCurrencySettings()
  const beforeTotal = convertedTotal(d.beforeItems, settings)
  const afterTotal = convertedTotal(d.afterItems, settings)
  const diff = afterTotal - beforeTotal
  const diffLabel =
    diff === 0 ? '配置金額一致' : diff > 0 ? `增加 ${formatMoney(diff, settings.primaryDisplayCurrency)}` : `減少 ${formatMoney(Math.abs(diff), settings.primaryDisplayCurrency)}`

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-2xl font-bold mb-1" style={{ color: theme.navy }}>{d.heading || 'Before & After'}</h2>
      <div className="w-16 h-[3px] mb-4" style={{ backgroundColor: theme.gold }} />
      <div className="flex-1 flex items-stretch gap-3">
        <Side label={d.beforeLabel} items={d.beforeItems} total={beforeTotal} theme={theme} settings={settings} />
        <div className="flex items-center justify-center w-10 shrink-0">
          <ArrowRight style={{ color: theme.gold }} />
        </div>
        <Side label={d.afterLabel} items={d.afterItems} total={afterTotal} theme={theme} settings={settings} />
      </div>
      <div className="mt-3 text-xs">
        <span className="font-semibold" style={{ color: theme.navy }}>差額說明：{diffLabel}　</span>
        <span className="text-zeta-text/70">{d.differenceNote || '（尚未填寫用途說明）'}</span>
      </div>
    </div>
  )
}
