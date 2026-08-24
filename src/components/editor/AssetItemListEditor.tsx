import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import type { AssetItem, ContributionMode } from '../../types'
import { CHART_PALETTE } from '../../styles/theme'
import { newId } from '../../services/idGenerator'
import { BRAND_COLOR_SWATCHES } from '../richtext/RichTextEditor'

interface Props {
  items: AssetItem[]
  onChange: (items: AssetItem[]) => void
  /** 顯示每個項目的投入方式／投入金額／投入年限／幣別／年化報酬率（Before & After 資產項目專用） */
  showInvestmentFields?: boolean
  /** 該側（調整前／調整後）沒有個別設定報酬率時使用的預設值，僅供欄位提示顯示 */
  defaultReturnRate?: number
}

const CONTRIBUTION_LABELS: Record<ContributionMode, string> = {
  lumpSum: '單筆',
  monthly: '每月投入',
  annual: '每年投入'
}

function CurrencySelect({ value, onChange }: { value: AssetItem['currency']; onChange: (v: 'TWD' | 'USD') => void }) {
  return (
    <select
      value={value ?? 'TWD'}
      onChange={(e) => onChange(e.target.value as 'TWD' | 'USD')}
      className="text-xs border border-zeta-bg rounded-md px-1.5 py-1.5 bg-white shrink-0"
    >
      <option value="TWD">TWD</option>
      <option value="USD">USD</option>
    </select>
  )
}

/** 資產項目清單編輯器：新增、刪除、改名、改金額、顯示/隱藏、備註；可選投入方式/年限/幣別/報酬率 */
export function AssetItemListEditor({ items, onChange, showInvestmentFields, defaultReturnRate }: Props) {
  const [advancedOpenId, setAdvancedOpenId] = useState<string | null>(null)

  const update = (id: string, patch: Partial<AssetItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))
  const add = () => {
    const color = CHART_PALETTE[items.length % CHART_PALETTE.length]
    onChange([...items, { id: newId(), name: '新資產項目', amount: 0, color, note: '', visible: true, currency: 'TWD', contributionMode: 'lumpSum' }])
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const mode = item.contributionMode ?? 'lumpSum'
        const advancedOpen = advancedOpenId === item.id
        return (
          <div key={item.id} className="border border-zeta-bg rounded-lg p-2.5 space-y-1.5">
            {/* 第一列：名稱／目前金額／幣別／顯示切換／刪除 */}
            <div className="flex items-center gap-1.5">
              <input
                value={item.name}
                onChange={(e) => update(item.id, { name: e.target.value })}
                className="flex-1 min-w-0 text-sm border border-zeta-bg rounded-md px-2 py-1.5 focus:outline-none focus:border-zeta-gold"
                placeholder="資產名稱"
              />
              <input
                type="number"
                value={item.amount}
                onChange={(e) => update(item.id, { amount: Number(e.target.value) })}
                className="w-24 text-sm border border-zeta-bg rounded-md px-2 py-1.5 text-right focus:outline-none focus:border-zeta-gold"
                placeholder="目前金額"
              />
              {showInvestmentFields && (
                <CurrencySelect value={item.currency} onChange={(v) => update(item.id, { currency: v })} />
              )}
              <button onClick={() => update(item.id, { visible: !item.visible })} className="text-zeta-text/50 hover:text-zeta-navy shrink-0" title={item.visible ? '隱藏此項目' : '顯示此項目'}>
                {item.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button onClick={() => remove(item.id)} className="text-zeta-danger/70 hover:text-zeta-danger shrink-0" title="刪除">
                <Trash2 size={15} />
              </button>
            </div>

            {showInvestmentFields && (
              <>
                {/* 第二列：投入方式，選每月/每年才展開投入金額與年限 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zeta-text/50 shrink-0 w-12">投入方式</span>
                  <div className="flex gap-1 flex-1">
                    {(['lumpSum', 'annual', 'monthly'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => update(item.id, { contributionMode: m })}
                        className={`flex-1 text-[10.5px] px-1 py-1 rounded-md border ${mode === m ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/60'}`}
                      >
                        {CONTRIBUTION_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>

                {mode !== 'lumpSum' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zeta-text/50 shrink-0 w-12">{mode === 'annual' ? '每年投入' : '每月投入'}</span>
                    <input
                      type="number"
                      value={item.periodicAmount ?? 0}
                      onChange={(e) => update(item.id, { periodicAmount: Number(e.target.value) })}
                      className="flex-1 min-w-0 text-xs border border-zeta-bg rounded-md px-2 py-1.5 text-right focus:outline-none focus:border-zeta-gold"
                    />
                    <CurrencySelect value={item.periodicCurrency ?? item.currency} onChange={(v) => update(item.id, { periodicCurrency: v })} />
                    <span className="text-[10px] text-zeta-text/50 shrink-0">投入年限</span>
                    <input
                      type="number"
                      value={item.contributionYears ?? 0}
                      onChange={(e) => update(item.id, { contributionYears: Number(e.target.value) })}
                      className="w-14 text-xs border border-zeta-bg rounded-md px-2 py-1.5 text-right focus:outline-none focus:border-zeta-gold"
                    />
                    <span className="text-[10px] text-zeta-text/40 shrink-0">年</span>
                  </div>
                )}

                {/* 第三列：年化報酬率／備註 */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step={0.1}
                    value={item.annualReturnRate ?? ''}
                    onChange={(e) => update(item.id, { annualReturnRate: e.target.value === '' ? undefined : Number(e.target.value) })}
                    placeholder={defaultReturnRate !== undefined ? `報酬率 ${defaultReturnRate}%` : '年化報酬率%'}
                    className="w-24 text-xs border border-zeta-bg rounded-md px-2 py-1.5 text-right focus:outline-none focus:border-zeta-gold"
                  />
                  <span className="text-[10px] text-zeta-text/40 shrink-0">%</span>
                  <input
                    value={item.note ?? ''}
                    onChange={(e) => update(item.id, { note: e.target.value })}
                    className="flex-1 min-w-0 text-xs border border-zeta-bg rounded-md px-2 py-1.5 focus:outline-none focus:border-zeta-gold"
                    placeholder="備註（選填）"
                  />
                </div>
              </>
            )}

            {!showInvestmentFields && (
              <input
                value={item.note ?? ''}
                onChange={(e) => update(item.id, { note: e.target.value })}
                className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5 focus:outline-none focus:border-zeta-gold"
                placeholder="備註（選填）"
              />
            )}

            {/* 進階設定：顏色（收合，避免一次展開太多欄位） */}
            <button
              onClick={() => setAdvancedOpenId(advancedOpen ? null : item.id)}
              className="text-[10px] text-zeta-text/40 hover:text-zeta-navy flex items-center gap-0.5"
            >
              進階設定（顏色） {advancedOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            {advancedOpen && (
              <div className="flex gap-1 pt-0.5">
                {BRAND_COLOR_SWATCHES.concat(CHART_PALETTE.map((v) => ({ label: v, value: v }))).slice(0, 8).map((c) => (
                  <button
                    key={c.value}
                    onClick={() => update(item.id, { color: c.value })}
                    className={`w-4 h-4 rounded-full border ${item.color === c.value ? 'ring-2 ring-offset-1 ring-zeta-navy' : 'border-black/10'}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => update(item.id, { color: e.target.value })}
                  className="w-4 h-4 rounded-full overflow-hidden border-0 p-0"
                  title="自訂顏色"
                />
              </div>
            )}
          </div>
        )
      })}
      <button onClick={add} className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
        <Plus size={14} /> 新增資產項目
      </button>
    </div>
  )
}
