import type { ProposalCategory } from '../types'
import { newId, nowISO } from './idGenerator'

const CATEGORIES_KEY = 'zeta.categories.v1'

/**
 * 分類服務：獨立於提案資料存放（不寫進 proposal 本身），這樣刪除分類時
 * 只需要更新分類清單本身，不需要逐一改寫每份受影響的提案。
 * 提案透過 `Proposal.categoryId` 參照分類；分類被刪除後，
 * 讀取端（ProposalListPage）會把找不到對應分類的提案視為「未分類」。
 */
function readCategories(): ProposalCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCategories(categories: ProposalCategory[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export function listCategories(): ProposalCategory[] {
  return readCategories()
}

export function createCategory(name: string): ProposalCategory {
  const category: ProposalCategory = { id: newId(), name, createdAt: nowISO() }
  const categories = readCategories()
  writeCategories([...categories, category])
  return category
}

export function renameCategory(id: string, name: string): void {
  const categories = readCategories()
  writeCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)))
}

/** 刪除分類：分類內的專案不會被刪除，只是分類 id 從此找不到對應分類，讀取端會自動視為「未分類」 */
export function deleteCategory(id: string): void {
  const categories = readCategories()
  writeCategories(categories.filter((c) => c.id !== id))
}
