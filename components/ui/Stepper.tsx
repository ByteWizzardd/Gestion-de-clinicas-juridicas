'use client';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center w-full max-w-2xl relative">
          {steps.map((step, index) => {
            const stepNumber = String(index + 1).padStart(2, '0');
            const isActive = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="flex items-center flex-1 relative">
                {/* Paso */}
                <div className="flex flex-col items-center relative z-10 flex-1">
                  {/* Círculo del paso */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      transition-colors duration-200 border-2 bg-white
                      ${
                        isActive
                          ? 'border-secondary'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    <span className={`text-sm font-normal ${
                      isActive ? 'text-secondary' : 'text-gray-500'
                    }`}>
                      {stepNumber}
                    </span>
                  </div>
                  {/* Etiqueta del paso */}
                  <span
                    className={`
                      mt-2 text-sm text-center whitespace-nowrap
                      ${
                        isActive
                          ? 'font-normal text-secondary'
                          : 'font-normal text-gray-500'
                      }
                    `}
                  >
                    {step}
                  </span>
                </div>

                {/* Línea conectora - desde el centro del círculo actual hasta el centro del siguiente */}
                {!isLast && (
                  <div
                    className="absolute top-4 left-1/2 h-px bg-gray-300 z-0"
                    style={{ 
                      width: 'calc(100% - 1rem)',
                      marginLeft: '1rem',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
  );
}

