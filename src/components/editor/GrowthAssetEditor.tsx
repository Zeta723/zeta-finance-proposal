import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from 'lucide-react'
import type { CurrencySettings, GrowthAsset } from '../../types'
import { defaultGrowthAsset } from '../../types'
import { CHART_PALETTE } from '../../styles/theme'
import { formatMoney, formatWithConversion } from '../../services/currencyService'
import { computeGrowthAssetSeries } from '../../services/growthAssetCalc'
import { newId } from '../../services/idGenerator'

interface Props {
  assets: GrowthAsset[]
  onChange: (assets: GrowthAsset[]) => void
  currencySettings: CurrencySettings
}

const CONTRIBUTION_LABELS: Record<GrowthAsset['contributionMode'], string> = {
  lumpSum: '單筆投入',
  annual: '每年投入',
  monthly: '每月投入'
}

/**
 * 資產成長試算項目編輯器：每一項資產是一張可展開/收合的卡片，各自獨立設定
 * 幣別、投入方式、投入年數（何時停止投入）與試算總年數（算到第幾年）。
 * 基本欄位直接顯示；進階設定（顏色、開始投入年份）收在「進階設定」裡。
 */
export function GrowthAssetEditor({ assets, onChange, currencySettings }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(assets[0]?.id ?? null)
  const [advancedOpenId, setAdvancedOpenId] = useState<string | null>(null)

  const update = (id: string, patch: Partial<GrowthAsset>) => onChange(assets.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  const remove = (id: string) => onChange(assets.filter((a) => a.id !== id))
  const duplicate = (id: string) => {
    const idx = assets.findIndex((a) => a.id === id)
    if (idx === -1) return
    const copy = { ...assets[idx], id: newId(), name: `${assets[idx].name}（複本）` }
    const next = [...assets]
    next.splice(idx + 1, 0, copy)
    onChange(next)
    setExpandedId(copy.id)
  }
  const move = (id: string, dir: -1 | 1) => {
    const idx = assets.findIndex((a) => a.id === id)
    const to = idx + dir
    if (to < 0 || to >= assets.length) return
    const next = [...assets]
    const [item] = next.splice(idx, 1)
    next.splice(to, 0, item)
    onChange(next)
  }
  const add = () => {
    const asset = { ...defaultGrowthAsset(`新資產項目 ${assets.length + 1}`, CHART_PALETTE[assets.length % CHART_PALETTE.length]), id: newId() }
    onChange([...assets, asset])
    setExpandedId(asset.id)
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] text-zeta-text/50 leading-relaxed bg-zeta-bg/50 rounded-md px-2 py-1.5">
        以上為假設報酬率試算，不代表保證收益或實際商品利益。
      </div>
      {assets.map((asset) => {
        const expanded = expandedId === asset.id
        const advancedOpen = advancedOpenId === asset.id
        const series = computeGrowthAssetSeries(asset, currencySettings)
        return (
          <div key={asset.id} className="border border-zeta-bg rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(expanded ? null : asset.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 bg-zeta-bg/40 text-left"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
              <span className="flex-1 text-xs font-medium text-zeta-navy truncate">{asset.name || '未命名資產'}</span>
              <span className="text-[10px] text-zeta-text/50 shrink-0">{formatMoney(series.finalValue, currencySettings.primaryDisplayCurrency)}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expanded && (
              <div className="p-2.5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zeta-text/60 block mb-0.5">項目名稱</label>
                    <input value={asset.name} onChange={(e) => update(asset.id, { name: e.target.value })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-zeta-text/60 block mb-0.5">幣別</label>
                    <select value={asset.currency} onChange={(e) => update(asset.id, { currency: e.target.value as any })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5">
                      <option value="TWD">新台幣 TWD</option>
                      <option value="USD">美元 USD</option>
                      <option value="CUSTOM">自訂幣別</option>
                    </select>
                  </div>
                </div>
                {asset.currency === 'CUSTOM' && (
                  <input value={asset.customCurrencyLabel ?? ''} onChange={(e) => update(asset.id, { customCurrencyLabel: e.target.value })} placeholder="自訂幣別符號" className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                )}

                <div>
                  <label className="text-[10px] text-zeta-text/60 block mb-0.5">投入方式</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['lumpSum', 'annual', 'monthly'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => update(asset.id, { contributionMode: mode })}
                        className={`text-[10.5px] px-1 py-1.5 rounded-md border ${asset.contributionMode === mode ? 'border-zeta-gold bg-zeta-gold/10 text-zeta-navy' : 'border-zeta-bg text-zeta-text/60'}`}
                      >
                        {CONTRIBUTION_LABELS[mode]}
                      </button>
                    ))}
                  </div>
                </div>

                {asset.contributionMode === 'lumpSum' ? (
                  <div>
                    <label className="text-[10px] text-zeta-text/60 block mb-0.5">初始投入金額</label>
                    <input type="number" value={asset.initialAmount} onChange={(e) => update(asset.id, { initialAmount: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zeta-text/60 block mb-0.5">{asset.contributionMode === 'annual' ? '每年投入' : '每月投入'}</label>
                      <input type="number" value={asset.periodicAmount} onChange={(e) => update(asset.id, { periodicAmount: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                    </div>
                    <div>
                      <label className="text-[10px] text-zeta-text/60 block mb-0.5">投入年數</label>
                      <input type="number" value={asset.contributionYears} onChange={(e) => update(asset.id, { contributionYears: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zeta-text/60 block mb-0.5">預估年報酬率(%)</label>
                    <input type="number" step={0.1} value={asset.annualReturnRate} onChange={(e) => update(asset.id, { annualReturnRate: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                  </div>
                  <div>
                    <label className="text-[10px] text-zeta-text/60 block mb-0.5">試算總年數</label>
                    <input type="number" value={asset.totalYears} onChange={(e) => update(asset.id, { totalYears: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-zeta-bg/40 rounded-md p-2 text-center">
                  <div>
                    <div className="text-[9px] text-zeta-text/50">累積投入</div>
                    <div className="text-[11px] font-semibold text-zeta-navy">{formatMoney(series.totalContribution, asset.currency, asset.customCurrencyLabel)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zeta-text/50">試算期末價值</div>
                    <div className="text-[11px] font-semibold" style={{ color: asset.color }}>{formatWithConversion(series.finalValue, asset.currency, currencySettings, asset.customCurrencyLabel)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zeta-text/50">預估增值</div>
                    <div className="text-[11px] font-semibold text-zeta-positive">{formatMoney(series.estimatedGain, asset.currency, asset.customCurrencyLabel)}</div>
                  </div>
                </div>

                <button onClick={() => setAdvancedOpenId(advancedOpen ? null : asset.id)} className="text-[10px] text-zeta-text/50 hover:text-zeta-navy">
                  {advancedOpen ? '收合進階設定 ▲' : '進階設定 ▼'}
                </button>
                {advancedOpen && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zeta-bg">
                    <div>
                      <label className="text-[10px] text-zeta-text/60 block mb-0.5">開始投入年份（第幾年開始）</label>
                      <input type="number" value={asset.startYearOffset} onChange={(e) => update(asset.id, { startYearOffset: Number(e.target.value) })} className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5" />
                    </div>
                    <div>
                      <label className="text-[10px] text-zeta-text/60 block mb-0.5">圖表顏色</label>
                      <input type="color" value={asset.color} onChange={(e) => update(asset.id, { color: e.target.value })} className="w-full h-7 rounded-md border border-zeta-bg" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-[10px] text-zeta-text/60">
                    <input type="checkbox" checked={asset.visible} onChange={(e) => update(asset.id, { visible: e.target.checked })} /> 顯示在圖表中
                  </label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(asset.id, -1)} className="text-zeta-text/40 hover:text-zeta-navy"><ChevronUp size={14} /></button>
                    <button onClick={() => move(asset.id, 1)} className="text-zeta-text/40 hover:text-zeta-navy"><ChevronDown size={14} /></button>
                    <button onClick={() => duplicate(asset.id)} className="text-zeta-text/40 hover:text-zeta-navy" title="複製"><Copy size={13} /></button>
                    <button onClick={() => remove(asset.id)} className="text-zeta-danger/70 hover:text-zeta-danger" title="刪除"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <button onClick={add} className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
        <Plus size={14} /> 新增試算項目
      </button>
    </div>
  )
}
