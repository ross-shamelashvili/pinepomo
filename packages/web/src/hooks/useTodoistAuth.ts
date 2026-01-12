import { useCallback, useEffect, useState } from 'react';

const TODOIST_API_KEY = 'pinepomo-todoist-api-key';

interface UseTodoistAuthReturn {
  apiKey: string | null;
  isConnected: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  validateKey: (key: string) => Promise<boolean>;
  isValidating: boolean;
}

export function useTodoistAuth(): UseTodoistAuthReturn {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TODOIST_API_KEY);
  });
  const [isValidating, setIsValidating] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(TODOIST_API_KEY, apiKey);
    } else {
      localStorage.removeItem(TODOIST_API_KEY);
    }
  }, [apiKey]);

  const validateKey = useCallback(async (key: string): Promise<boolean> => {
    if (!key.trim()) return false;

    setIsValidating(true);
    try {
      const response = await fetch('https://api.todoist.com/rest/v2/projects', {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key.trim() || null);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState(null);
  }, []);

  return {
    apiKey,
    isConnected: !!apiKey,
    setApiKey,
    clearApiKey,
    validateKey,
    isValidating,
  };
}
