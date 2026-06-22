import React from "react";
import { RiAlertLine, RiRefreshLine, RiHome4Line } from "react-icons/ri";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
          <div className="glass-card p-8 max-w-md w-full border-rose-500/20 flex flex-col items-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-3xl animate-bounce">
              <RiAlertLine />
            </div>
            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              An unexpected error occurred in this section. We have logged the error details.
            </p>
            {this.state.error && (
              <pre className="w-full bg-gray-950/80 p-3 rounded-lg border border-gray-900 font-mono text-[10px] text-rose-400 overflow-x-auto text-left max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5"
              >
                <RiRefreshLine /> Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5"
              >
                <RiHome4Line /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
