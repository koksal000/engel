
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
  disabilityPercentage: z.number().min(0).max(100).optional().describe('Tahmini engellilik yüzdesi (0-100) (Türkçe).'),
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
  prompt: `You are an AI expert in analyzing images to estimate age, identify potential disabilities, and highlight affected body areas.
All your textual output, including 'potentialDisabilities', 'affectedBodyAreas', 'report', 'disabilityTypes', and any 'description' within 'redLightAreas', MUST be in Turkish.

Analyze the following image of {{name}} {{surname}} to estimate their age, identify potential disabilities, and highlight affected body areas.
Provide a comprehensive report of the analysis.

Photo: {{media url=photoDataUri}}

Consider factors like wrinkles, posture, body shape, and other indicators to determine potential health concerns.

Output the estimated age as a number.
Output the human likeness percentage as a number (0-100).
Output 'potentialDisabilities' as a list of Turkish strings.
Output 'affectedBodyAreas' as a list of Turkish strings.
Output 'redLightAreas' as a list of objects. Each object must have 'x' and 'y' keys, representing percentage coordinates (0-100) on the image for placing a red light (e.g., { "x": 30, "y": 45 }). Each object can also have an optional 'description' key with a brief Turkish explanation for that specific highlighted point. These points should indicate areas of concern on the image.

Output an optional 'disabilityPercentage' as a number (0-100), representing the estimated overall disability percentage.
Output optional 'disabilityTypes' as a list of Turkish strings (e.g., "zihinsel", "fiziksel", "nörolojik", "duyusal", "gelişimsel", "diğer").

Create a comprehensive 'report' in Turkish summarizing the analysis. This report MUST include:
- Detailed observations from the image.
- The estimated age and human likeness.
- A thorough discussion of potential disabilities and their specific indicators in the image.
- Identification of affected body areas.
- The estimated disability percentage, if determinable.
- The types of disabilities identified (e.g., mental, physical, neurological), if determinable.
- General health insights derived from the analysis.
- A concluding remark emphasizing that this is a preliminary analysis and professional medical consultation is necessary.

Ensure the output is well-formatted and easy to understand.
The report must be very comprehensive and sound official.
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
