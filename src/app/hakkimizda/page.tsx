
// 'use client' required if using client components like useState, useEffect, or event handlers.
// For a static page, it might not be needed, but good practice for consistency if interactivity is added later.

export default function HakkimizdaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10 text-primary">Hakkımızda</h1>
      <div className="max-w-3xl mx-auto space-y-6 text-lg text-foreground">
        <p>
          Bakırköy Engellilik Değerlendirme Merkezi olarak, bireylerin yaşam kalitesini artırmak ve toplumsal farkındalığı yükseltmek amacıyla en son teknolojileri kullanarak kapsamlı engellilik ön değerlendirme hizmetleri sunmaktayız.
        </p>
        <p>
          Platformumuz, yapay zeka destekli analizlerle kullanıcılara potansiyel sağlık durumları ve engellilik riskleri hakkında ön bilgi sağlamayı hedefler. Bu analizler, tıbbi bir teşhis niteliği taşımaz; ancak, bireylerin sağlık durumları hakkında daha bilinçli olmalarına ve gerektiğinde profesyonel tıbbi yardım aramalarına yardımcı olmak için tasarlanmıştır.
        </p>
        <p>
          Misyonumuz, erişilebilir ve kullanıcı dostu bir platform aracılığıyla, engellilik konusunda erken farkındalık oluşturmak ve bireyleri doğru sağlık yönlendirmeleri için teşvik etmektir.
        </p>
        <p>
          Vizyonumuz, teknolojiyi insan odaklı bir yaklaşımla birleştirerek, engellilik değerlendirme süreçlerinde yenilikçi çözümler sunan öncü bir kurum olmaktır.
        </p>
        <p className="mt-8 text-center text-muted-foreground">
          Bu sayfa ve platformdaki içerikler bilgilendirme amaçlıdır. Sağlık sorunlarınız için lütfen doktorunuza danışınız.
        </p>
      </div>
    </div>
  );
}
