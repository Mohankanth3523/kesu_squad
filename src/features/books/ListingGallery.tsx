import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { ListingPhoto } from '@/types/domain';
import { BookCover } from './BookCover';

/** Main image plus thumbnails. Falls back to the typographic cover when there are no photos. */
export function ListingGallery({ title, author, photos, tone = 'gold' }: { title: string; author: string; photos: ListingPhoto[]; tone?: 'gold' | 'champagne' }) {
  const [index, setIndex] = useState(0);
  const current = photos[index];
  return (
    <div className="md:sticky md:top-24 md:self-start">
      <BookCover title={title} author={author} photo={current} tone={tone} size="lg" className="w-full" />
      {photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Photos">
          {photos.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn('block overflow-hidden rounded-md border', i === index ? 'border-gold' : 'border-line hover:border-line-strong')}
              >
                <img src={p.src} alt="" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {photos.length === 0 && <p className="mt-3 text-center text-xs text-muted">No photos yet — ask the seller for some.</p>}
    </div>
  );
}
