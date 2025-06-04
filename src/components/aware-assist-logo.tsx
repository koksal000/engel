import { Brain } from 'lucide-react';

export function AwareAssistLogo({ size = "text-2xl" }: { size?: string }) {
  return (
    <div className={`flex items-center gap-2 ${size} font-bold text-primary font-headline`}>
      <Brain className="h-8 w-8" />
      <span>AwareAssist</span>
    </div>
  );
}
