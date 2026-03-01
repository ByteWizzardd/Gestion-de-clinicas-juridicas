'use client';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const stepWidth = 100 / steps.length; // Porcentaje que ocupa cada paso

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center w-full relative">
        {/* Línea horizontal de fondo que conecta desde el centro del primer paso hasta el centro del último */}
        {steps.length > 1 && (
          <div
            className="absolute top-4 h-px bg-gray-300 dark:bg-[var(--ui-border)] z-0"
            style={{
              left: `${stepWidth / 2}%`, // Desde el centro del primer círculo
              width: `calc(${stepWidth * (steps.length - 1)}%)`, // Ancho desde el centro del primero hasta el centro del último
            }}
          />
        )}

        {steps.map((step, index) => {
          const stepNumber = String(index + 1).padStart(2, '0');
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-center flex-1 relative z-10">
              {/* Paso */}
              <div className="flex flex-col items-center relative w-full">
                {/* Círculo del paso */}
                <div
                  className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      transition-colors duration-200 border-2
                      ${isActive
                      ? 'border-secondary bg-white dark:bg-[var(--card-bg)]'
                      : isCompleted
                        ? 'border-secondary bg-secondary'
                        : 'border-gray-300 dark:border-[var(--ui-border)] bg-white dark:bg-[var(--card-bg)]'
                    }
                    `}
                >
                  <span className={`text-base font-normal ${isActive
                      ? 'text-secondary'
                      : isCompleted
                        ? 'text-white'
                        : 'text-gray-500 dark:text-[var(--card-text-muted)]'
                    }`}>
                    {stepNumber}
                  </span>
                </div>
                {/* Etiqueta del paso */}
                <span
                  className={`
                      mt-2 text-xs text-center px-1
                      ${isActive
                      ? 'font-normal text-secondary'
                      : isCompleted
                        ? 'font-normal text-secondary'
                        : 'font-normal text-gray-500 dark:text-[var(--card-text-muted)]'
                    }
                    `}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

