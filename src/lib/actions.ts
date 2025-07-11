'use server';

import { z } from 'zod';
import { analyzeImageForDisabilities, type AnalyzeImageForDisabilitiesOutput, type AnalyzeImageForDisabilitiesInput } from '@/ai/flows/analyze-image-for-disabilities';

const AnalysisFormSchema = z.object({
  name: z.string().min(1, 'Ad gereklidir.'),
  surname: z.string().min(1, 'Soyad gereklidir.'),
  photoDataUri: z.string().startsWith('data:image/', 'Geçersiz resim data URI.'),
});

export type AnalysisResult = AnalyzeImageForDisabilitiesOutput & {
  name: string;
  surname: string;
  photoDataUri: string;
};

export type AnalysisActionState = {
  message: string;
  data?: AnalysisResult;
  error?: string | null;
};

type PerformAnalysisActionInput = z.infer<typeof AnalysisFormSchema>;

export async function performAnalysisAction(
  input: PerformAnalysisActionInput
): Promise<AnalysisActionState> {
  const validatedFields = AnalysisFormSchema.safeParse(input);

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    let errorString = 'Doğrulama başarısız.';
    if (errorMessages.name) errorString += ` Ad: ${errorMessages.name.join(', ')}`;
    if (errorMessages.surname) errorString += ` Soyad: ${errorMessages.surname.join(', ')}`;
    if (errorMessages.photoDataUri) errorString += ` Fotoğraf: ${errorMessages.photoDataUri.join(', ')}`;

    return {
      message: 'Doğrulama başarısız.',
      error: errorString,
    };
  }

  const aiInput: AnalyzeImageForDisabilitiesInput = {
    name: validatedFields.data.name,
    surname: validatedFields.data.surname,
    photoDataUri: validatedFields.data.photoDataUri,
  };

  try {
    const result = await analyzeImageForDisabilities(aiInput);

    if (!result) {
        throw new Error("AI analysis did not return a result.");
    }

    return {
      message: 'Analiz başarılı.',
      data: {
        ...result,
        name: validatedFields.data.name,
        surname: validatedFields.data.surname,
        photoDataUri: validatedFields.data.photoDataUri,
      },
    };
  } catch (error) {
    console.error('AI Analiz Hatası:', error);
    return {
      message: 'Analiz başarısız oldu.',
      error: error instanceof Error ? error.message : 'Analiz sırasında bilinmeyen bir hata oluştu.',
    };
  }
}
