// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllApplications } from '@/lib/db';
import type { ApplicationData } from '@/lib/db';
import { Loader2, CheckCircle, XCircle, FileSearch, User, Calendar, Stethoscope, MessageSquareWarning } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ReportModal } from '@/components/report-modal';

export default function GecmisBasvurularPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ApplicationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    const apps = await getAllApplications();
    setApplications(apps.sort((a, b) => b.id - a.id));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewReport = (app: ApplicationData) => {
    setSelectedReport(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Geçmiş Başvurular Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary">Geçmiş Başvurular ve Sonuçlar</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Yapılan tüm test başvurularını ve durumlarını buradan takip edebilirsiniz.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <FileSearch className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">Henüz Kayıtlı Başvuru Bulunmuyor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Yeni bir engellilik testi yaptığınızda sonuçlar buraya eklenecektir.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Card key={app.id} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl flex items-center gap-2"><User className="w-5 h-5 text-accent" /> {app.name} {app.surname}</CardTitle>
                  {app.referral && (
                    <Badge variant={app.referral.status === 'onaylandı' ? 'default' : 'destructive'} className="whitespace-nowrap">
                      {app.referral.status === 'onaylandı' ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                      {app.referral.status === 'onaylandı' ? 'Onaylandı' : 'Reddedildi'}
                    </Badge>
                  )}
                </div>
                {app.referral && (
                   <CardDescription className="flex items-center gap-2 pt-2"><Calendar className="w-4 h-4" /> Randevu: {format(new Date(app.referral.date), 'dd MMMM yyyy, HH:mm', { locale: tr })}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                 {app.referral && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                           <Stethoscope className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                           <span><span className="font-medium">Doktor:</span> {app.referral.doctor}</span>
                        </div>
                        {app.referral.status === 'reddedildi' && app.referral.reason && (
                           <div className="flex items-start gap-2 p-2 bg-destructive/10 border-l-4 border-destructive rounded">
                                <MessageSquareWarning className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                                <span><span className="font-medium">Gerekçe:</span> {app.referral.reason}</span>
                           </div>
                        )}
                    </div>
                 )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleViewReport(app)}>
                  <FileSearch className="w-4 h-4 mr-2" />
                  Raporu Görüntüle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={closeModal}
          reportData={selectedReport}
        />
      )}
    </div>
  );
}
