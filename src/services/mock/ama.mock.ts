import { LIMITS } from '@/domain/constants';
import { validateAmaQuestion } from '@/domain/validation';
import type { DbAma } from '@/data/schema';
import type { AmaQuestion } from '@/types/domain';
import { ServiceError } from '@/types/service';
import type { AmaService } from '../interfaces';
import { profileOf } from './mappers';
import { mockDb, newId, nowIso } from './mockDb';
import { command, invalid, query } from './mockUtils';
import { currentUserId, requireIdentity } from './session';

function toQuestion(a: DbAma): AmaQuestion {
  const { askerId, ...rest } = a;
  return { ...rest, asker: profileOf(mockDb.read(), askerId) };
}

export const mockAma: AmaService = {
  listAnswered: () =>
    query(
      'ama.listAnswered',
      () =>
        mockDb
          .read()
          .ama.filter((a) => a.status === 'answered')
          .sort((a, b) => (b.answeredAt ?? '').localeCompare(a.answeredAt ?? ''))
          .map(toQuestion),
      [],
    ),
  listMine: () =>
    query(
      'ama.listMine',
      () => {
        const me = currentUserId();
        if (!me) return [];
        return mockDb
          .read()
          .ama.filter((a) => a.askerId === me)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(toQuestion);
      },
      [],
    ),
  submit: (body) =>
    command('ama.submit', () => {
      const me = requireIdentity(); // Guests may ask (OQ-04 default).
      const error = validateAmaQuestion(body);
      if (error) invalid(error, { body: error });
      const today = mockDb.read().ama.filter((a) => a.askerId === me.id && Date.now() - new Date(a.createdAt).getTime() < 86_400_000).length;
      if (today >= LIMITS.amaPerDay) throw new ServiceError('rate_limited', `You can ask up to ${LIMITS.amaPerDay} questions a day. Try again tomorrow.`);
      const q = mockDb.write((d) => {
        const row: DbAma = { id: newId('a'), askerId: me.id, body: body.trim(), status: 'submitted', createdAt: nowIso() };
        d.ama.push(row);
        return row;
      });
      return toQuestion(q);
    }),
};
