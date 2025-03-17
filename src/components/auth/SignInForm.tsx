import { useState } from 'react';
import { signIn } from '../../services/auth';
import { AlertCircle } from 'lucide-react';

interface SignInFormProps {
  setError: (error: string | undefined) => void;
}

export default function SignInForm({ setError }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string>();

  const validateForm = () => {
    if (!email) {
      setFormError('請輸入電子郵件');
      return false;
    }
    if (!password) {
      setFormError('請輸入密碼');
      return false;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('請輸入有效的電子郵件格式');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    setError(undefined);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await signIn(email, password);
      if (!data.session) {
        throw new Error('登入失敗，請稍後再試');
      }
      // Let AuthForm handle the navigation
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('登入失敗，請稍後再試');
      }
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">電子郵件</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError(undefined);
            }}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="電子郵件"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">密碼</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormError(undefined);
            }}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="密碼"
            disabled={isLoading}
            minLength={6}
          />
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span>登入中...</span>
            </>
          ) : (
            '登入'
          )}
        </button>
      </div>
    </form>
  );
}