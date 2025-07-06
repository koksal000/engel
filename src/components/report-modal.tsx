'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CalendarDays, FileText, Hospital, Loader2, User, Info, Brain, Percent, ListChecks } from 'lucide-react';
import type { AnalysisResult } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { addApplication } from '@/lib/db';
import type { ApplicationData } from '@/lib/db';
import { useCall } from '@/context/call-context';


interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: (AnalysisResult & { id?: number }) | null;
}

const doctors = [
  "Prof. Dr. Ayşe Yılmaz - Psikiyatri Uzmanı",
  "Doç. Dr. Mehmet Özcan - Nöroloji Uzmanı",
  "Uzm. Dr. Zeynep Kaya - Ruh Sağlığı ve Hastalıkları",
  "Dr. Ali Demir - Genel Psikiyatri",
];

const rejectionReasons = [
    "Doktor şu anda meşgul, lütfen daha sonra tekrar deneyin.",
    "Sistemsel bir hata nedeniyle başvuru işlemi tamamlanamadı.",
    "Başvuru bilgileri eksik veya hatalı.",
    "Yoğunluk nedeniyle randevu verilememektedir.",
];

export function ReportModal({ isOpen, onClose, reportData }: ReportModalProps) {
  const { toast } = useToast();
  const { scheduleCall } = useCall();
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00');
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralSubmitted, setReferralSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReferralSubmitted(false);
      setIsSubmittingReferral(false);
      const today = new Date();
      if(appointmentDate && appointmentDate < today && !(appointmentDate.toDateString() === today.toDateString())){
         setAppointmentDate(today);
      } else if (!appointmentDate) {
         setAppointmentDate(today);
      }
    }
  }, [isOpen, appointmentDate]);

  if (!reportData) return null;

  const {
    name,
    surname,
    photoDataUri,
    estimatedAge,
    humanLikenessPercentage,
    potentialDisabilities,
    affectedBodyAreas,
    redLightAreas,
    report,
    disabilityPercentage,
    disabilityTypes,
  } = reportData;

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReferral(true);

    const isApproved = Math.random() < 0.5; // 50% chance of approval
    const status = isApproved ? 'onaylandı' : 'reddedildi';
    const randomReason = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
    
    const applicationData: Omit<ApplicationData, 'id'> = {
        ...reportData,
        referral: {
            doctor: selectedDoctor,
            date: appointmentDate || new Date(),
            time: appointmentTime,
            status: status,
            reason: status === 'reddedildi' ? randomReason : undefined,
        }
    };

    try {
        const newId = await addApplication(applicationData);
        const finalApplicationData = { ...applicationData, id: newId };

        toast({
            title: "Başvurunuz Gönderildi",
            description: "Başvuru sürecini ve kabul durumunu 'Geçmiş Başvurular' bölümünden kontrol edebilirsiniz.",
            variant: "default",
            duration: 8000, 
        });

        if (finalApplicationData.referral?.status === 'onaylandı') {
            // Schedule the call for 30-60 seconds later
            const randomDelay = (Math.floor(Math.random() * 31) + 30) * 1000;
            scheduleCall(finalApplicationData, randomDelay);
        }

        setReferralSubmitted(true);
    } catch (error) {
        console.error("Veritabanına kaydetme hatası:", error);
        toast({
            title: "Hata",
            description: "Başvuru kaydedilirken bir hata oluştu.",
            variant: "destructive"
        });
    } finally {
        setIsSubmittingReferral(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <ScrollArea className="max-h-[90vh]">
        <TooltipProvider>
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline text-center text-primary">{name} {surname} İçin Ön Değerlendirme Raporu</DialogTitle>
              <DialogDescription className="text-center">
                Bu rapor, yüklenen görüntüye dayanarak yapay zeka tarafından oluşturulmuş bir ön analiz sunmaktadır. Kesin tanı için lütfen bir sağlık kuruluşuna başvurunuz.
              </DialogDescription>
            </DialogHeader>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><User className="text-accent"/> Hasta Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong className="font-medium">Adı Soyadı:</strong> {name} {surname}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Brain className="text-accent"/> Görüntü Analizi ve Ön Değerlendirme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <p className="font-medium mb-2 text-muted-foreground">Yüklenen Görüntü:</p>
                    <div className="relative w-full aspect-square max-w-xs mx-auto md:mx-0 rounded-lg border shadow-md overflow-hidden">
                     <Image
                        src={photoDataUri}
                        alt={`${name} ${surname} adlı kişinin yüklenen görüntüsü`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        data-ai-hint="person photo"
                      />
                      {redLightAreas && redLightAreas.length > 0 && redLightAreas.map((area, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <div
                              className="flashing-light"
                              style={{
                                top: `${area.y}%`,
                                left: `${area.x}%`,
                              }}
                            />
                          </TooltipTrigger>
                          {area.description && (
                            <TooltipContent>
                              <p>{area.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Vurgulanan Sorunlu Alanlar (Metinsel):</p>
                    {affectedBodyAreas && affectedBodyAreas.length > 0 ? (
                      <ul className="list-none p-0 space-y-1.5 mt-1">
                        {affectedBodyAreas.map((area, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <AlertCircle className="h-4 w-4 mr-2 text-destructive flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Yapay zeka tarafından metinsel olarak vurgulanan belirli bir alan bulunmamaktadır.</p>
                    )}
                    {redLightAreas && redLightAreas.filter(area => area.description).length > 0 && (
                       <>
                        <p className="font-medium text-muted-foreground mt-4">Görüntü Üzerinde İşaretlenen Noktalar:</p>
                         <ul className="list-none p-0 space-y-1.5 mt-1">
                           {redLightAreas.map((area, index) => area.description && (
                             <li key={`desc-${index}`} className="flex items-center text-sm">
                               <div className="w-3 h-3 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
                               {area.description}
                             </li>
                           ))}
                         </ul>
                       </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <p><strong className="font-medium">Tahmini Yaş:</strong> {estimatedAge}</p>
                    <p><strong className="font-medium">İnsan Benzerlik Oranı:</strong> {humanLikenessPercentage}%</p>
                </div>

                {disabilityPercentage !== undefined && (
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-accent" />
                    <p><strong className="font-medium">Tahmini Engellilik Yüzdesi:</strong> {disabilityPercentage}%</p>
                  </div>
                )}

                {disabilityTypes && disabilityTypes.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground flex items-center gap-2"><ListChecks className="h-5 w-5 text-accent" /> Potansiyel Engellilik Türleri:</p>
                    <ul className="list-disc list-inside pl-1 space-y-1 mt-1">
                      {disabilityTypes.map((type, index) => (
                        <li key={index} className="text-sm">{type}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="font-medium text-muted-foreground">Potansiyel Engeller (Genel):</p>
                  {potentialDisabilities && potentialDisabilities.length > 0 ? (
                    <ul className="list-disc list-inside pl-1 space-y-1 mt-1">
                      {potentialDisabilities.map((disability, index) => (
                        <li key={index} className="text-sm">{disability}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belirli bir potansiyel engel tespit edilmedi.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {report && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><FileText className="text-accent"/> Detaylı Ön Değerlendirme Raporu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <p className="text-sm whitespace-pre-wrap">{report}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            { !reportData.id && (
            <>
            <Separator />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Hospital className="text-accent"/> Hastane Sevk Simülasyonu</CardTitle>
                <DialogDescription>
                  Bakırköy Engellilik Değerlendirme Merkezi'ne sevk simülasyonu yapın. Başvurunuzun %50 ihtimalle onaylanacağını ve onaylanırsa 30-60 saniye içinde bir danışmanın sizi arayacağını unutmayın.
                </DialogDescription>
              </CardHeader>
              <CardContent>
                {referralSubmitted ? (
                  <div className="text-center p-4 bg-secondary border border-border rounded-md">
                    <h3 className="text-lg font-semibold text-primary">Başvuru Sonucunuz İletildi!</h3>
                    <p className="text-sm text-muted-foreground mt-1">Detaylar bildirim yoluyla gönderilmiştir ve sonuçlar 'Geçmiş Başvurular' sayfasına eklenmiştir. Onaylandıysa, bir danışman sizinle iletişime geçecektir.</p>
                    <Button onClick={onClose} variant="outline" className="mt-4">Raporu Kapat</Button>
                  </div>
                ) : (
                <form onSubmit={handleReferralSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Hasta Adı Soyadı</Label>
                    <Input id="patientName" value={`${name} ${surname}`} readOnly className="bg-muted"/>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointmentDate">Randevu Tarihi</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {appointmentDate ? format(appointmentDate, "PPP", { locale: tr }) : <span>Bir tarih seçin</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={appointmentDate}
                            onSelect={setAppointmentDate}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                            locale={tr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="appointmentTime">Randevu Saati</Label>
                      <Input 
                        id="appointmentTime" 
                        type="time" 
                        value={appointmentTime} 
                        onChange={(e) => setAppointmentTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="doctor">Doktor Seçin (Örnek)</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger id="doctor">
                        <SelectValue placeholder="Bir doktor seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doc => (
                          <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmittingReferral}>
                    {isSubmittingReferral ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sevk Başvurusu Yapılıyor...
                      </>
                    ) : (
                      'Merkeze Sevk Simülasyonu Başlat'
                    )}
                  </Button>
                </form>
                )}
              </CardContent>
            </Card>
            </>
            )}

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose}>Raporu Kapat</Button>
            </DialogFooter>
          </div>
          </TooltipProvider>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
