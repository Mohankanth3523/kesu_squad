import { PlannedPage } from '../PlannedPage';

export default function AdminVideosPage() {
  return (
    <PlannedPage
      title="Manage videos"
      description="Add, feature or hide YouTube videos, Shorts and Reels."
      step="Step 6"
      wireframe="table"
      requirements="VID-04"
      planned={[
        'Paste a link to add a video (pending OQ-11)',
        'Feature a video on Home',
        'Hide a video',
      ]}
    />
  );
}
