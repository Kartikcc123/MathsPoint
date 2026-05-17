import { useEffect, useRef } from 'react';

const useRefreshOnFocus = (refresh) => {
  const refreshRef = useRef(refresh);

  const lastRefreshTime = useRef(0);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const triggerRefresh = () => {
      const now = Date.now();
      // Throttle: only refresh if more than 5 seconds have passed
      if (now - lastRefreshTime.current > 5000) {
        lastRefreshTime.current = now;
        if (refreshRef.current) {
          refreshRef.current();
        }
      }
    };

    triggerRefresh();

    const handleFocus = () => {
      triggerRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerRefresh();
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
