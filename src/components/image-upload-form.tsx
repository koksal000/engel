'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { performAnalysisAction, type AnalysisResult } from '@/lib/actions';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ImageUploadFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export function ImageUploadForm({ onAnalysisComplete }: ImageUploadFormProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!photoDataUri) {
        setError("Lütfen bir fotoğraf yükleyin.");
        return;
    }
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await performAnalysisAction(formData);

    setIsPending(false);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      onAnalysisComplete(result.data);
    } else {
      setError('Analiz sırasında bilinmeyen bir hata oluştu.');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Engellilik Ön Değerlendirme Testi</CardTitle>
        <CardDescription className="text-center">
          Bakırköy Engellilik Değerlendirme Merkezi yapay zeka destekli ön analiz için bir resim yükleyin ve bilgilerinizi girin.
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
                  <Image src={imagePreview} alt="Resim önizlemesi" width={128} height={128} className="mx-auto h-32 w-32 object-cover rounded-md" data-ai-hint="person face" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <div className="flex text-sm text-muted-foreground justify-center">
                  <p className="pl-1">{imagePreview ? 'Resmi değiştir' : 'Yüklemek için tıklayın veya sürükleyin'}</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF 30MB'a kadar</p>
              </div>
            </div>
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="sr-only"
            />
            <input type="hidden" name="photoDataUri" value={photoDataUri} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analiz Ediliyor...
              </>
            ) : (
              'Ön Değerlendirme Testini Başlat'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
