import { Link } from 'react-router-dom';
import { FiCompass } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="glass mb-6 flex h-28 w-28 items-center justify-center rounded-full">
        <FiCompass className="text-5xl text-aurora" />
      </div>
      <h1 className="font-display text-7xl font-extrabold text-aurora">404</h1>
      <p className="mt-3 max-w-sm text-subtitle">
        This page drifted off into the aurora. Let's get you back to Shop Nova.
      </p>
      <Link to="/" className="btn-primary mt-8 rounded-xl px-8 py-3.5 font-semibold text-white">
        Back to Home
      </Link>
    </div>
  );
}