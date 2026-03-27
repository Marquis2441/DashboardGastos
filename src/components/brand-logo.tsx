import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-9 h-9 bg-[#0052B4] rounded-xl flex items-center justify-center p-1.5 shadow-[0_4px_12px_rgba(0,82,180,0.3)] group-hover:scale-110 transition-all duration-500",
        className
      )}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-white"
      >
        {/* Stylized 'C' with Arrow - Based on crezcawebs brand image */}
        <path 
          d="M6 18C6 18 5 16 5 14C5 10.6863 7.68629 8 11 8C14.3137 8 17 10.6863 17 14V16.5M17 16.5L14 13.5M17 16.5L20 13.5" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M7 16V14" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          className="opacity-40"
        />
        
        {/* The Crown on top of the arrow tip */}
        <path 
          d="M17 3L15 5L17 7L19 5L17 3Z" 
          fill="currentColor"
          className="opacity-90"
        />
        <path 
          d="M15 5H19" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
