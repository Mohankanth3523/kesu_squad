import { Fragment } from 'react';
import { cn } from '@/lib/cn';

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"’”])/g;

/**
 * Renders user-written text safely: paragraphs from blank lines, line breaks kept,
 * http(s) links made clickable with rel="noopener noreferrer nofollow ugc". Never renders HTML.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={cn('space-y-3 break-words', className)}>
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.split('\n').map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line.split(URL_RE).map((part, k) =>
                k % 2 === 1 ? (
                  <a key={k} href={part} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-gold underline underline-offset-2 hover:text-champagne">
                    {part}
                  </a>
                ) : (
                  <Fragment key={k}>{part}</Fragment>
                ),
              )}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
