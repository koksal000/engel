// Use server directive.
'use server';

/**
 * @fileOverview Analyzes an image to estimate age, identify potential disabilities, and highlight affected body areas.
 *
 * - analyzeImageForDisabilities - A function that handles the image analysis process.
 * - AnalyzeImageForDisabilitiesInput - The input type for the analyzeImageForDisabilities function.
 * - AnalyzeImageForDisabilitiesOutput - The return type for the analyzeImageForDisabilities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageForDisabilitiesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  name: z.string().describe('The name of the person in the image.'),
  surname: z.string().describe('The surname of the person in the image.'),
});
export type AnalyzeImageForDisabilitiesInput = z.infer<typeof AnalyzeImageForDisabilitiesInputSchema>;

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
export type AnalyzeImageForDisabilitiesOutput = z.infer<typeof AnalyzeImageForDisabilitiesOutputSchema>;

export async function analyzeImageForDisabilities(input: AnalyzeImageForDisabilitiesInput): Promise<AnalyzeImageForDisabilitiesOutput> {
  return analyzeImageForDisabilitiesFlow(input);
}

const analyzeImageForDisabilitiesPrompt = ai.definePrompt({
  name: 'analyzeImageForDisabilitiesPrompt',
  input: {schema: AnalyzeImageForDisabilitiesInputSchema},
  output: {schema: AnalyzeImageForDisabilitiesOutputSchema},
  prompt: `You are a highly specialized AI medical expert with a focus on remote visual assessment for preliminary disability identification. Your task is to conduct a detailed and comprehensive analysis of the provided image.
All your textual output, including 'potentialDisabilities', 'affectedBodyAreas', 'report', 'disabilityTypes', and any 'description' within 'redLightAreas', MUST be in professional, formal Turkish.

Analyze the following image of {{name}} {{surname}} to estimate their age, identify potential disabilities, and highlight affected body areas. Your analysis must be thorough, objective, and presented in a structured, official report format.

Photo: {{media url=photoDataUri}}

**Analysis Factors:**
You must consider a wide range of visual indicators, including but not limited to:
- **Physical:** Posture, gait (if discernible), body symmetry/asymmetry, muscle tone, limb shape, joint appearance, skin condition.
- **Neurological/Developmental:** Facial expressions, eye contact, coordination indicators, involuntary movements, head position.
- **General Health:** Overall physical condition, signs of distress or comfort, and any visible assistive devices (e.g., glasses, hearing aids, mobility aids).

**Output Requirements:**

1.  **\`estimatedAge\`**: (number) Your best estimate of the person's age.
2.  **\`humanLikenessPercentage\`**: (number) The percentage of human likeness in the image (0-100).
3.  **\`potentialDisabilities\`**: (array of strings) A high-level list of potential disabilities identified (in Turkish).
4.  **\`disabilityPercentage\`**: (number) An estimated overall disability percentage (0-100). You must provide an estimate, even if it is a low percentage. If no disability is detected, provide 0.
5.  **\`disabilityTypes\`**: (array of strings, optional) A list of specific disability categories observed (e.g., "Fiziksel", "Zihinsel", "Nörolojik", "Duyusal", "Gelişimsel", "Diğer").
6.  **\`affectedBodyAreas\`**: (array of strings) A list of body areas where indicators of disability are most pronounced (in Turkish).
7.  **\`redLightAreas\`**: (array of objects) A list of coordinates on the image to highlight with a red light. Each object must have \`x\` and \`y\` (0-100) and an optional \`description\` (in Turkish) explaining the concern at that point.

**Comprehensive Report (\`report\`):**
This is the most critical part of your output. The report must be written in formal Turkish and structured with the following sections:

---
**ÖN DEĞERLENDİRME RAPORU**

**Hasta Bilgileri:**
- **Adı Soyadı:** {{name}} {{surname}}
- **Tahmini Yaş:** [Your estimated age here]

**1. Genel Gözlemler ve Fiziksel Durum Analizi:**
   - Provide a detailed description of the individual's appearance in the image. Mention posture, physical build, facial features, and any other notable objective observations.

**2. Potansiyel Engellilik Belirtileri ve Kategorizasyon:**
   - Based on your observations, detail the potential signs of disability.
   - For each sign, explain your reasoning and link it to a potential disability type (Fiziksel, Zihinsel, Nörolojik, Duyusal, Gelişimsel). For instance, "Gözlemlenen duruş bozukluğu, kas-iskelet sistemi ile ilgili potansiyel bir fiziksel engele işaret edebilir."
   - Discuss the potential impact of these signs on the individual's daily life.

**3. Etkilenen Vücut Bölgeleri ve Risk Değerlendirmesi:**
   - Clearly list the body parts or systems that appear to be affected.
   - Explain why these areas are flagged, referencing the \`redLightAreas\` if applicable.

**4. Genel Sağlık İçgörüleri:**
   - Provide broader insights into the person's potential overall health based on the visual evidence. This is not a diagnosis but a holistic observation.

**5. Sonuç ve Öneriler:**
   - Summarize the key findings of the preliminary analysis.
   - Provide the estimated disability percentage here.
   - **Crucially, end with a strong and clear disclaimer:** "Bu rapor, yapay zeka tarafından bir görüntüye dayanarak oluşturulmuş bir ön değerlendirmedir ve hiçbir şekilde tıbbi bir teşhis niteliği taşımaz. Kesin tanı, tedavi ve resmi engellilik tespiti için mutlaka yetkili bir sağlık kuruluşuna ve uzman doktorlara başvurulması gerekmektedir."
---

Ensure the output is well-formatted, easy to understand, and maintains an official, professional tone throughout.
  `,
});

const analyzeImageForDisabilitiesFlow = ai.defineFlow(
  {
    name: 'analyzeImageForDisabilitiesFlow',
    inputSchema: AnalyzeImageForDisabilitiesInputSchema,
    outputSchema: AnalyzeImageForDisabilitiesOutputSchema,
  },
  async input => {
    const {output} = await analyzeImageForDisabilitiesPrompt(input);
    return output!;
  }
);
