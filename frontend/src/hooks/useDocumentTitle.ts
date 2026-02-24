import { useEffect } from 'react';

const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const prevTitle = document.title ?? 'Dashboard';
    document.title = title;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
