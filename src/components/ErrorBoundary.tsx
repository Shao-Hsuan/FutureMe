import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 當子組件拋出錯誤時更新狀態
    return { 
      hasError: true, 
      error: error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 你也可以將錯誤信息記錄到錯誤報告服務
    console.error("錯誤詳情:", error, errorInfo);
    this.setState({
      errorInfo: errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 你可以自定義錯誤顯示界面
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-200">
            <div className="mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-center mb-2">應用程序出錯了</h2>
            <p className="text-gray-600 text-center mb-4">我們遇到了一些問題，請嘗試重新載入頁面</p>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 font-medium">錯誤信息:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-auto max-h-32 mt-1">
                {this.state.error?.toString()}
              </code>
            </div>

            <div className="flex justify-center">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => window.location.reload()}
              >
                重新載入頁面
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 如果沒有錯誤，正常渲染子組件
    return this.props.children;
  }
}

export default ErrorBoundary;
