'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if not already on the signin page
    if (status === 'unauthenticated' && pathname !== '/auth/signin') {
      router.push('/auth/signin');
    }
  }, [status, router, pathname]);

  // Show loading if still loading
  if (status === 'loading') {
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // If on signin page and unauthenticated, render the signin page
  if (status === 'unauthenticated' && pathname === '/auth/signin') {
    return <>{children}</>;
  }

  // Show error if not authenticated and not on signin page
  if (status === 'unauthenticated') {
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Please sign in to continue</div>
      </div>
    );
  }

  // Don't show header if session is null
  if (!session?.user) {
    return (
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-blue-900 flex flex-col">
      <Header user={session.user} />
      <div className="flex-1 flex justify-center items-center">{children}</div>
    </div>
  );
}
