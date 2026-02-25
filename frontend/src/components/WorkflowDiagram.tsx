const steps = [
  { number: 1, title: 'Add Subjects', description: 'Create subjects with codes' },
  { number: 2, title: 'Add Questions', description: 'Build your question bank' },
  { number: 3, title: 'Configure Paper', description: 'Set marks and duration' },
  { number: 4, title: 'Generate', description: 'Auto-create 5 variants' },
  { number: 5, title: 'Download PDF', description: 'Print-ready exam papers' },
];

export default function WorkflowDiagram() {
  return (
    <div className="flex items-start gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-center text-center w-28">
            <div className="w-10 h-10 rounded-full bg-navy-800 text-white font-bold text-sm flex items-center justify-center mb-2">
              {step.number}
            </div>
            <p className="text-navy-800 font-semibold text-xs">{step.title}</p>
            <p className="text-gray-400 text-xs mt-0.5">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-0.5 bg-gray-200 shrink-0 mt-[-20px]" />
          )}
        </div>
      ))}
    </div>
  );
}
