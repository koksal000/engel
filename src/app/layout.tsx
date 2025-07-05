
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { CallProvider } from '@/context/call-context';

export const metadata: Metadata = {
  title: 'Bakırköy Engellilik Değerlendirme Merkezi - Online Test Platformu',
  description: 'Bakırköy Engellilik Değerlendirme Merkezi resmi web sitesi. Yapay zeka destekli ön engellilik analizi ve sağlık içgörüleri.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        <CallProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="text-center py-6 text-sm text-muted-foreground border-t bg-card">
              <p>&copy; {new Date().getFullYear()} Bakırköy Engellilik Değerlendirme Merkezi. Tüm hakları saklıdır.</p>
              <p className="mt-1">Bu platform yalnızca bilgilendirme ve simülasyon amaçlıdır ve tıbbi tavsiye niteliği taşımaz. Kesin tanı ve tedavi için lütfen yetkili sağlık kuruluşlarına başvurunuz.</p>
            </footer>
            <Toaster />
        </CallProvider>
      </body>
    </html>
  );
}
