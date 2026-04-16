import { useEffect, useRef } from 'react';

const useRefreshOnFocus = (refresh) => {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    refreshRef.current();

    const handleFocus = () => {
      refreshRef.current();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

export default useRefreshOnFocus;
