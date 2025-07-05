'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllCalls, type Call } from '@/lib/db';
import { Loader2, Phone, PhoneMissed, PhoneOff, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function GecmisAramalarPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      setIsLoading(true);
      const fetchedCalls = await getAllCalls();
      setCalls(fetchedCalls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsLoading(false);
    };

    fetchCalls();
  }, []);

  const getStatusProps = (status: Call['status']) => {
    switch (status) {
      case 'answered':
        return { icon: <Phone className="w-4 h-4 mr-1" />, text: 'Cevaplandı', variant: 'default' as const };
      case 'rejected':
        return { icon: <PhoneOff className="w-4 h-4 mr-1" />, text: 'Reddedildi', variant: 'destructive' as const };
      case 'missed':
        return { icon: <PhoneMissed className="w-4 h-4 mr-1" />, text: 'Cevapsız', variant: 'secondary' as const };
      default:
        return { icon: <Phone className="w-4 h-4 mr-1" />, text: 'Bilinmiyor', variant: 'outline' as const };
    }
  };
  
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0 sn';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins} dk ` : ''}${secs} sn`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Arama Geçmişi Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">Arama Geçmişi</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Danışmanlık merkezi tarafından yapılan tüm aramaları burada görebilirsiniz.
        </p>
      </div>

      {calls.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <PhoneMissed className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">Henüz Kayıtlı Arama Bulunmuyor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Onaylanan başvurular sonrası yapılan aramalar burada listelenir.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {calls.map((call) => {
            const statusProps = getStatusProps(call.status);
            return (
              <Card key={call.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl flex items-center gap-2"><User className="w-5 h-5 text-accent" /> {call.patientName}</CardTitle>
                    <Badge variant={statusProps.variant} className="whitespace-nowrap">
                      {statusProps.icon}
                      {statusProps.text}
                    </Badge>
                  </div>
                   <CardDescription className="flex items-center gap-2 pt-2"><Calendar className="w-4 h-4" /> {format(new Date(call.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {call.status === 'answered' && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4"/>
                        <span>Görüşme Süresi: {formatDuration(call.duration)}</span>
                     </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
