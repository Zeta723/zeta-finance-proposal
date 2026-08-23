import React from 'react'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; message?: string }

/** 全域錯誤邊界：避免任何未捕捉例外讓整個網站白屏 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown) {
    console.error('[ZetaApp] Uncaught error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zeta-bg p-6">
          <div className="max-w-md w-full bg-white rounded-card shadow-soft p-8 text-center">
            <h1 className="text-xl font-semibold text-zeta-navy mb-2">發生了一點問題</h1>
            <p className="text-sm text-zeta-text/70 mb-6">
              頁面出現非預期的錯誤，你的提案資料仍保留在瀏覽器中。請重新整理頁面再試一次。
            </p>
            <button
              className="px-5 py-2 rounded-full bg-zeta-navy text-white text-sm hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              重新整理
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
