'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { ImageUploadForm } from '@/components/image-upload-form';
import { ReportModal } from '@/components/report-modal';
import type { AnalysisResult } from '@/lib/actions';
import { AwareAssistLogo } from '@/components/aware-assist-logo';

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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <AwareAssistLogo size="text-5xl" />
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to AwareAssist, your AI-powered platform for preliminary disability analysis. 
            Upload an image to receive insights and simulate a hospital referral.
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
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} AwareAssist. All rights reserved.</p>
        <p className="mt-1">This platform is for informational and simulation purposes only and does not provide medical advice.</p>
      </footer>
    </div>
  );
}
