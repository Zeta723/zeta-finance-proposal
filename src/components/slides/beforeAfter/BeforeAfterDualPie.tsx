import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useIsExportRender } from '../../../export/ExportRenderContext'
import type { AssetItem, BeforeAfterData, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { currencyLabel } from '../../../export/pptxHelpers'
import { ArrowRight } from 'lucide-react'
import { sumVisible } from './BeforeAfterSlide'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
}

function Side({ label, items, total, theme, currency, custom }: { label: string; items: AssetItem[]; total: number; theme: ZetaTheme; currency: BeforeAfterData['currency']; custom?: string }) {
  const visible = items.filter((i) => i.visible)
  const fmt = (v: number) => `${currencyLabel(currency, custom)}${v.toLocaleString('zh-Hant-TW')}`
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
                <Pie data={visible} dataKey="amount" nameKey="name" innerRadius="55%" outerRadius="90%" isAnimationActive={!useIsExportRender()}>
                  {visible.map((it, i) => <Cell key={i} fill={it.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 text-xs space-y-1 min-w-0">
            {visible.map((it) => {
              const pct = ((Math.max(0, it.amount) / total) * 100).toFixed(1)
              return (
                <div key={it.id} className="flex items-center gap-1 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: it.color }} />
                  <span className="truncate">{it.name} {fmt(it.amount)}（{pct}%）</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="text-sm font-bold mt-2" style={{ color: theme.navy }}>總計 {fmt(total)}</div>
    </div>
  )
}

/** 模板A｜雙圓餅圖對照版：左右並排兩個環形圖，中央金色箭頭連接 */
export function BeforeAfterDualPie({ slide, theme }: Props) {
  const d = slide.data
  const beforeTotal = sumVisible(d.beforeItems)
  const afterTotal = sumVisible(d.afterItems)
  const diff = afterTotal - beforeTotal
  const diffLabel = diff === 0 ? '配置金額一致' : diff > 0 ? `增加 ${currencyLabel(d.currency, d.customCurrencyLabel)}${diff.toLocaleString('zh-Hant-TW')}` : `減少 ${currencyLabel(d.currency, d.customCurrencyLabel)}${Math.abs(diff).toLocaleString('zh-Hant-TW')}`

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-2xl font-bold mb-1" style={{ color: theme.navy }}>{d.heading || 'Before & After'}</h2>
      <div className="w-16 h-[3px] mb-4" style={{ backgroundColor: theme.gold }} />
      <div className="flex-1 flex items-stretch gap-3">
        <Side label={d.beforeLabel} items={d.beforeItems} total={beforeTotal} theme={theme} currency={d.currency} custom={d.customCurrencyLabel} />
        <div className="flex items-center justify-center w-10 shrink-0">
          <ArrowRight style={{ color: theme.gold }} />
        </div>
        <Side label={d.afterLabel} items={d.afterItems} total={afterTotal} theme={theme} currency={d.currency} custom={d.customCurrencyLabel} />
      </div>
      <div className="mt-3 text-xs">
        <span className="font-semibold" style={{ color: theme.navy }}>差額說明：{diffLabel}　</span>
        <span className="text-zeta-text/70">{d.differenceNote || '（尚未填寫用途說明）'}</span>
      </div>
    </div>
  )
}
