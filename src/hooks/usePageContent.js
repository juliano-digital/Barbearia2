import { useEffect, useState } from 'react';
import { getPageContent } from '../services/siteContentService';

export const usePageContent = (page) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const loadContent = () => getPageContent(page)
      .then((data) => {
        if (active) setContent(data);
      })
      .catch((loadError) => {
        console.error(`Erro ao carregar conteúdo da página "${page}":`, loadError);
        if (active) setError(loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    loadContent();

    const handlePageContentUpdate = (event) => {
      if (event.detail?.page === page || event.detail?.page === 'all') loadContent();
    };

    window.addEventListener('demo-content-updated', handlePageContentUpdate);
    window.addEventListener('site-content-updated', handlePageContentUpdate);

    return () => {
      active = false;
      window.removeEventListener('demo-content-updated', handlePageContentUpdate);
      window.removeEventListener('site-content-updated', handlePageContentUpdate);
    };
  }, [page]);

  return { content, loading, error };
};
