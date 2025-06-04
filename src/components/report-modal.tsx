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
import { AlertCircle, CalendarDays, Clock, Hospital, Loader2, Stethoscope, User, Users } from 'lucide-react';
import type { AnalysisResult } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: AnalysisResult | null;
}

const doctors = [
  "Prof. Dr. Ayşe Yılmaz - Psikiyatri Uzmanı",
  "Doç. Dr. Mehmet Özcan - Nöroloji Uzmanı",
  "Uzm. Dr. Zeynep Kaya - Ruh Sağlığı ve Hastalıkları",
  "Dr. Ali Demir - Genel Psikiyatri",
];

export function ReportModal({ isOpen, onClose, reportData }: ReportModalProps) {
  const { toast } = useToast();
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00');
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralSubmitted, setReferralSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReferralSubmitted(false); 
      setIsSubmittingReferral(false);
      // Set default appointment date to today or tomorrow if today is past working hours logic could be added here
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
    ageEstimate,
    humanLikenessPercentage,
    potentialDisabilities,
    affectedBodyAreas,
    healthConcerns,
  } = reportData;

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReferral(true);
    
    setTimeout(() => {
      toast({
        title: `Referral Submitted for ${name} ${surname}`,
        description: `Sayın ${name} ${surname}, engelli olduğunuz için geçmiş olsunlarımızı iletiyor ve hastanemize başarıyla başvurduğunuzu bildirmek istiyoruz, saygılarımızla ~Bakırköy Ruh ve Sinir Hastalıkları Hastanesi Profesyonel Destek`,
        duration: 8000, 
      });
      setIsSubmittingReferral(false);
      setReferralSubmitted(true);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline text-center text-primary">Analysis Report for {name} {surname}</DialogTitle>
              <DialogDescription className="text-center">
                This report provides an AI-generated analysis based on the uploaded image.
              </DialogDescription>
            </DialogHeader>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><User className="text-accent"/> Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong className="font-medium">Name:</strong> {name} {surname}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Stethoscope className="text-accent"/> Image Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <p className="font-medium mb-2 text-muted-foreground">Uploaded Image:</p>
                    <div className="relative w-full aspect-square max-w-xs mx-auto md:mx-0">
                     <Image
                        src={photoDataUri}
                        alt={`Uploaded image of ${name} ${surname}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg object-cover border shadow-md"
                        data-ai-hint="person photo"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Highlighted Areas of Concern:</p>
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
                      <p className="text-sm text-muted-foreground">No specific areas highlighted by the AI.</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <p><strong className="font-medium">Estimated Age:</strong> {ageEstimate}</p>
                    <p><strong className="font-medium">Human Likeness:</strong> {humanLikenessPercentage}</p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Potential Disabilities:</p>
                  {potentialDisabilities && potentialDisabilities.length > 0 ? (
                    <ul className="list-disc list-inside pl-1 space-y-1 mt-1">
                      {potentialDisabilities.map((disability, index) => (
                        <li key={index} className="text-sm">{disability}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific potential disabilities identified.</p>
                  )}
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Potential Health Concerns:</p>
                  {healthConcerns && healthConcerns.length > 0 ? (
                    <ul className="list-disc list-inside pl-1 space-y-1 mt-1">
                      {healthConcerns.map((concern, index) => (
                        <li key={index} className="text-sm">{concern}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific health concerns identified.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Hospital className="text-accent"/> Hospital Referral Simulation</CardTitle>
                <DialogDescription>
                  Simulate a referral to Bakırköy Psychiatric Hospital.
                </DialogDescription>
              </CardHeader>
              <CardContent>
                {referralSubmitted ? (
                  <div className="text-center p-4 bg-secondary border border-border rounded-md animate-pulse-once">
                    <h3 className="text-lg font-semibold text-primary">Referral Submitted Successfully!</h3>
                    <p className="text-sm text-muted-foreground mt-1">Details have been sent via toast notification.</p>
                    <Button onClick={onClose} variant="outline" className="mt-4">Close Report</Button>
                  </div>
                ) : (
                <form onSubmit={handleReferralSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" value={`${name} ${surname}`} readOnly className="bg-muted"/>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointmentDate">Appointment Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {appointmentDate ? format(appointmentDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={appointmentDate}
                            onSelect={setAppointmentDate}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="appointmentTime">Appointment Time</Label>
                      <Input 
                        id="appointmentTime" 
                        type="time" 
                        value={appointmentTime} 
                        onChange={(e) => setAppointmentTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="doctor">Select Doctor</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger id="doctor">
                        <SelectValue placeholder="Select a doctor" />
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
                        Submitting Referral...
                      </>
                    ) : (
                      'Refer to Hospital'
                    )}
                  </Button>
                </form>
                )}
              </CardContent>
            </Card>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose}>Close Report</Button>
            </DialogFooter>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
