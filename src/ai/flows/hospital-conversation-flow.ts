'use server';

/**
 * @fileOverview A conversational AI agent for hospital consultancy.
 * 
 * - hospitalConsultant - A function that handles the conversation with the patient.
 * - HospitalConsultantInput - The input type for the hospitalConsultant function.
 * - HospitalConsultantOutput - The return type for the hospitalConsultant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// NOTE: This schema is duplicated from analyze-image-for-disabilities.ts
// to avoid exporting a non-function from a 'use server' file.
const AnalyzeImageForDisabilitiesOutputSchema = z.object({
  estimatedAge: z.number().describe('Tahmini yaş.'),
  humanLikenessPercentage: z.number().min(0).max(100).describe('İnsan benzerlik yüzdesi (0-100).'),
  potentialDisabilities: z.array(z.string()).describe('Potansiyel engellerin bir listesi (Türkçe).'),
  disabilityPercentage: z.number().min(0).max(100).describe('Tahmini engellilik yüzdesi (0-100) (Türkçe).'),
  disabilityTypes: z.array(z.string()).optional().describe('Belirlenen engellilik türleri (örneğin, zihinsel, fiziksel, nörolojik, duyusal, gelişimsel, diğer) (Türkçe).'),
  affectedBodyAreas: z.array(z.string()).describe('Etkilenen vücut bölgelerinin bir listesi (Türkçe).'),
  redLightAreas: z.array(z.object({
    x: z.number().min(0).max(100).describe('Soldan X koordinatı yüzdesi (0-100)'),
    y: z.number().min(0).max(100).describe('Üstten Y koordinatı yüzdesi (0-100)'),
    description: z.string().optional().describe('Vurgulanan alanın isteğe bağlı Türkçe açıklaması.')
  })).describe("Görüntü üzerinde kırmızı ışıklarla vurgulanacak koordinatların (x, y yüzdeleri) bir listesi. Açıklamalar Türkçe olmalıdır."),
  report: z.string().describe('Analizin kapsamlı bir raporu (Türkçe). Bu rapor kişinin genel durumu, olası engelleri, bu engellerin türleri (zihinsel, fiziksel, nörolojik vb.), etkilenen vücut bölgeleri ve genel sağlık içgörülerini detaylı bir şekilde açıklamalıdır. Mümkünse, tahmini bir engellilik yüzdesi belirtilmelidir.'),
});


const ConversationHistorySchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const HospitalConsultantInputSchema = z.object({
  patientAnalysis: AnalyzeImageForDisabilitiesOutputSchema.extend({
      name: z.string(),
      surname: z.string(),
  }).describe("The initial analysis data of the patient."),
  conversationHistory: z.array(ConversationHistorySchema).describe("The history of the conversation so far."),
});
export type HospitalConsultantInput = z.infer<typeof HospitalConsultantInputSchema>;

const HospitalConsultantOutputSchema = z.string().describe("The consultant's response in Turkish.");
export type HospitalConsultantOutput = z.infer<typeof HospitalConsultantOutputSchema>;


export async function hospitalConsultant(input: HospitalConsultantInput): Promise<HospitalConsultantOutput> {
  return hospitalConsultantFlow(input);
}


const consultantPrompt = ai.definePrompt({
    name: 'hospitalConsultantPrompt',
    input: { schema: HospitalConsultantInputSchema },
    output: { schema: HospitalConsultantOutputSchema },
    prompt: `Sen, Bakırköy Ruh ve Sinir Hastalıkları Hastanesi'nde görevli, Deniz Tuğrul adında bir danışmansın. Görevin, ön değerlendirme raporu sonuçları hakkında hastalarla empatik, bilgilendirici ve profesyonel bir telefon görüşmesi yapmaktır.

# GÖREVİN
- Hastayı adıyla selamla ({{patientAnalysis.name}} {{patientAnalysis.surname}}).
- Yaptığın aramanın nedeninin, yapay zeka destekli ön değerlendirme başvurusunun onaylanması olduğunu ve bu konuda bilgi vermek olduğunu belirt.
- Asla bir doktor olmadığını, sadece bir danışman olduğunu vurgula. Verdiğin bilgilerin tıbbi tavsiye olmadığını, sadece raporu anlamasına yardımcı olmak olduğunu belirt.
- Hastanın ön değerlendirme raporunu biliyorsun. Raporun detayları aşağıdadır.
- Konuşmayı kısa ve net tut. Amacın hastayı randevuya yönlendirmek veya sorularını yanıtlamaktır.
- Konuşma geçmişini takip et ve önceki söylenenleri hatırla.

# HASTA RAPOR BİLGİLERİ
- **Ad Soyad:** {{patientAnalysis.name}} {{patientAnalysis.surname}}
- **Tahmini Yaş:** {{patientAnalysis.estimatedAge}}
- **Potansiyel Engellilik Yüzdesi:** {{patientAnalysis.disabilityPercentage}}%
- **Potansiyel Engel Türleri:** {{#if patientAnalysis.disabilityTypes}}{{#each patientAnalysis.disabilityTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Belirtilmemiş{{/if}}
- **Ön Değerlendirme Raporu Özeti:** {{{patientAnalysis.report}}}

# KONUŞMA GEÇMİŞİ
{{#each conversationHistory}}
**{{role}}:** {{{text}}}
{{/each}}

# YANITIN
Sıradaki cevabını ver. Cevapların kısa, anlaşılır ve profesyonel Türkçe olsun.`,
});


const hospitalConsultantFlow = ai.defineFlow(
  {
    name: 'hospitalConsultantFlow',
    inputSchema: HospitalConsultantInputSchema,
    outputSchema: HospitalConsultantOutputSchema,
  },
  async (input) => {
    // If conversation is empty, it's the first turn. Create a greeting.
    if (input.conversationHistory.length === 0) {
        const greeting = `Merhaba ${input.patientAnalysis.name} ${input.patientAnalysis.surname}, ben Deniz Tuğrul. Bakırköy Engellilik Değerlendirme Merkezi'nden arıyorum. Yapmış olduğunuz başvuru onaylandı, sonuçlarınız hakkında konuşmak için müsaitseniz size bilgi vermek isterim.`;
        return greeting;
    }
    
    const { output } = await consultantPrompt(input);
    return output || "Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.";
  }
);
