
// Use server directive.
'use server';

/**
 * @fileOverview Analyzes an image to estimate age, identify potential disabilities, and highlight affected body areas with coordinates.
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
  estimatedAge: z.number().describe('The estimated age of the person.'),
  humanLikenessPercentage: z.number().min(0).max(100).describe('The percentage of human likeness (0-100).'),
  potentialDisabilities: z.array(z.string()).describe('A list of potential disabilities in Turkish.'),
  affectedBodyAreas: z.array(z.string()).describe('A list of affected body areas in Turkish.'),
  redLightAreas: z.array(z.object({
    x: z.number().min(0).max(100).describe('X coordinate as a percentage from the left (0-100)'),
    y: z.number().min(0).max(100).describe('Y coordinate as a percentage from the top (0-100)'),
    description: z.string().optional().describe('Optional Turkish description of the highlighted area.')
  })).describe("A list of coordinates (x, y percentages) on the image to highlight with red lights. Descriptions must be in Turkish."),
  report: z.string().describe('A comprehensive report of the analysis in Turkish.'),
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
All your textual output, including 'potentialDisabilities', 'affectedBodyAreas', 'report', and any 'description' within 'redLightAreas', MUST be in Turkish.

Analyze the following image of {{name}} {{surname}} to estimate their age, identify potential disabilities, and highlight affected body areas. Provide a comprehensive report of the analysis.

Photo: {{media url=photoDataUri}}

Consider factors like wrinkles, posture, body shape, and other indicators to determine potential health concerns.

Output the estimated age as a number.
Output the human likeness percentage as a number (0-100).
Output 'potentialDisabilities' as a list of Turkish strings.
Output 'affectedBodyAreas' as a list of Turkish strings.
Output 'redLightAreas' as a list of objects. Each object must have 'x' and 'y' keys, representing percentage coordinates (0-100) on the image for placing a red light (e.g., { "x": 30, "y": 45 }). Each object can also have an optional 'description' key with a brief Turkish explanation for that specific highlighted point. These points should indicate areas of concern on the image.
Create a comprehensive 'report' in Turkish summarizing the analysis, including any health insights.

Ensure the output is well-formatted and easy to understand.
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

```