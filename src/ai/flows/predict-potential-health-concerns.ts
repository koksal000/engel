// Use server directive.
'use server';

/**
 * @fileOverview Analyzes an image to predict potential health concerns and disabilities.
 *
 * - predictPotentialHealthConcerns - A function that takes an image data URI and returns a list of potential health concerns.
 * - PredictPotentialHealthConcernsInput - The input type for the predictPotentialHealthConcerns function.
 * - PredictPotentialHealthConcernsOutput - The return type for the predictPotentialHealthConcerns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictPotentialHealthConcernsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  name: z.string().describe('The name of the person in the image.'),
  surname: z.string().describe('The surname of the person in the image.'),
});
export type PredictPotentialHealthConcernsInput = z.infer<typeof PredictPotentialHealthConcernsInputSchema>;

const PredictPotentialHealthConcernsOutputSchema = z.object({
  ageEstimate: z.string().describe('The estimated age of the person.'),
  humanLikenessPercentage: z.string().describe('The percentage of human likeness in the image.'),
  potentialDisabilities: z.array(z.string()).describe('A list of potential disabilities (physical, mental, neurological).'),
  affectedBodyAreas: z.array(z.string()).describe('Areas of the body where disabilities are most likely indicated.'),
  healthConcerns: z.array(z.string()).describe('A list of potential health concerns based on the image analysis.'),
});
export type PredictPotentialHealthConcernsOutput = z.infer<typeof PredictPotentialHealthConcernsOutputSchema>;

export async function predictPotentialHealthConcerns(input: PredictPotentialHealthConcernsInput): Promise<PredictPotentialHealthConcernsOutput> {
  return predictPotentialHealthConcernsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPotentialHealthConcernsPrompt',
  input: {schema: PredictPotentialHealthConcernsInputSchema},
  output: {schema: PredictPotentialHealthConcernsOutputSchema},
  prompt: `You are an expert in analyzing images to predict potential health concerns and disabilities.

  Analyze the following image and provide a report with potential health concerns and possible disabilities.
  Consider factors such as age, physical appearance, and any visible indicators of health issues.

  Name: {{{name}}}
  Surname: {{{surname}}}
  Photo: {{media url=photoDataUri}}

  Format the output as a JSON object with the following keys:
  - ageEstimate: The estimated age of the person.
  - humanLikenessPercentage: The percentage of human likeness in the image.
  - potentialDisabilities: A list of potential disabilities (physical, mental, neurological).
  - affectedBodyAreas: Areas of the body where disabilities are most likely indicated, based on visible signs like posture or unusual features.
  - healthConcerns: A list of potential health concerns based on the image analysis.
`,
});

const predictPotentialHealthConcernsFlow = ai.defineFlow(
  {
    name: 'predictPotentialHealthConcernsFlow',
    inputSchema: PredictPotentialHealthConcernsInputSchema,
    outputSchema: PredictPotentialHealthConcernsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
