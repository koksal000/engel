'use server';

import { z } from 'zod';
import { predictPotentialHealthConcerns, type PredictPotentialHealthConcernsOutput, type PredictPotentialHealthConcernsInput } from '@/ai/flows/predict-potential-health-concerns';

const AnalysisFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  surname: z.string().min(1, 'Surname is required.'),
  photoDataUri: z.string().startsWith('data:image/', 'Invalid image data URI.'),
});

export type AnalysisResult = PredictPotentialHealthConcernsOutput & {
  name: string;
  surname: string;
  photoDataUri: string;
};

export async function performAnalysisAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string; data?: AnalysisResult; error?: string }> {
  const name = formData.get('name') as string;
  const surname = formData.get('surname') as string;
  const photoDataUri = formData.get('photoDataUri') as string;

  const validatedFields = AnalysisFormSchema.safeParse({
    name,
    surname,
    photoDataUri,
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      error: validatedFields.error.flatten().fieldErrors.toString(),
    };
  }

  const aiInput: PredictPotentialHealthConcernsInput = {
    name: validatedFields.data.name,
    surname: validatedFields.data.surname,
    photoDataUri: validatedFields.data.photoDataUri,
  };

  try {
    const result = await predictPotentialHealthConcerns(aiInput);
    return {
      message: 'Analysis successful.',
      data: {
        ...result,
        name: validatedFields.data.name,
        surname: validatedFields.data.surname,
        photoDataUri: validatedFields.data.photoDataUri,
      },
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      message: 'Analysis failed.',
      error: error instanceof Error ? error.message : 'An unknown error occurred during analysis.',
    };
  }
}
