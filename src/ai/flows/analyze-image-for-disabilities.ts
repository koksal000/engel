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
  estimatedAge: z.number().describe('The estimated age of the person.'),
  humanLikenessPercentage: z.number().describe('The percentage of human likeness.'),
  potentialDisabilities: z.array(z.string()).describe('A list of potential disabilities.'),
  affectedBodyAreas: z.array(z.string()).describe('A list of affected body areas.'),
  redLightAreas: z.array(z.string()).describe('A list of areas to highlight with red lights on the image.'),
  report: z.string().describe('A comprehensive report of the analysis.'),
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

  Analyze the following image of {{name}} {{surname}} to estimate their age, identify potential disabilities, and highlight affected body areas. Provide a comprehensive report of the analysis.

  Photo: {{media url=photoDataUri}}

  Consider factors like wrinkles, posture, body shape, and other indicators to determine potential health concerns.

  Output the estimated age as a number, the percentage of human likeness as a number, potential disabilities as a list of strings, affected body areas as a list of strings, and areas to highlight with red lights on the image as a list of strings. Also, create a comprehensive report summarizing the analysis.

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
