import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidMount() {
    // Capture errors that occur outside React render (e.g., async/Script load)
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleRejection);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface full error details for diagnostics without crashing to a blank screen
    console.error("Unexpected UI error:", error, info);
  }

  handleGlobalError = (event) => {
    if (event?.error) {
      this.setState({ hasError: true, error: event.error });
    }
  };

  handleRejection = (event) => {
    const reason = event?.reason instanceof Error ? event.reason : new Error(String(event?.reason ?? "Unknown error"));
    this.setState({ hasError: true, error: reason });
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Reload to ensure any transient script/asset issues are cleared
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-50 px-4">
          <div className="max-w-md w-full space-y-3 border border-cyan-800/70 bg-slate-900/70 rounded-2xl p-4 shadow-lg shadow-cyan-900/30">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="text-sm text-cyan-100/80">
              The app hit an unexpected error. Reload the page to try again. If the issue
              persists on Azure, confirm the build output is being served from the <code>dist</code>
              folder and that environment variables are configured for Supabase access.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-rose-100 bg-rose-900/50 border border-rose-700/60 rounded-xl px-3 py-2 break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-3 py-1.5 rounded-lg bg-cyan-300 text-slate-950 text-sm font-semibold shadow shadow-cyan-500/30"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-3 py-1.5 rounded-lg border border-cyan-800 text-cyan-100 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
