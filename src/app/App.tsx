import { MotionConfig } from 'framer-motion';
import { RouterProvider } from 'react-router';
import { ToastProvider } from '@/components/ui';
import { SessionProvider } from './providers/SessionProvider';
import { router } from './router';

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </SessionProvider>
    </MotionConfig>
  );
}
