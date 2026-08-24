import React from 'react'
import type { BeforeAfterData, CurrencySettings, ProposalSlide } from '../../../types'
import type { ZetaTheme } from '../../../styles/theme'
import { convertedItemAmount, formatMoney } from '../../../services/currencyService'
import { defaultCurrencySettings } from '../../../types'

interface Props {
  slide: ProposalSlide<BeforeAfterData>
  theme: ZetaTheme
  currencySettings?: CurrencySettings
}

/**
 * 模板B｜左右卡片對照版：完全不使用圖表，改用單一合併明細列表逐項比對金額，
 * 上方為左右兩張大型總額卡片，資訊密度高、適合資產項目多的情境。
 * 與模板A（雙圓餅圖）在圖表有無、版面結構、閱讀順序上都明顯不同。
 * 所有加總與比對都先換算成統一顯示幣別，避免不同幣別的資產直接相減比較。
 */
export function BeforeAfterSideCards({ slide, theme, currencySettings }: Props) {
  const d = slide.data
  const settings = currencySettings ?? defaultCurrencySettings()
  const fmt = (v: number) => formatMoney(v, settings.primaryDisplayCurrency)

  const beforeVisible = d.beforeItems.filter((i) => i.visible)
  const afterVisible = d.afterItems.filter((i) => i.visible)
  const beforeTotal = beforeVisible.reduce((s, i) => s + Math.max(0, convertedItemAmount(i, settings)), 0)
  const afterTotal = afterVisible.reduce((s, i) => s + Math.max(0, convertedItemAmount(i, settings)), 0)

  // 合併雙方項目名稱，逐列比對（找不到對應項目時金額視為0）；金額一律用換算後的顯示幣別數值
  const names = Array.from(new Set([...beforeVisible.map((i) => i.name), ...afterVisible.map((i) => i.name)]))
  const rows = names.map((name) => {
    const before = beforeVisible.find((i) => i.name === name)
    const after = afterVisible.find((i) => i.name === name)
    const beforeAmt = before ? convertedItemAmount(before, settings) : 0
    const afterAmt = after ? convertedItemAmount(after, settings) : 0
    return { name, beforeAmt, afterAmt, delta: afterAmt - beforeAmt, color: (after ?? before)?.color ?? theme.gold }
  })

  return (
    <div className="w-full h-full p-[4%] flex flex-col" style={{ backgroundColor: theme.bgPrimary }}>
      <h2 className="text-2xl font-bold mb-1" style={{ color: theme.navy }}>{d.heading || 'Before & After'}</h2>
      <div className="w-16 h-[3px] mb-3" style={{ backgroundColor: theme.gold }} />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-card p-3 text-white" style={{ backgroundColor: theme.navy }}>
          <div className="text-[10px] opacity-70">{d.beforeLabel}總額</div>
          <div className="text-xl font-bold" style={{ color: theme.gold }}>{fmt(beforeTotal)}</div>
        </div>
        <div className="rounded-card p-3" style={{ backgroundColor: theme.gold }}>
          <div className="text-[10px] text-zeta-navy/70">{d.afterLabel}總額</div>
          <div className="text-xl font-bold" style={{ color: theme.navy }}>{fmt(afterTotal)}</div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-card shadow-soft overflow-hidden flex flex-col">
        <div className="grid grid-cols-4 text-[11px] font-semibold px-3 py-2" style={{ backgroundColor: theme.navy, color: theme.white }}>
          <span>項目</span>
          <span className="text-right">{d.beforeLabel}</span>
          <span className="text-right">{d.afterLabel}</span>
          <span className="text-right">差額</span>
        </div>
        <div className="flex-1 overflow-hidden text-xs divide-y divide-zeta-bg">
          {rows.length === 0 ? (
            <div className="p-4 text-center text-zeta-text/40">尚無資產項目</div>
          ) : (
            rows.map((r) => (
              <div key={r.name} className="grid grid-cols-4 px-3 py-1.5 items-center">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  {r.name}
                </span>
                <span className="text-right text-zeta-text/70">{fmt(r.beforeAmt)}</span>
                <span className="text-right font-medium" style={{ color: theme.navy }}>{fmt(r.afterAmt)}</span>
                <span className="text-right font-semibold" style={{ color: r.delta >= 0 ? theme.positive : theme.danger }}>
                  {r.delta >= 0 ? '+' : ''}{fmt(r.delta)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 text-xs">
        <span className="font-semibold" style={{ color: theme.navy }}>差額說明：　</span>
        <span className="text-zeta-text/70">{d.differenceNote || '（尚未填寫用途說明）'}</span>
      </div>
    </div>
  )
}
