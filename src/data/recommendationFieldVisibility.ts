import type { RecommendationData } from '../types'

/**
 * 判斷建議書／方案頁面的某個欄位是否要顯示在預覽／PDF／PPT／Keynote。
 * `showFields` 未設定該欄位時預設為顯示（true），確保既有提案的既有版面不受影響；
 * 使用者可在編輯器內取消勾選來隱藏該欄位。
 */
export function isRecFieldVisible(data: RecommendationData, key: keyof RecommendationData): boolean {
  return data.showFields?.[key] !== false
}
