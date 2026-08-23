import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { LineComparisonData, LineComparisonPoint } from '../../types'
import { newId } from '../../services/idGenerator'
import { BRAND_COLOR_SWATCHES } from '../richtext/RichTextEditor'

interface Props {
  data: LineComparisonData
  onChange: (data: LineComparisonData) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-zeta-navy mb-1 block">{label}</label>
      {children}
    </div>
  )
}
function Num(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5 focus:outline-none focus:border-zeta-gold" />
}
function Txt(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5 focus:outline-none focus:border-zeta-gold" />
}

/** 折線比較圖資料編輯器：自動試算模式的參數輸入，或手動輸入模式的時間點清單 */
export function LineComparisonEditor({ data, onChange }: Props) {
  const set = (patch: Partial<LineComparisonData>) => onChange({ ...data, ...patch })

  const updatePoint = (id: string, patch: Partial<LineComparisonPoint>) =>
    set({ points: data.points.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const removePoint = (id: string) => set({ points: data.points.filter((p) => p.id !== id) })
  const addPoint = () => set({ points: [...data.points, { id: newId(), label: `時間點 ${data.points.length + 1}`, beforeAmount: 0, afterAmount: 0 }] })

  return (
    <div className="space-y-3 border-t border-zeta-bg pt-3 mt-1">
      <div className="text-xs font-semibold text-zeta-navy">折線比較圖設定</div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="圖表標題"><Txt value={data.chartTitle} onChange={(e) => set({ chartTitle: e.target.value })} /></Field>
        <Field label="時間單位">
          <select value={data.timeUnit} onChange={(e) => set({ timeUnit: e.target.value as any })} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5">
            <option value="year">年</option>
            <option value="month">月</option>
            <option value="custom">自訂</option>
          </select>
        </Field>
      </div>
      <Field label="圖表說明"><Txt value={data.chartDescription} onChange={(e) => set({ chartDescription: e.target.value })} /></Field>
      {data.timeUnit === 'custom' && (
        <Field label="自訂時間名稱"><Txt value={data.customUnitLabel ?? ''} onChange={(e) => set({ customUnitLabel: e.target.value })} placeholder="例如：期" /></Field>
      )}

      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={data.mode === 'auto'} onChange={() => set({ mode: 'auto' })} /> 自動試算
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={data.mode === 'manual'} onChange={() => set({ mode: 'manual' })} /> 手動輸入
        </label>
      </div>

      {data.mode === 'auto' ? (
        <div className="grid grid-cols-2 gap-2">
          <Field label="起始資產"><Num value={data.startAmount} onChange={(e) => set({ startAmount: Number(e.target.value) })} /></Field>
          <Field label="規劃期數"><Num value={data.periods} onChange={(e) => set({ periods: Number(e.target.value) })} /></Field>
          <Field label="調整前報酬率(%)"><Num value={data.beforeAnnualReturnRate} onChange={(e) => set({ beforeAnnualReturnRate: Number(e.target.value) })} /></Field>
          <Field label="調整後報酬率(%)"><Num value={data.afterAnnualReturnRate} onChange={(e) => set({ afterAnnualReturnRate: Number(e.target.value) })} /></Field>
          <Field label="每期投入金額"><Num value={data.contributionAmount} onChange={(e) => set({ contributionAmount: Number(e.target.value) })} /></Field>
          <Field label="複利計算">
            <label className="flex items-center gap-1.5 text-xs mt-1.5">
              <input type="checkbox" checked={data.useCompound} onChange={(e) => set({ useCompound: e.target.checked })} /> 使用複利
            </label>
          </Field>
        </div>
      ) : (
        <div className="space-y-1.5">
          {data.points.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1.5 items-center">
              <Txt value={p.label} onChange={(e) => updatePoint(p.id, { label: e.target.value })} placeholder="時間名稱" />
              <Num value={p.beforeAmount} onChange={(e) => updatePoint(p.id, { beforeAmount: Number(e.target.value) })} placeholder="調整前" />
              <Num value={p.afterAmount} onChange={(e) => updatePoint(p.id, { afterAmount: Number(e.target.value) })} placeholder="調整後" />
              <button onClick={() => removePoint(p.id)} className="text-zeta-danger/70 hover:text-zeta-danger"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addPoint} className="w-full flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
            <Plus size={13} /> 新增時間點
          </button>
        </div>
      )}

      <label className="flex items-center gap-1.5 text-xs">
        <input type="checkbox" checked={data.showTarget} onChange={(e) => set({ showTarget: e.target.checked })} /> 顯示目標線
      </label>
      {data.showTarget && (
        <Field label="目標資產金額"><Num value={data.targetAmount} onChange={(e) => set({ targetAmount: Number(e.target.value) })} /></Field>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Field label="調整前線條名稱"><Txt value={data.beforeName} onChange={(e) => set({ beforeName: e.target.value })} /></Field>
        <Field label="調整後線條名稱"><Txt value={data.afterName} onChange={(e) => set({ afterName: e.target.value })} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['beforeColor', 'afterColor', 'targetColor'] as const).map((key) => (
          <Field key={key} label={key === 'beforeColor' ? '調整前顏色' : key === 'afterColor' ? '調整後顏色' : '目標線顏色'}>
            <div className="flex gap-1">
              {BRAND_COLOR_SWATCHES.slice(0, 5).map((c) => (
                <button key={c.value} onClick={() => set({ [key]: c.value } as any)} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.value }} />
              ))}
              <input type="color" value={data[key]} onChange={(e) => set({ [key]: e.target.value } as any)} className="w-4 h-4 rounded-full overflow-hidden border-0 p-0" />
            </div>
          </Field>
        ))}
      </div>

      <label className="flex items-center gap-1.5 text-xs">
        <input type="checkbox" checked={data.showDataLabels} onChange={(e) => set({ showDataLabels: e.target.checked })} /> 顯示資料標籤
      </label>
    </div>
  )
}
