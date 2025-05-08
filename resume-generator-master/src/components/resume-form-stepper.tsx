"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface ResumeFormStepperProps {
  currentStep: number;
  steps: string[];
}

const ResumeFormStepper: React.FC<ResumeFormStepperProps> = ({ currentStep, steps }) => {
  return (
    <nav className="stepper-nav flex justify-center w-full max-w-3xl mx-auto mb-8">
      <ol className="flex flex-1 items-center justify-between gap-0 w-full">
        {steps.map((step, idx) => (
          <li key={step} className="flex-1 flex flex-col items-center relative">
            <div
              className={`flex items-center justify-center rounded-full w-9 h-9 text-lg font-bold border-2 transition-all duration-200
                ${idx === currentStep ? 'bg-accent text-accent-foreground border-accent shadow-lg scale-110' : 'bg-background text-muted-foreground border-muted-foreground'}
              `}
            >
              {idx + 1}
            </div>
            <span className={`mt-2 text-xs font-medium text-center ${idx === currentStep ? 'text-accent' : 'text-muted-foreground'}`}>{step}</span>
            {idx < steps.length - 1 && (
              <div className="absolute top-1/2 left-full w-full h-0.5 bg-muted-foreground opacity-30 z-0" style={{ width: 'calc(100% - 36px)', marginLeft: 18 }} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ResumeFormStepper;
