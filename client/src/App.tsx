import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { queryClient } from './lib/query-client';
import { router } from './routes';
import { UserProvider } from './contexts/UserContext';
import { NavigationProvider } from './contexts/NavigationContext';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <NavigationProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </NavigationProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
