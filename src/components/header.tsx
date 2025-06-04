import { AwareAssistLogo } from '@/components/aware-assist-logo';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-6 shadow-md bg-card">
      <div className="container mx-auto">
        <Link href="/">
          <AwareAssistLogo />
        </Link>
      </div>
    </header>
  );
}
