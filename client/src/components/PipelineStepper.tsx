import React from 'react';
import { Check, Compass, FileCode2, Cpu, SlidersHorizontal, Download } from 'lucide-react';
import { useSession } from '../context/SessionContext';

const STEPS = [
  { id: 0, title: 'Idea Concept', icon: Compass },
  { id: 1, title: 'Spec Pipeline', icon: FileCode2 },
  { id: 2, title: 'Tech Stack (CP1)', icon: Cpu },
  { id: 3, title: 'Design (CP2)', icon: SlidersHorizontal },
  { id: 4, title: 'Export Docs', icon: Download },
];

export const PipelineStepper: React.FC = () => {
  const { activeStep, setActiveStep, specDoc, designDirections } = useSession();

  const isStepAccessible = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    if (stepIndex === 1) return true;
    if (stepIndex === 2) return Boolean(specDoc);
    if (stepIndex === 3) return Boolean(specDoc);
    if (stepIndex === 4) return Boolean(specDoc && designDirections);
    return false;
  };

  return (
    <div className="w-full bg-[#F4F1EC] py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Connector Bar */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#E2DDD3] shadow-nm-inset-sm -z-0" />

          {STEPS.map((step) => {
            const isCompleted = activeStep > step.id;
            const isCurrent = activeStep === step.id;
            const accessible = isStepAccessible(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  disabled={!accessible}
                  onClick={() => accessible && setActiveStep(step.id)}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-terracotta text-white shadow-nm-terracotta scale-105 ring-2 ring-white'
                      : isCompleted
                      ? 'bg-sage text-white shadow-nm-sm'
                      : accessible
                      ? 'bg-[#F4F1EC] text-subtle hover:text-charcoal shadow-nm-sm'
                      : 'bg-[#EFECE6] text-stone-300 shadow-nm-inset-sm cursor-not-allowed'
                  }`}
                  title={step.title}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <span
                  className={`mt-2 text-[10px] sm:text-xs font-semibold tracking-tight text-center hidden md:block max-w-[85px] leading-tight ${
                    isCurrent
                      ? 'text-terracotta'
                      : isCompleted
                      ? 'text-charcoal'
                      : 'text-subtle opacity-70'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
