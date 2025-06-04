import { Loader2 } from 'lucide-react';
import { AwareAssistLogo } from '@/components/aware-assist-logo';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <AwareAssistLogo size="text-4xl" />
      <Loader2 className="h-12 w-12 animate-spin mt-8 text-accent" />
      <p className="mt-4 text-lg text-foreground">Loading AwareAssist...</p>
    </div>
  );
}
