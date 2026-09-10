import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Menahan crash render di satu view supaya sidebar/header tetap hidup.
 * Dipakai dengan `key={activeTab}` agar state error reset saat pindah tab.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // oxlint-disable-next-line no-console -- boundary harus tetap melaporkan error ke console
    console.error('Render error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="rounded-3xl border border-[#f6c7c4] bg-[#fce8e6] p-6 text-center">
        <h3 className="text-base font-medium text-[#1f1f1f]">Halaman ini gagal dimuat</h3>
        <p className="mt-1.5 text-xs text-[#444746]">
          Data Anda tidak terpengaruh. Pindah ke menu lain, atau muat ulang halaman.
        </p>
        <p className="mt-2 text-[11px] text-[#747775] break-all">{error.message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition cursor-pointer"
          >
            Coba lagi
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] transition cursor-pointer"
          >
            Muat ulang
          </button>
        </div>
      </div>
    )
  }
}
