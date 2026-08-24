import React from 'react'
import type { CurrencySettings } from '../../types'

interface Props {
  settings: CurrencySettings
  onChange: (settings: CurrencySettings) => void
}

/** 全域幣別顯示與匯率設定：主要顯示幣別＋手動匯率，套用到本頁所有金額換算 */
export function CurrencySettingsPanel({ settings, onChange }: Props) {
  const set = (patch: Partial<CurrencySettings>) => onChange({ ...settings, ...patch })

  return (
    <div className="border border-zeta-bg rounded-lg p-2.5 space-y-2 bg-zeta-bg/20">
      <div className="text-[11px] font-semibold text-zeta-navy">幣別與匯率設定</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-zeta-text/60 block mb-0.5">主要顯示幣別</label>
          <select
            value={settings.primaryDisplayCurrency}
            onChange={(e) => set({ primaryDisplayCurrency: e.target.value as any })}
            className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5"
          >
            <option value="TWD">新台幣 TWD</option>
            <option value="USD">美元 USD</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-zeta-text/60 block mb-0.5">美元兌台幣匯率</label>
          <input
            type="number"
            step={0.1}
            value={settings.usdToTwdRate}
            onChange={(e) => set({ usdToTwdRate: Number(e.target.value), rateUpdatedAt: new Date().toISOString() })}
            className="w-full text-xs border border-zeta-bg rounded-md px-2 py-1.5"
          />
        </div>
      </div>
      <div className="text-[10px] text-zeta-text/50">
        目前匯率：1 美元 ≈ {settings.usdToTwdRate} 台幣
        {settings.rateUpdatedAt && `（最後更新：${new Date(settings.rateUpdatedAt).toLocaleString('zh-Hant-TW')}）`}
      </div>
      <div className="text-[10px] text-zeta-text/40">換算金額依設定匯率估算，實際金額可能因匯率變動而不同；此為手動設定匯率，非即時匯率。</div>
    </div>
  )
}
