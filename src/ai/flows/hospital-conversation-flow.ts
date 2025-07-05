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
import { AnalyzeImageForDisabilitiesOutputSchema } from './analyze-image-for-disabilities';


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

export const HospitalConsultantOutputSchema = z.string().describe("The consultant's response in Turkish.");
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
- **Potansiyel Engel Türleri:** {{#each patientAnalysis.disabilityTypes}}{{{this}}}{{/each}}
- **Ön Değerlendirme Raporu:** {{{patientAnalysis.report}}}

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
    const { output } = await consultantPrompt(input);
    return output || "Üzgünüm, şu anda bir sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.";
  }
);
