import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border-2 border-[#D1D5DB] rounded-3xl p-8 max-w-md shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] text-[#DC2626] mx-auto flex items-center justify-center">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-[26px] font-extrabold text-[#0A192F] leading-tight">
                Don't worry, Eleanor.
              </h2>
              <p className="text-[17px] font-bold text-gray-700 mt-2">
                The application encountered a small pause. Your records and caregiver Sarah remain safely connected.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-4 px-6 rounded-2xl bg-[#1A56DB] text-white font-extrabold text-[19px] flex items-center justify-center gap-2 hover:bg-[#1546b5] active:scale-98 transition-all shadow-md"
            >
              <RefreshCw className="w-6 h-6" />
              <span>Tap to Return to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
