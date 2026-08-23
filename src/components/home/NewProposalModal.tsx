import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import type { ClientInfo } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (client: ClientInfo) => void
}

const EMPTY: ClientInfo = {
  proposalName: '',
  clientName: '',
  clientTitle: '先生/小姐',
  proposalDate: new Date().toISOString().slice(0, 10),
  proposalTopic: '',
  advisorName: 'Zeta',
  brandName: 'Zeta｜錢與人生的整理室',
  contact: '',
  instagram: '',
  website: '',
  note: ''
}

function TextField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-zeta-navy mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-zeta-bg rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zeta-gold"
      />
    </div>
  )
}

export function NewProposalModal({ open, onClose, onCreate }: Props) {
  const [form, setForm] = useState<ClientInfo>(EMPTY)
  const set = (patch: Partial<ClientInfo>) => setForm((f) => ({ ...f, ...patch }))

  const canSubmit = form.proposalName.trim().length > 0 && form.clientName.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="建立新提案"
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm border border-zeta-bg">取消</button>
          <button
            disabled={!canSubmit}
            onClick={() => { onCreate(form); setForm(EMPTY) }}
            className="px-5 py-2 rounded-full text-sm bg-zeta-navy text-white hover:opacity-90 disabled:opacity-40"
          >
            建立提案
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <TextField label="提案名稱 *" value={form.proposalName} onChange={(v) => set({ proposalName: v })} placeholder="例如：王小明．退休規劃提案" />
        <TextField label="客戶姓名 *" value={form.clientName} onChange={(v) => set({ clientName: v })} />
        <TextField label="客戶稱謂" value={form.clientTitle} onChange={(v) => set({ clientTitle: v })} />
        <TextField label="提案日期" type="date" value={form.proposalDate} onChange={(v) => set({ proposalDate: v })} />
        <TextField label="提案主題" value={form.proposalTopic} onChange={(v) => set({ proposalTopic: v })} placeholder="例如：個人資產配置與退休規劃" />
        <TextField label="財務顧問姓名" value={form.advisorName} onChange={(v) => set({ advisorName: v })} />
        <TextField label="品牌名稱" value={form.brandName} onChange={(v) => set({ brandName: v })} />
        <TextField label="聯絡方式" value={form.contact} onChange={(v) => set({ contact: v })} />
        <TextField label="Instagram" value={form.instagram} onChange={(v) => set({ instagram: v })} />
        <TextField label="官方網站" value={form.website} onChange={(v) => set({ website: v })} />
      </div>
      <div className="mt-3">
        <label className="text-xs font-medium text-zeta-navy mb-1 block">補充說明</label>
        <textarea
          value={form.note}
          onChange={(e) => set({ note: e.target.value })}
          rows={2}
          className="w-full text-sm border border-zeta-bg rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zeta-gold resize-none"
        />
      </div>
    </Modal>
  )
}
