import { useParams } from 'react-router';
import { InboxView } from '@/features/inbox/InboxView';

export default function ConversationPage() {
  const { conversationId = '' } = useParams();
  return <InboxView selectedId={conversationId} />;
}
