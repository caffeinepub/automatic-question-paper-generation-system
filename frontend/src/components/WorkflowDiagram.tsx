import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  { number: 1, label: 'Add Subjects', color: 'var(--navy-700)' },
  { number: 2, label: 'Add Questions', color: 'var(--navy-600)' },
  { number: 3, label: 'Set Parameters', color: 'var(--lightblue-600)' },
  { number: 4, label: 'Generate Paper', color: 'var(--lightblue-500)' },
  { number: 5, label: 'Download PDF', color: 'var(--navy-500)' },
];

export default function WorkflowDiagram() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center gap-2 flex-1 min-w-[80px]">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: step.color }}
            >
              {step.number}
            </div>
            <span className="text-xs text-center text-muted-foreground font-medium leading-tight">
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <ArrowRight className="w-5 h-5 shrink-0" style={{ color: 'var(--navy-300)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
