import React from 'react'
import type {
  AccountAllocationData,
  AssetAllocationData,
  BeforeAfterData,
  ConclusionData,
  CoverData,
  CurrencySettings,
  CustomSlideData,
  ProposalSlide,
  RecommendationData,
  RecommendationPlanType
} from '../../types'
import { RichTextEditor } from '../richtext/RichTextEditor'
import { ImageUploadField } from './ImageUploadField'
import { AssetItemListEditor } from './AssetItemListEditor'
import { StringListEditor } from './StringListEditor'
import { LayoutPicker } from './LayoutPicker'
import { AllocationCategoryListEditor } from './AllocationCategoryListEditor'
import { LineComparisonEditor } from './LineComparisonEditor'
import { ImageBlockField } from './ImageBlockField'
import { BodyTextStyleEditor } from './BodyTextStyleEditor'
import { THEMES, type ThemeId } from '../../styles/theme'
import { SLIDE_TYPE_LABELS, defaultLineComparisonData } from '../../data/slideDefaults'
import { newId } from '../../services/idGenerator'

interface Props {
  slide: ProposalSlide
  defaultTheme: string
  currencySettings: CurrencySettings
  onCurrencySettingsChange: (settings: CurrencySettings) => void
  onDataChange: (data: any) => void
  onLayoutChange: (layoutId: string) => void
  onThemeChange: (theme: string) => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-zeta-navy mb-1 block">{label}</label>
      {children}
    </div>
  )
}

/** 帶「是否顯示在PPT/PDF」勾選框的欄位包裝，勾選狀態存在 data.showFields 裡 */
function ToggleField({ label, checked, onToggle, children }: { label: string; checked: boolean; onToggle: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-zeta-navy">{label}</label>
        <label className="flex items-center gap-1 text-[10px] text-zeta-text/60 cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="accent-zeta-gold" />
          顯示在PPT
        </label>
      </div>
      {children}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full text-sm border border-zeta-bg rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zeta-gold" />
}

const PLAN_TYPES: RecommendationPlanType[] = [
  '現金流整理', '緊急預備金', 'ETF定期定額', '退休規劃', '旅遊金規劃', '教育金規劃',
  '房產活化', '國際資產配置', '美金高利增值帳戶', '資產防護網', '自訂方案'
]

export function ContentEditPanel({ slide, defaultTheme, currencySettings, onCurrencySettingsChange, onDataChange, onLayoutChange, onThemeChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs text-zeta-text/50 mb-2">{SLIDE_TYPE_LABELS[slide.type]}</div>
        <Field label="版型">
          <LayoutPicker type={slide.type} value={slide.layoutId} defaultTheme={defaultTheme} onChange={onLayoutChange} />
        </Field>
      </div>

      <Field label="頁面風格（可針對單一頁面切換）">
        <div className="flex gap-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id as ThemeId)}
              className={`flex-1 text-[11px] rounded-lg border-2 py-1.5 ${slide.slideTheme === t.id ? 'border-zeta-gold' : 'border-zeta-bg'}`}
              style={{ backgroundColor: t.bgPrimary, color: t.headingColor }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </Field>

      <hr className="border-zeta-bg" />

      {slide.type === 'cover' && <CoverForm data={slide.data as CoverData} onChange={onDataChange} />}
      {slide.type === 'assetAllocation' && <AssetAllocationForm data={slide.data as AssetAllocationData} onChange={onDataChange} />}
      {slide.type === 'beforeAfter' && (
        <BeforeAfterForm
          data={slide.data as BeforeAfterData}
          layoutId={slide.layoutId}
          onChange={onDataChange}
          currencySettings={currencySettings}
          onCurrencySettingsChange={onCurrencySettingsChange}
        />
      )}
      {slide.type === 'recommendation' && <RecommendationForm data={slide.data as RecommendationData} onChange={onDataChange} />}
      {slide.type === 'conclusion' && <ConclusionForm data={slide.data as ConclusionData} onChange={onDataChange} />}
      {slide.type === 'custom' && <CustomForm data={slide.data as CustomSlideData} layoutId={slide.layoutId} onChange={onDataChange} />}
      {slide.type === 'accountAllocation' && <AccountAllocationForm data={slide.data as AccountAllocationData} onChange={onDataChange} />}
    </div>
  )
}

function CoverForm({ data, onChange }: { data: CoverData; onChange: (d: CoverData) => void }) {
  const set = (patch: Partial<CoverData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-3">
      <Field label="提案主題"><TextInput value={data.proposalTopic} onChange={(e) => set({ proposalTopic: e.target.value })} /></Field>
      <Field label="提案標題"><TextInput value={data.title} onChange={(e) => set({ title: e.target.value })} /></Field>
      <Field label="副標題"><TextInput value={data.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="客戶姓名"><TextInput value={data.clientName} onChange={(e) => set({ clientName: e.target.value })} /></Field>
        <Field label="客戶稱謂"><TextInput value={data.clientTitle} onChange={(e) => set({ clientTitle: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="提案日期"><TextInput type="date" value={data.proposalDate} onChange={(e) => set({ proposalDate: e.target.value })} /></Field>
        <Field label="顧問姓名"><TextInput value={data.advisorName} onChange={(e) => set({ advisorName: e.target.value })} /></Field>
      </div>
      <Field label="品牌名稱"><TextInput value={data.brandName} onChange={(e) => set({ brandName: e.target.value })} /></Field>
      <Field label="提案引言">
        <RichTextEditor value={data.quote} onChange={(v) => set({ quote: v })} minimal />
      </Field>
      <ImageUploadField label="Logo" value={data.logo} onChange={(v) => set({ logo: v })} />
      <ImageUploadField label="封面照片" value={data.coverPhoto} onChange={(v) => set({ coverPhoto: v })} />
      <ImageUploadField label="背景圖片" value={data.backgroundImage} onChange={(v) => set({ backgroundImage: v })} showFitToggle />
    </div>
  )
}

function AssetAllocationForm({ data, onChange }: { data: AssetAllocationData; onChange: (d: AssetAllocationData) => void }) {
  const set = (patch: Partial<AssetAllocationData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-3">
      <Field label="頁面主題"><TextInput value={data.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
      <Field label="資產項目">
        <AssetItemListEditor items={data.items} onChange={(items) => set({ items })} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="圖表類型">
          <select value={data.chartType} onChange={(e) => set({ chartType: e.target.value as any })} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5">
            <option value="pie">圓餅圖</option>
            <option value="donut">環形圖</option>
            <option value="bar">長條圖</option>
          </select>
        </Field>
        <Field label="幣別">
          <select value={data.currency} onChange={(e) => set({ currency: e.target.value as any })} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5">
            <option value="TWD">新台幣</option>
            <option value="USD">美元</option>
            <option value="CUSTOM">自訂幣別</option>
          </select>
        </Field>
      </div>
      {data.currency === 'CUSTOM' && (
        <Field label="自訂幣別符號"><TextInput value={data.customCurrencyLabel ?? ''} onChange={(e) => set({ customCurrencyLabel: e.target.value })} /></Field>
      )}
      <div className="flex gap-4 text-xs text-zeta-navy">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={data.showAmount} onChange={(e) => set({ showAmount: e.target.checked })} />顯示金額</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={data.showPercentage} onChange={(e) => set({ showPercentage: e.target.checked })} />顯示百分比</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={data.showNote} onChange={(e) => set({ showNote: e.target.checked })} />顯示備註</label>
      </div>
    </div>
  )
}

function BeforeAfterForm({
  data,
  layoutId,
  onChange,
  currencySettings,
  onCurrencySettingsChange
}: {
  data: BeforeAfterData
  layoutId: string
  onChange: (d: BeforeAfterData) => void
  currencySettings: CurrencySettings
  onCurrencySettingsChange: (s: CurrencySettings) => void
}) {
  const set = (patch: Partial<BeforeAfterData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-3">
      <Field label="頁面主題"><TextInput value={data.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="左側標籤"><TextInput value={data.beforeLabel} onChange={(e) => set({ beforeLabel: e.target.value })} /></Field>
        <Field label="右側標籤"><TextInput value={data.afterLabel} onChange={(e) => set({ afterLabel: e.target.value })} /></Field>
      </div>
      <Field label={`${data.beforeLabel || '調整前'} 資產項目`}>
        <AssetItemListEditor
          items={data.beforeItems}
          onChange={(items) => set({ beforeItems: items })}
          showInvestmentFields
          defaultReturnRate={data.lineComparison?.beforeAnnualReturnRate}
        />
      </Field>
      <Field label={`${data.afterLabel || '調整後'} 資產項目`}>
        <AssetItemListEditor
          items={data.afterItems}
          onChange={(items) => set({ afterItems: items })}
          showInvestmentFields
          defaultReturnRate={data.lineComparison?.afterAnnualReturnRate}
        />
      </Field>
      <Field label="差額說明（例如：預留旅遊金、支付保費、償還負債…）">
        <TextInput value={data.differenceNote} onChange={(e) => set({ differenceNote: e.target.value })} placeholder="說明調整前後總額差異的用途" />
      </Field>

      {layoutId === 'lineComparison' && (
        <LineComparisonEditor
          data={data.lineComparison ?? defaultLineComparisonData()}
          onChange={(lineComparison) => set({ lineComparison })}
          currencySettings={currencySettings}
          onCurrencySettingsChange={onCurrencySettingsChange}
        />
      )}
    </div>
  )
}

function AccountAllocationForm({ data, onChange }: { data: AccountAllocationData; onChange: (d: AccountAllocationData) => void }) {
  const set = (patch: Partial<AccountAllocationData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-3">
      <Field label="頁面主題"><TextInput value={data.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="總收入"><TextInput type="number" value={data.totalIncome} onChange={(e) => set({ totalIncome: Number(e.target.value) })} /></Field>
        <Field label="幣別">
          <select value={data.currency} onChange={(e) => set({ currency: e.target.value as any })} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5">
            <option value="TWD">新台幣</option>
            <option value="USD">美元</option>
            <option value="CUSTOM">自訂幣別</option>
          </select>
        </Field>
      </div>
      {data.currency === 'CUSTOM' && (
        <Field label="自訂幣別符號"><TextInput value={data.customCurrencyLabel ?? ''} onChange={(e) => set({ customCurrencyLabel: e.target.value })} /></Field>
      )}
      <div className="flex gap-4 text-xs text-zeta-navy">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={data.showAmount} onChange={(e) => set({ showAmount: e.target.checked })} />顯示金額</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={data.showPercentage} onChange={(e) => set({ showPercentage: e.target.checked })} />顯示比例</label>
      </div>
      <Field label="大項目與小項目">
        <AllocationCategoryListEditor categories={data.categories} onChange={(categories) => set({ categories })} />
      </Field>
    </div>
  )
}

function RecommendationForm({ data, onChange }: { data: RecommendationData; onChange: (d: RecommendationData) => void }) {
  const set = (patch: Partial<RecommendationData>) => onChange({ ...data, ...patch })
  const toggleShow = (key: keyof RecommendationData, value: boolean) => set({ showFields: { ...data.showFields, [key]: value } })
  const isShown = (key: keyof RecommendationData) => data.showFields?.[key] !== false

  return (
    <div className="space-y-3">
      <Field label="頁面主題"><TextInput value={data.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
      <Field label="方案名稱"><TextInput value={data.planName} onChange={(e) => set({ planName: e.target.value })} /></Field>
      <Field label="方案類型">
        <select value={data.planType} onChange={(e) => set({ planType: e.target.value as RecommendationPlanType })} className="w-full text-sm border border-zeta-bg rounded-md px-2 py-1.5">
          {PLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="核心目標"><TextInput value={data.coreGoal} onChange={(e) => set({ coreGoal: e.target.value })} /></Field>
      <Field label="客戶目前的問題"><RichTextEditor value={data.clientProblem} onChange={(v) => set({ clientProblem: v })} minimal /></Field>
      <Field label="顧問建議"><RichTextEditor value={data.advisorSuggestion} onChange={(v) => set({ advisorSuggestion: v })} /></Field>
      <Field label="適合客戶的原因"><RichTextEditor value={data.whySuitable} onChange={(v) => set({ whySuitable: v })} minimal /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="每月投入金額"><TextInput type="number" value={data.monthlyAmount} onChange={(e) => set({ monthlyAmount: Number(e.target.value) })} /></Field>
        <Field label="一次性投入金額"><TextInput type="number" value={data.lumpSumAmount} onChange={(e) => set({ lumpSumAmount: Number(e.target.value) })} /></Field>
        <Field label="規劃期間（年）"><TextInput type="number" value={data.durationYears} onChange={(e) => set({ durationYears: Number(e.target.value) })} /></Field>
        <Field label="預估年化報酬率（%）"><TextInput type="number" value={data.estimatedAnnualReturn} onChange={(e) => set({ estimatedAnnualReturn: Number(e.target.value) })} /></Field>
      </div>
      <ToggleField label="預估成果說明" checked={isShown('estimatedResult')} onToggle={(v) => toggleShow('estimatedResult', v)}>
        <RichTextEditor value={data.estimatedResult} onChange={(v) => set({ estimatedResult: v })} minimal />
      </ToggleField>
      <ToggleField label="提取時間與方式" checked={isShown('withdrawTiming')} onToggle={(v) => toggleShow('withdrawTiming', v)}>
        <div className="grid grid-cols-2 gap-2">
          <TextInput value={data.withdrawTiming} onChange={(e) => set({ withdrawTiming: e.target.value })} placeholder="預計提取時間" />
          <TextInput value={data.withdrawMethod} onChange={(e) => set({ withdrawMethod: e.target.value })} placeholder="提取方式" />
        </div>
      </ToggleField>
      <ToggleField label="方案優勢" checked={isShown('advantages')} onToggle={(v) => toggleShow('advantages', v)}>
        <StringListEditor label="" items={data.advantages} onChange={(v) => set({ advantages: v })} />
      </ToggleField>
      <StringListEditor label="執行步驟" items={data.steps} onChange={(v) => set({ steps: v })} />
      <ToggleField label="注意事項" checked={isShown('cautions')} onToggle={(v) => toggleShow('cautions', v)}>
        <StringListEditor label="" items={data.cautions} onChange={(v) => set({ cautions: v })} />
      </ToggleField>
      <ToggleField label="風險提醒" checked={isShown('riskNotes')} onToggle={(v) => toggleShow('riskNotes', v)}>
        <StringListEditor label="" items={data.riskNotes} onChange={(v) => set({ riskNotes: v })} />
      </ToggleField>
      <ToggleField label="顧問補充說明" checked={isShown('advisorNote')} onToggle={(v) => toggleShow('advisorNote', v)}>
        <RichTextEditor value={data.advisorNote} onChange={(v) => set({ advisorNote: v })} minimal />
      </ToggleField>
      <ToggleField label="圖片" checked={isShown('image')} onToggle={(v) => toggleShow('image', v)}>
        <ImageUploadField label="" value={data.image} onChange={(v) => set({ image: v })} />
      </ToggleField>
    </div>
  )
}

function ConclusionForm({ data, onChange }: { data: ConclusionData; onChange: (d: ConclusionData) => void }) {
  const set = (patch: Partial<ConclusionData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-3">
      <Field label="頁面主題"><TextInput value={data.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
      <Field label="本次規劃摘要"><RichTextEditor value={data.summary} onChange={(v) => set({ summary: v })} minimal /></Field>
      <StringListEditor label="核心建議" items={data.coreAdvice} onChange={(v) => set({ coreAdvice: v })} />
      <StringListEditor label="優先執行事項" items={data.priorities} onChange={(v) => set({ priorities: v })} />
      <StringListEditor label="下一步行動" items={data.nextSteps} onChange={(v) => set({ nextSteps: v })} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="預計執行日期"><TextInput type="date" value={data.plannedDate} onChange={(e) => set({ plannedDate: e.target.value })} /></Field>
        <Field label="下次會談日期"><TextInput type="date" value={data.nextMeetingDate} onChange={(e) => set({ nextMeetingDate: e.target.value })} /></Field>
      </div>
      <Field label="顧問提醒"><RichTextEditor value={data.advisorReminder} onChange={(v) => set({ advisorReminder: v })} minimal /></Field>
      <Field label="結尾文字"><RichTextEditor value={data.closingText} onChange={(v) => set({ closingText: v })} minimal /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="聯絡方式"><TextInput value={data.contact} onChange={(e) => set({ contact: e.target.value })} /></Field>
        <Field label="Instagram"><TextInput value={data.instagram} onChange={(e) => set({ instagram: e.target.value })} /></Field>
      </div>
      <Field label="官方網站"><TextInput value={data.website} onChange={(e) => set({ website: e.target.value })} /></Field>
      <ImageUploadField label="QR Code" value={data.qrCode} onChange={(v) => set({ qrCode: v })} />
      <ImageUploadField label="顧問照片" value={data.advisorPhoto} onChange={(v) => set({ advisorPhoto: v })} shape="circle" />
      <ImageUploadField label="Logo" value={data.logo} onChange={(v) => set({ logo: v })} />
    </div>
  )
}

function CustomForm({ data, layoutId, onChange }: { data: CustomSlideData; layoutId: string; onChange: (d: CustomSlideData) => void }) {
  const set = (patch: Partial<CustomSlideData>) => onChange({ ...data, ...patch })
  const updateHighlight = (id: string, patch: Partial<CustomSlideData['highlights'][number]>) =>
    set({ highlights: data.highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)) })
  const removeHighlight = (id: string) => set({ highlights: data.highlights.filter((h) => h.id !== id) })
  const addHighlight = () => set({ highlights: [...data.highlights, { id: newId(), title: '重點', content: null }] })

  return (
    <div className="space-y-3">
      <Field label="頁面主題"><TextInput value={data.heading} onChange={(e) => set({ heading: e.target.value })} /></Field>
      <Field label="標題"><TextInput value={data.title} onChange={(e) => set({ title: e.target.value })} /></Field>
      <Field label="副標題"><TextInput value={data.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
      <Field label="內文"><RichTextEditor value={data.body} onChange={(v) => set({ body: v })} /></Field>

      <Field label="內文版面設定">
        <BodyTextStyleEditor style={data.bodyStyle} onChange={(bodyStyle) => set({ bodyStyle })} />
      </Field>

      <Field label="重點項目">
        <div className="space-y-2">
          {data.highlights.map((h) => (
            <div key={h.id} className="border border-zeta-bg rounded-lg p-2 space-y-1">
              <div className="flex items-center gap-2">
                <TextInput value={h.title} onChange={(e) => updateHighlight(h.id, { title: e.target.value })} placeholder="重點標題" />
                <button onClick={() => removeHighlight(h.id)} className="text-zeta-danger text-xs shrink-0">刪除</button>
              </div>
              <RichTextEditor value={h.content} onChange={(v) => updateHighlight(h.id, { content: v })} minimal />
            </div>
          ))}
          <button onClick={addHighlight} className="w-full text-xs py-1.5 rounded-lg border border-dashed border-zeta-gold/60 text-zeta-navy hover:bg-zeta-gold/10">
            + 新增重點項目
          </button>
        </div>
      </Field>

      {layoutId === 'imageText' ? (
        <Field label="圖片區塊（可拖曳／縮放，或直接輸入數值）">
          <ImageBlockField block={data.imageBlock} onChange={(imageBlock) => set({ imageBlock })} />
        </Field>
      ) : (
        <ImageUploadField label="圖片" value={data.image} onChange={(v) => set({ image: v })} />
      )}
      <Field label="備註"><TextInput value={data.note ?? ''} onChange={(e) => set({ note: e.target.value })} /></Field>
    </div>
  )
}
