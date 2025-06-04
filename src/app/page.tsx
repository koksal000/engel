
'use client';

import { useState } from 'react';
// Header is now in RootLayout, so remove import { Header } from '@/components/header';
import { ImageUploadForm } from '@/components/image-upload-form';
import { ReportModal } from '@/components/report-modal';
import type { AnalysisResult } from '@/lib/actions';
import { SiteLogo } from '@/components/site-logo'; // Updated to SiteLogo

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAnalysisResult(null); 
  };

  return (
    // Removed the outer div with flex flex-col min-h-screen as RootLayout handles this
    // Header is removed as it's now global in RootLayout
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center"> {/* Changed main to div for simpler structure under RootLayout's main */}
      <div className="text-center mb-12">
        {/* SiteLogo is already part of the global Header, but can be shown here as a page title element too if desired */}
        {/* For now, let's make the form the central piece */}
        <h1 className="text-4xl font-bold text-primary mb-3 mt-4">Engellilik Ön Değerlendirme Testi</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Bakırköy Engellilik Değerlendirme Merkezi'nin yapay zeka destekli platformuna hoş geldiniz.
          Hızlı bir ön analiz için lütfen aşağıdaki formu doldurun ve bir fotoğraf yükleyin.
        </p>
        <p className="mt-2 text-sm text-destructive max-w-2xl mx-auto">
          Bu test tıbbi bir teşhis niteliği taşımaz. Yalnızca ön bilgilendirme amaçlıdır.
        </p>
      </div>
      
      <ImageUploadForm onAnalysisComplete={handleAnalysisComplete} />

      {analysisResult && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={closeModal}
          reportData={analysisResult}
        />
      )}
    </div>
    // Footer is removed as it's now global in RootLayout
  );
}
