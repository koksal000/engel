import { Brain } from 'lucide-react'; // Keeping Brain, can be changed later if needed

export function SiteLogo({ size = "text-2xl", className = "" }: { size?: string, className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-primary font-headline ${size} ${className}`}>
      <Brain className="h-8 w-8" />
      <span>Bakırköy Engellilik Değerlendirme Merkezi</span>
    </div>
  );
}
