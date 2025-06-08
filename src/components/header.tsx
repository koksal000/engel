
'use client';

import Link from 'next/link';
import { SiteLogo } from '@/components/site-logo';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Added SheetHeader, SheetTitle
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Engellilik Testi', href: '/' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Sağlık Raporu Bilgilendirme', href: '/saglik-raporu-bilgilendirme' },
  { label: 'İletişim', href: '/iletisim' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="py-4 px-6 shadow-md bg-card sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <SiteLogo size="text-xl md:text-2xl" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground hover:text-primary transition-colors",
                ((pathname === item.href && item.href !== '/') || (pathname === '/' && item.href === '/' && item.label === 'Anasayfa')) && "text-primary font-semibold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menüyü aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-6 flex flex-row items-center justify-between border-b space-y-0">
                  <SheetTitle>
                    <SiteLogo size="text-lg" />
                  </SheetTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Menüyü kapat</span>
                  </Button>
                </SheetHeader>
                <nav className="flex-grow p-6 space-y-4">
                  {navItems.map((item) => (
                     <Link
                      key={item.href + item.label + "-mobile"}
                      href={item.href}
                      className={cn(
                        "block py-2 text-base font-medium text-foreground hover:text-primary transition-colors",
                         ((pathname === item.href && item.href !== '/') || (pathname === '/' && item.href === '/' && item.label === 'Anasayfa')) && "text-primary font-semibold"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
