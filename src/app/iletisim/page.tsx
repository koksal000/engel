

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function IletisimPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-primary">İletişim</h1>
      <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Bize Ulaşın</h2>
          <p className="text-muted-foreground">
            Bakırköy Engellilik Değerlendirme Merkezi ile ilgili sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki formu kullanabilir veya iletişim bilgilerimizden bize ulaşabilirsiniz.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-accent" />
              <p className="text-foreground">Zuhuratbaba Mah. Dr. Tevfik Sağlam Cad. No:25/2, 34147 Bakırköy/İstanbul</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-accent" />
              <p className="text-foreground">(0212) 409 15 15 (Santral)</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-accent" />
              <p className="text-foreground">bilgi@bakirkoyengellilikmerkezi.gov.tr (Örnek E-posta)</p>
            </div>
          </div>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">İletişim Formu</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Adınız Soyadınız</Label>
                <Input id="name" placeholder="Adınız ve soyadınız" />
              </div>
              <div>
                <Label htmlFor="email">E-posta Adresiniz</Label>
                <Input id="email" type="email" placeholder="ornek@eposta.com" />
              </div>
              <div>
                <Label htmlFor="subject">Konu</Label>
                <Input id="subject" placeholder="Mesajınızın konusu" />
              </div>
              <div>
                <Label htmlFor="message">Mesajınız</Label>
                <Textarea id="message" placeholder="Lütfen mesajınızı buraya yazın..." rows={5} />
              </div>
              <Button type="submit" className="w-full">Mesajı Gönder</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">Harita Konumumuz</h2>
        <div className="aspect-video rounded-lg overflow-hidden border shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.601170490171!2d28.86991981538007!3d40.9880549793037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cabd5b546a753d%3A0x97489217356a0770!2sProf.%20Dr.%20Mazhar%20Osman%20Ruh%20Sa%C4%9Fl%C4%B1%C4%9F%C4%B1%20ve%20Sinir%20Hastal%C4%B1klar%C4%B1%20E%C4%9Fitim%20ve%20Ara%C5%9Ft%C4%B1rma%20Hastanesi!5e0!3m2!1str!2str!4v1620308890588!5m2!1str!2str"
            width="100%"
            height="100%"
            style={{ border:0 }}
            allowFullScreen={false}
            loading="lazy"
            title="Bakırköy Ruh ve Sinir Hastalıkları Hastanesi Konumu"
            referrerPolicy="no-referrer-when-downgrade"
            data-ai-hint="map location"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
