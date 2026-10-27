import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Kesh Squad` : 'Kesh Squad — Welcome, Amigos!';
  }, [title]);
}
