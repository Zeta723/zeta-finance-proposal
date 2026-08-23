import React, { useState } from 'react'
import type { Proposal } from './types'
import { ProposalListPage } from './components/home/ProposalListPage'
import { EditorPage } from './components/editor/EditorPage'
import { ToastProvider } from './components/common/Toast'
import { proposalStorage } from './services/storageService'
import { buildSampleProposal } from './data/sampleProposal'

const SEEDED_KEY = 'zeta.seeded.v1'

/** 第一次啟動時，寫入一份可刪除的示範提案，方便使用者立即體驗完整流程 */
function ensureSampleProposalSeeded() {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return
    const existing = proposalStorage.listSummaries()
    if (existing.length === 0) {
      proposalStorage.saveProposal(buildSampleProposal())
    }
    localStorage.setItem(SEEDED_KEY, '1')
  } catch {
    // 寫入失敗也不影響網站啟動（例如無痕模式封鎖 localStorage）
  }
}

function AppContent() {
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null)

  React.useEffect(() => {
    ensureSampleProposalSeeded()
  }, [])

  if (activeProposal) {
    return <EditorPage initialProposal={activeProposal} onBack={() => setActiveProposal(null)} />
  }
  return <ProposalListPage onOpenProposal={setActiveProposal} />
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
