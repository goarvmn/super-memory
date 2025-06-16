// client/src/pages/NotFound.tsx

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button asChild>
            <Link to={ROUTES.DASHBOARD}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
