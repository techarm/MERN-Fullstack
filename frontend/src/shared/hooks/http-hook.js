import { useCallback, useState, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(async (url, options = {}) => {
    setLoading(true);
    const httpAbortCtrl = new AbortController();
    activeHttpRequests.current.push(httpAbortCtrl);

    try {
      const { method, body, headers } = options;
      const response = await fetch(url, {
        method,
        body,
        headers,
        signal: httpAbortCtrl.signal,
      });
      const responseData = await response.json();

      activeHttpRequests.current = activeHttpRequests.current.filter(
        (reqCtrl) => reqCtrl !== httpAbortCtrl
      );

      if (!response.ok) {
        throw new Error(responseData.message);
      }
      setLoading(false);
      return responseData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
