import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui';

export function NotFoundPage() {
  return (
    <MainLayout>
      <div className="text-center py-16">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button size="lg">Go Back Home</Button>
        </Link>
      </div>
    </MainLayout>
  );
}
