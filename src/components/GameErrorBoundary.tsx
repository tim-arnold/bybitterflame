"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for the play page. Catches render-time errors (e.g. from
 * a malformed gamestate parse result) and shows a recovery UI instead of
 * crashing the entire page.
 */
export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[GameErrorBoundary] Render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-950 px-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <p className="text-xs uppercase tracking-widest text-stone-500">Something went wrong</p>
            <h1 className="text-2xl font-bold text-[var(--color-gold)]">The realm has gone dark</h1>
            <p className="text-stone-400 text-sm">
              An unexpected error occurred. Your progress has been auto-saved. Reload the page to
              continue your adventure.
            </p>
            {this.state.error && (
              <p className="text-stone-600 text-xs font-mono bg-stone-900 rounded p-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-stone-900 hover:bg-stone-800 border border-[var(--color-gold)]/60 text-[var(--color-gold)] text-sm font-medium px-4 py-3 rounded-lg transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
