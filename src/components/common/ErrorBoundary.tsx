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
      <div className="rounded-lg border border-negative bg-negative-soft p-6 text-center">
        <h3 className="text-base font-medium text-text">Halaman ini gagal dimuat</h3>
        <p className="mt-1.5 text-xs text-text-muted">
          Data Anda tidak terpengaruh. Pindah ke menu lain, atau muat ulang halaman.
        </p>
        <p className="mt-2 text-[11px] text-text-subtle break-all">{error.message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-lg text-xs font-medium text-accent hover:bg-accent-soft transition cursor-pointer"
          >
            Coba lagi
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition cursor-pointer"
          >
            Muat ulang
          </button>
        </div>
      </div>
    )
  }
}
