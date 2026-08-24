import type { Proposal, ProposalSummary } from '../types'
import { SCHEMA_VERSION } from '../types'

/**
 * StorageService：把所有 localStorage 存取集中在這裡。
 * 之後要換成 Supabase / Firebase / 自建 API，只需要實作同樣的介面
 * (IProposalStorage) 並在 index.ts 匯出新的實例即可，UI 完全不用改。
 */
export interface IProposalStorage {
  listSummaries(): ProposalSummary[]
  getProposal(id: string): Proposal | null
  saveProposal(proposal: Proposal): void
  deleteProposal(id: string): void
  duplicateProposal(id: string): Proposal | null
  exportProposalJSON(id: string): string | null
  importProposalJSON(json: string): Proposal
  exportAllJSON(): string
  importAllJSON(json: string): { imported: number; skipped: number }
}

const INDEX_KEY = 'zeta.proposals.index.v1'
const PROPOSAL_KEY = (id: string) => `zeta.proposal.${id}.v1`
const BACKUP_KEY = (id: string) => `zeta.proposal.${id}.pre-v2-backup`

/**
 * 資料遷移：v1 → v2 是純新增欄位（accountAllocation 頁面類型、
 * BeforeAfterData.lineComparison），不會刪除或改名任何既有欄位，
 * 所以理論上 v1 資料本來就能被 v2 的型別結構安全讀取。
 *
 * 這裡仍然：
 * 1. 在第一次讀到舊版本資料時，於另一個 key 寫入一份「升級前備份」，
 *    絕不直接覆蓋或清除原始資料。
 * 2. 把 schemaVersion 正規化為目前版本，並為新增的可選欄位補上安全預設值，
 *    避免任何畫面因為欄位是 undefined 而白屏。
 * 3. 任何一步失敗都直接回傳原始資料，不讓升級過程本身造成資料遺失。
 */
function migrateProposalIfNeeded(id: string, raw: any): any {
  if (!raw || typeof raw !== 'object') return raw
  if (raw.schemaVersion === SCHEMA_VERSION) return raw

  try {
    // 保留升級前的原始快照（僅在尚未備份過的情況下寫入一次）
    if (!localStorage.getItem(BACKUP_KEY(id))) {
      localStorage.setItem(BACKUP_KEY(id), JSON.stringify(raw))
    }

    const migrated = {
      ...raw,
      schemaVersion: SCHEMA_VERSION,
      themeSettings: raw.themeSettings ?? { defaultTheme: 'classicNavyGold' },
      slides: Array.isArray(raw.slides) ? raw.slides.map(migrateSlideIfNeeded) : []
    }
    return migrated
  } catch {
    // 升級過程本身出錯，寧可回傳未升級的原始資料，也不要讓提案消失或白屏
    return raw
  }
}

function migrateSlideIfNeeded(slide: any): any {
  if (!slide || typeof slide !== 'object') return slide
  // beforeAfter 舊資料沒有 lineComparison 欄位是完全合法的狀態（optional 欄位），
  // 各元件在讀取時本身就有 `data.lineComparison ?? defaultLineComparisonData()` 的防呆，
  // 這裡不強制寫入，避免無謂地放大資料量。
  return slide
}

class LocalStorageProposalService implements IProposalStorage {
  private readIndex(): string[] {
    try {
      const raw = localStorage.getItem(INDEX_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // 索引損毀時不要讓網站白屏，直接視為空清單
      return []
    }
  }

  private writeIndex(ids: string[]) {
    localStorage.setItem(INDEX_KEY, JSON.stringify(Array.from(new Set(ids))))
  }

  listSummaries(): ProposalSummary[] {
    const ids = this.readIndex()
    const summaries: ProposalSummary[] = []
    for (const id of ids) {
      const p = this.getProposal(id)
      if (!p) continue
      summaries.push({
        id: p.id,
        name: p.client.proposalName || '未命名提案',
        clientName: p.client.clientName || '—',
        topic: p.client.proposalTopic || '—',
        slideCount: p.slides.length,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        thumbnail: p.thumbnail,
        categoryId: p.categoryId
      })
    }
    return summaries.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }

  getProposal(id: string): Proposal | null {
    try {
      const raw = localStorage.getItem(PROPOSAL_KEY(id))
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || parsed.schemaVersion === undefined) return null
      return migrateProposalIfNeeded(id, parsed) as Proposal
    } catch {
      // 單一提案資料損毀：不拋出例外，回傳 null 讓 UI 顯示「資料損毀」提示
      return null
    }
  }

  saveProposal(proposal: Proposal): void {
    const toSave: Proposal = { ...proposal, schemaVersion: SCHEMA_VERSION, updatedAt: new Date().toISOString() }
    try {
      localStorage.setItem(PROPOSAL_KEY(proposal.id), JSON.stringify(toSave))
      const ids = this.readIndex()
      if (!ids.includes(proposal.id)) {
        ids.push(proposal.id)
        this.writeIndex(ids)
      }
    } catch (err) {
      // 常見於 localStorage 容量爆滿（圖片太多），往外拋讓 UI 顯示「儲存失敗」
      throw new Error('STORAGE_QUOTA_EXCEEDED')
    }
  }

  deleteProposal(id: string): void {
    localStorage.removeItem(PROPOSAL_KEY(id))
    this.writeIndex(this.readIndex().filter((x) => x !== id))
  }

  duplicateProposal(id: string): Proposal | null {
    const original = this.getProposal(id)
    if (!original) return null
    const now = new Date().toISOString()
    const copy: Proposal = {
      ...original,
      id: crypto.randomUUID(),
      client: { ...original.client, proposalName: `${original.client.proposalName}（複本）` },
      createdAt: now,
      updatedAt: now
    }
    this.saveProposal(copy)
    return copy
  }

  exportProposalJSON(id: string): string | null {
    const p = this.getProposal(id)
    if (!p) return null
    return JSON.stringify(p, null, 2)
  }

  importProposalJSON(json: string): Proposal {
    let parsed: Proposal
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('INVALID_JSON')
    }
    if (!parsed.client || !Array.isArray(parsed.slides)) {
      throw new Error('INVALID_PROPOSAL_FORMAT')
    }
    const now = new Date().toISOString()
    const imported: Proposal = {
      ...parsed,
      id: crypto.randomUUID(),
      schemaVersion: SCHEMA_VERSION,
      createdAt: parsed.createdAt ?? now,
      updatedAt: now
    }
    this.saveProposal(imported)
    return imported
  }

  exportAllJSON(): string {
    const ids = this.readIndex()
    const all = ids.map((id) => this.getProposal(id)).filter(Boolean)
    return JSON.stringify({ schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), proposals: all }, null, 2)
  }

  importAllJSON(json: string): { imported: number; skipped: number } {
    let parsed: { proposals?: Proposal[] }
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('INVALID_JSON')
    }
    let imported = 0
    let skipped = 0
    for (const p of parsed.proposals ?? []) {
      try {
        this.saveProposal({ ...p, id: p.id ?? crypto.randomUUID() })
        imported++
      } catch {
        skipped++
      }
    }
    return { imported, skipped }
  }
}

export const proposalStorage: IProposalStorage = new LocalStorageProposalService()
