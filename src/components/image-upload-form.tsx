
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { performAnalysisAction, type AnalysisResult } from '@/lib/actions';
import Image from 'next/image';
import { AlertCircle, Loader2, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ImageUploadFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analiz Ediliyor...
        </>
      ) : (
        'Testi Başlat'
      )}
    </Button>
  );
}

export function ImageUploadForm({ onAnalysisComplete }: ImageUploadFormProps) {
  const [initialState, setInitialState] = useState<{ message: string; data?: AnalysisResult; error?: string } | null>(null);
  const [state, formAction, isPending] = useActionState(performAnalysisAction, null); // Changed useFormState to useActionState
  
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setPhotoDataUri(result); 
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setPhotoDataUri('');
    }
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('photoDataUri', photoDataUri); 

    // Manually call the server action logic
    // Note: The action state hook `formAction` can be used directly in form's action attribute.
    // However, to keep the `onAnalysisComplete` callback, we are calling it manually.
    const result = await performAnalysisAction(initialState, formData); 
    
    setInitialState(result); // Update local state for displaying messages/errors

    if (result.data) {
      onAnalysisComplete(result.data);
    }
  };


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Engellilik Analizi</CardTitle>
        <CardDescription className="text-center">
          Yapay zeka destekli bir analiz için bir resim yükleyin ve bilgilerinizi girin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ad</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Adınızı girin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Soyad</Label>
            <Input id="surname" name="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required placeholder="Soyadınızı girin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="photo">Fotoğraf Yükle</Label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              tabIndex={0}
              role="button"
              aria-label="Resim yükle"
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Resim önizlemesi" width={128} height={128} className="mx-auto h-32 w-32 object-cover rounded-md" data-ai-hint="person face"/>
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <div className="flex text-sm text-muted-foreground justify-center">
                  <p className="pl-1">{imagePreview ? 'Resmi değiştir' : 'Yüklemek için tıklayın'}</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF 10MB'a kadar</p>
              </div>
            </div>
            <Input 
              id="photo" 
              name="photo" 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange} 
              required 
              className="sr-only"
            />
            <input type="hidden" name="photoDataUri" value={photoDataUri} />
          </div>
          
          {initialState?.error && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{initialState.error}</AlertDescription>
            </Alert>
          )}
          {initialState?.message && !initialState.data && !initialState.error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bilgi</AlertTitle>
              <AlertDescription>{initialState.message}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

```