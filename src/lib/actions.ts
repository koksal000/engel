
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
  // disabilityPercentage and disabilityTypes are already in AnalyzeImageForDisabilitiesOutput and optional
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
