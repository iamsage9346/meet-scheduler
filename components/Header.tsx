'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Meet Scheduler
        </Link>
        <div className="flex gap-1">
          <Link
            href="/"
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            )}
          >
            Create
          </Link>
          <Link
            href="/my-rooms"
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/my-rooms'
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            )}
          >
            My Rooms
          </Link>
        </div>
      </nav>
    </header>
  );
}
