
import { Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/site-logo'; // Updated to SiteLogo

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <SiteLogo size="text-4xl" />
      <Loader2 className="h-12 w-12 animate-spin mt-8 text-accent" />
      <p className="mt-4 text-lg text-foreground">Bakırköy Engellilik Değerlendirme Merkezi Yükleniyor...</p>
    </div>
  );
}
