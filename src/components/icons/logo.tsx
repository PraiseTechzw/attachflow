
import { cn } from "@/lib/utils";
import React from "react";

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    className={cn("text-primary", className)}
    {...props}
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "hsl(var(--chart-4))", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M10 40 L30 10 L50 40 M30 10 L30 25" fill="none" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <text x="55" y="35" fontFamily="Inter, sans-serif" fontSize="30" fontWeight="bold" fill="hsl(var(--foreground))">
      ttachFlow
    </text>
  </svg>
);
