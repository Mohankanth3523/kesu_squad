import { PlannedPage } from '../PlannedPage';

export default function AdminAmaPage() {
  return (
    <PlannedPage
      title="Manage Ask Me Anything"
      description="Pick questions and link them to the video, Short or post that answers them."
      step="Step 6"
      wireframe="list"
      requirements="AMA-02, AMA-03"
      planned={[
        'Submitted, selected and answered queues',
        'Attach an answer link or text',
        'Remove abusive questions',
      ]}
    />
  );
}
