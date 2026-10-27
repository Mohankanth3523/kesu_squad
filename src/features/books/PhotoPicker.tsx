import { useId, useRef, useState } from 'react';
import { Icon, IconButton } from '@/components/ui';
import { LIMITS } from '@/domain/constants';
import type { ListingPhoto } from '@/types/domain';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

/** Resize to a small JPEG so prototype photos fit in browser storage. EXIF is dropped by the canvas. */
async function toSmallDataUrl(file: File, maxSide = 720): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.72);
}

/**
 * Photo upload with type/size validation and previews.
 * Prototype: photos are shrunk and kept in this browser. Milestone B uploads to Supabase Storage.
 */
export function PhotoPicker({ photos, onChange, bookTitle, error }: { photos: ListingPhoto[]; onChange: (photos: ListingPhoto[]) => void; bookTitle: string; error?: string }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState(false);
  const left = LIMITS.photos.max - photos.length;

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setProblem(undefined);
    const chosen = Array.from(files);
    const bad = chosen.find((f) => !ACCEPT.includes(f.type));
    if (bad) return setProblem(`“${bad.name}” isn’t a JPEG, PNG or WebP image.`);
    const big = chosen.find((f) => f.size > LIMITS.photos.maxBytes);
    if (big) return setProblem(`“${big.name}” is larger than 5 MB.`);
    if (chosen.length > left) return setProblem(`You can add ${left} more photo${left === 1 ? '' : 's'} (up to ${LIMITS.photos.max}).`);
    setBusy(true);
    try {
      const added = await Promise.all(
        chosen.map(async (f, i) => ({ id: `ph-${Date.now()}-${i}`, src: await toSmallDataUrl(f), alt: `Photo ${photos.length + i + 1} of ${bookTitle || 'the book'}` })),
      );
      onChange([...photos, ...added]);
    } catch {
      setProblem('One of those images couldn’t be read. Try a different file.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const message = problem ?? error;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-white">Photos</span>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {photos.map((p, i) => (
          <li key={p.id} className="relative">
            <img src={p.src} alt={p.alt} className="aspect-square w-full rounded-[var(--radius-field)] border border-line object-cover" />
            {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-ink/85 px-1.5 text-2xs text-champagne">Cover</span>}
            <IconButton
              icon="close"
              label={`Remove photo ${i + 1}`}
              size="sm"
              className="absolute -top-2 -right-2 size-7 bg-ink text-white ring-1 ring-line-strong"
              onClick={() => onChange(photos.filter((x) => x.id !== p.id))}
            />
          </li>
        ))}
        {left > 0 && (
          <li>
            <label
              htmlFor={inputId}
              className="grid aspect-square w-full cursor-pointer place-items-center rounded-[var(--radius-field)] border border-dashed border-line-strong text-mist transition-colors hover:border-gold hover:text-champagne focus-within:border-gold"
            >
              <span className="flex flex-col items-center gap-1 text-xs">
                <Icon name={busy ? 'loading' : 'upload'} />
                {busy ? 'Adding…' : 'Add photo'}
              </span>
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={ACCEPT.join(',')}
                multiple
                className="sr-only"
                onChange={(e) => void add(e.target.files)}
                aria-describedby={`${inputId}-hint`}
              />
            </label>
          </li>
        )}
      </ul>
      {message ? (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : (
        <p id={`${inputId}-hint`} className="text-sm text-muted">
          Up to {LIMITS.photos.max} JPEG, PNG or WebP images, 5 MB each. Show the cover, spine and any damage. The first photo is the cover.
        </p>
      )}
    </div>
  );
}
