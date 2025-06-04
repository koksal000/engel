

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Info, ShieldCheck } from "lucide-react";

export default function SaglikRaporuBilgilendirmePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-primary">Sağlık Raporu ve Engellilik Değerlendirmesi Bilgilendirme</h1>
      <div className="max-w-4xl mx-auto space-y-8 text-lg text-foreground">
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Info className="text-accent"/> Bu Platform Hakkında Önemli Bilgi</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Bu web sitesinde sunulan "Engellilik Testi", yapay zeka destekli bir ön analiz aracıdır. Amacı, kullanıcılara yükledikleri görüntüler üzerinden potansiyel sağlık durumları ve olası engellilik belirtileri hakkında genel bir fikir vermektir.
            </p>
            <p className="mt-2 font-semibold text-destructive">
              Bu test ve sonuçları, kesin bir tıbbi teşhis veya sağlık raporu yerine geçmez. Yalnızca bilgilendirme ve farkındalık artırma amaçlıdır.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><FileText className="text-accent"/> Resmi Engellilik Sağlık Kurulu Raporu</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Türkiye'de engellilik durumunun resmi olarak tespit edilmesi ve engellilere tanınan haklardan yararlanılabilmesi için yetkili sağlık kuruluşlarından (devlet hastaneleri, üniversite hastaneleri) "Engelli Sağlık Kurulu Raporu" alınması gerekmektedir.
            </p>
            <p className="mt-2">
              Bu rapor, çeşitli uzman doktorların muayene ve değerlendirmeleri sonucunda, Engellilik Ölçütü, Sınıflandırması ve Engellilere Verilecek Sağlık Kurulu Raporları Hakkında Yönetmelik hükümlerine göre düzenlenir.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Raporlar, bireyin engel durumu ve oranını belirtir.</li>
              <li>Sosyal haklar, eğitim, istihdam gibi konularda bu rapor esas alınır.</li>
              <li>Başvuru süreci ve gerekli belgeler hakkında bilgi almak için ilgili sağlık kuruluşlarına veya Aile ve Sosyal Hizmetler Bakanlığı'nın yerel birimlerine başvurabilirsiniz.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><ShieldCheck className="text-accent"/> Veri Gizliliği ve Güvenliği</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Platformumuza yüklediğiniz kişisel veriler ve görüntüler, gizlilik politikamız çerçevesinde korunmaktadır. Analiz sonuçları yalnızca sizinle paylaşılır ve üçüncü taraflarla paylaşılmaz. Ancak, internet üzerinden yapılan hiçbir veri aktarımının %100 güvenli olamayacağını lütfen unutmayın.
            </p>
          </CardContent>
        </Card>
        
        <p className="mt-10 text-center text-muted-foreground">
          Sağlığınızla ilgili herhangi bir endişeniz varsa veya engellilik durumu hakkında detaylı bilgi ve resmi bir rapor almak istiyorsanız, lütfen yetkili bir sağlık kuruluşuna ve uzman bir doktora başvurunuz.
        </p>
      </div>
    </div>
  );
}
