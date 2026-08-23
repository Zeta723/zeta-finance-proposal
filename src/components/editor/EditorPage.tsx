import React, { useState } from 'react'
import type { Proposal } from '../../types'
import { useProposalEditor } from '../../store/useProposalEditor'
import { EditorToolbar } from './EditorToolbar'
import { SlideListPanel } from './SlideListPanel'
import { SlidePreviewPanel } from './SlidePreviewPanel'
import { ContentEditPanel } from './ContentEditPanel'
import { NewSlideModal } from './NewSlideModal'
import { FullPreviewModal } from './FullPreviewModal'
import { MissingDataModal } from './MissingDataModal'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { useToast } from '../common/Toast'
import { checkMissingData, exportProposalToPptx, exportProposalToKeynotePptx } from '../../export/pptxExport'
import { exportProposalToPdf } from '../../export/pdfExport'
import { proposalStorage } from '../../services/storageService'
import { Menu, PanelRight, X } from 'lucide-react'
import { createSlide } from '../../data/slideDefaults'
import { ExportProgressModal } from './ExportProgressModal'

interface Props {
  initialProposal: Proposal
  onBack: () => void
}

export function EditorPage({ initialProposal, onBack }: Props) {
  const editor = useProposalEditor(initialProposal)
  const { showToast } = useToast()

  const [newSlideOpen, setNewSlideOpen] = useState(false)
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [missingIssues, setMissingIssues] = useState<ReturnType<typeof checkMissingData> | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null)
  const [pendingExportMode, setPendingExportMode] = useState<'editable' | 'keynote' | 'pdf' | null>(null)
  const [mobilePanel, setMobilePanel] = useState<'list' | 'preview' | 'edit'>('preview')

  const runExport = async (mode: 'editable' | 'keynote' | 'pdf') => {
    setIsExporting(true)
    try {
      if (mode === 'editable') {
        await exportProposalToPptx(editor.proposal)
        showToast('可編輯 PowerPoint 已匯出。', 'success')
      } else if (mode === 'keynote') {
        await exportProposalToKeynotePptx(editor.proposal)
        showToast('Keynote 相容 PowerPoint 已匯出。', 'success')
      } else {
        await exportProposalToPdf(editor.proposal, (p) => setPdfProgress(p))
        showToast('PDF 已匯出。', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast(mode === 'pdf' ? '匯出 PDF 失敗，請稍後再試一次。' : '匯出 PowerPoint 失敗，請稍後再試一次。', 'error')
    } finally {
      setIsExporting(false)
      setPdfProgress(null)
    }
  }

  const handleExportClick = (mode: 'editable' | 'keynote' | 'pdf') => {
    const issues = checkMissingData(editor.proposal)
    if (issues.length > 0) {
      setPendingExportMode(mode)
      setMissingIssues(issues)
    } else {
      void runExport(mode)
    }
  }

  const handleExportJSON = () => {
    const json = proposalStorage.exportProposalJSON(editor.proposal.id) ?? JSON.stringify(editor.proposal, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${editor.proposal.client.proposalName || 'proposal'}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('已匯出 JSON 檔案。', 'success')
  }

  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar
        proposalName={editor.proposal.client.proposalName}
        saveStatus={editor.saveStatus}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onBack={onBack}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onExportJSON={handleExportJSON}
        onExportEditable={() => handleExportClick('editable')}
        onExportKeynote={() => handleExportClick('keynote')}
        onExportPdf={() => handleExportClick('pdf')}
        isExporting={isExporting}
      />

      {/* 桌面版：三欄式版面 */}
      <div className="hidden md:flex flex-1 min-h-0">
        <div className="w-64 shrink-0 min-h-0">
          <SlideListPanel
            slides={editor.proposal.slides}
            activeSlideId={editor.activeSlideId}
            defaultTheme={editor.proposal.themeSettings.defaultTheme}
            onSelect={editor.setActiveSlideId}
            onReorder={editor.reorderSlides}
            onDuplicate={editor.duplicateSlide}
            onToggleHide={editor.toggleHideSlide}
            onDelete={(id) => setDeleteTarget(id)}
            onAddSlide={() => setNewSlideOpen(true)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SlidePreviewPanel
            slides={editor.proposal.slides}
            activeSlideId={editor.activeSlideId}
            defaultTheme={editor.proposal.themeSettings.defaultTheme}
            onSelect={editor.setActiveSlideId}
            onOpenFullPreview={() => setFullPreviewOpen(true)}
          />
        </div>
        <div className="w-96 shrink-0 min-h-0 border-l border-zeta-bg bg-white overflow-y-auto p-4">
          {editor.activeSlide ? (
            <ContentEditPanel
              slide={editor.activeSlide}
              defaultTheme={editor.proposal.themeSettings.defaultTheme}
              onDataChange={(data) => editor.updateSlideData(editor.activeSlide!.id, data)}
              onLayoutChange={(layoutId) => editor.updateSlideLayout(editor.activeSlide!.id, layoutId)}
              onThemeChange={(theme) => editor.updateSlideTheme(editor.activeSlide!.id, theme)}
            />
          ) : (
            <div className="text-sm text-zeta-text/40 text-center py-10">請先選擇或新增一個頁面</div>
          )}
        </div>
      </div>

      {/* 手機／平板版：分頁切換 */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          {mobilePanel === 'list' && (
            <SlideListPanel
              slides={editor.proposal.slides}
              activeSlideId={editor.activeSlideId}
              defaultTheme={editor.proposal.themeSettings.defaultTheme}
              onSelect={(id) => { editor.setActiveSlideId(id); setMobilePanel('preview') }}
              onReorder={editor.reorderSlides}
              onDuplicate={editor.duplicateSlide}
              onToggleHide={editor.toggleHideSlide}
              onDelete={(id) => setDeleteTarget(id)}
              onAddSlide={() => setNewSlideOpen(true)}
            />
          )}
          {mobilePanel === 'preview' && (
            <SlidePreviewPanel
              slides={editor.proposal.slides}
              activeSlideId={editor.activeSlideId}
              defaultTheme={editor.proposal.themeSettings.defaultTheme}
              onSelect={editor.setActiveSlideId}
              onOpenFullPreview={() => setFullPreviewOpen(true)}
            />
          )}
          {mobilePanel === 'edit' && (
            <div className="h-full overflow-y-auto p-4 bg-white">
              {editor.activeSlide ? (
                <ContentEditPanel
                  slide={editor.activeSlide}
                  defaultTheme={editor.proposal.themeSettings.defaultTheme}
                  onDataChange={(data) => editor.updateSlideData(editor.activeSlide!.id, data)}
                  onLayoutChange={(layoutId) => editor.updateSlideLayout(editor.activeSlide!.id, layoutId)}
                  onThemeChange={(theme) => editor.updateSlideTheme(editor.activeSlide!.id, theme)}
                />
              ) : (
                <div className="text-sm text-zeta-text/40 text-center py-10">請先選擇或新增一個頁面</div>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-zeta-bg bg-white flex">
          <button onClick={() => setMobilePanel('list')} className={`flex-1 py-2.5 text-xs flex flex-col items-center gap-0.5 ${mobilePanel === 'list' ? 'text-zeta-navy font-semibold' : 'text-zeta-text/50'}`}>
            <Menu size={16} /> 頁面
          </button>
          <button onClick={() => setMobilePanel('preview')} className={`flex-1 py-2.5 text-xs flex flex-col items-center gap-0.5 ${mobilePanel === 'preview' ? 'text-zeta-navy font-semibold' : 'text-zeta-text/50'}`}>
            <X size={0} className="hidden" />預覽
          </button>
          <button onClick={() => setMobilePanel('edit')} className={`flex-1 py-2.5 text-xs flex flex-col items-center gap-0.5 ${mobilePanel === 'edit' ? 'text-zeta-navy font-semibold' : 'text-zeta-text/50'}`}>
            <PanelRight size={16} /> 編輯
          </button>
        </div>
      </div>

      <NewSlideModal
        open={newSlideOpen}
        defaultTheme={editor.proposal.themeSettings.defaultTheme}
        onClose={() => setNewSlideOpen(false)}
        onConfirm={(type, layoutId) => {
          void createSlide // (工廠函式實際在 editor.addSlide 內使用)
          editor.addSlide(type, layoutId)
        }}
      />

      <FullPreviewModal
        open={fullPreviewOpen}
        slides={editor.proposal.slides}
        defaultTheme={editor.proposal.themeSettings.defaultTheme}
        onClose={() => setFullPreviewOpen(false)}
      />

      <MissingDataModal
        open={!!missingIssues}
        issues={missingIssues ?? []}
        onBack={() => { setMissingIssues(null); setPendingExportMode(null) }}
        onContinue={() => {
          const mode = pendingExportMode
          setMissingIssues(null)
          setPendingExportMode(null)
          if (mode) void runExport(mode)
        }}
      />

      <ExportProgressModal open={!!pdfProgress} current={pdfProgress?.current ?? 0} total={pdfProgress?.total ?? 0} label="正在產生 PDF…" />

      <ConfirmDialog
        open={!!deleteTarget}
        title="刪除頁面"
        message="確定要刪除這個頁面嗎？此操作可以透過「復原」恢復。"
        confirmLabel="刪除"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) editor.deleteSlide(deleteTarget); setDeleteTarget(null) }}
      />
    </div>
  )
}
