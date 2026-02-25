
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, ChefHat, Timer, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { InstructionStep } from '../types';

interface CookingModeProps {
  recipeName: string;
  steps: InstructionStep[];
  onClose: () => void;
  onComplete: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipeName, steps, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Timer Logic
  const currentStepTime = steps[currentStep]?.timeInMinutes || 0;
  const [timeLeft, setTimeLeft] = useState(currentStepTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timer when step changes
    const newTime = (steps[currentStep]?.timeInMinutes || 0) * 60;
    setTimeLeft(newTime);
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentStep, steps]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((steps[currentStep]?.timeInMinutes || 0) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasSteps = steps && steps.length > 0;
  const progress = hasSteps ? ((currentStep + 1) / steps.length) * 100 : 0;
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  // Gamification: Timer Progress Circle
  const totalTime = (steps[currentStep]?.timeInMinutes || 0) * 60;
  const timeProgress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Container Principal */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] relative">
        
        {/* Header */}
        <div className="bg-chef-500 p-4 flex justify-between items-center text-white shadow-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat size={24} />
            <h2 className="font-bold text-lg truncate max-w-[200px] sm:max-w-md">{recipeName}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Barra de Progresso Global */}
        <div className="h-2 bg-stone-200 w-full shrink-0">
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Conteúdo do Card (Passos) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start text-center relative bg-stone-50">
           
           {!hasSteps ? (
             <div className="text-stone-400 mt-20">
               <p className="text-xl font-medium">Sem instruções definidas.</p>
               <p className="text-sm mt-2">Adicione passos na tela anterior ou use a IA para gerar.</p>
             </div>
           ) : (
             <div className="w-full max-w-lg animate-in fade-in slide-in-from-right duration-300 key={currentStep}">
                
                {/* Step Counter Badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-stone-200 text-stone-600 rounded-full text-sm font-bold shadow-sm tracking-wide uppercase">
                        Passo {currentStep + 1} de {steps.length}
                    </span>
                </div>
                
                {/* Main Instruction Text */}
                <h3 className="text-2xl md:text-3xl font-medium text-stone-800 leading-relaxed font-sans mb-8">
                  {steps[currentStep].text}
                </h3>

                {/* Timer Section (Only if time > 0) */}
                {steps[currentStep].timeInMinutes && steps[currentStep].timeInMinutes > 0 ? (
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-stone-100 mb-6">
                      <div className="flex items-center justify-center gap-2 text-chef-600 font-bold uppercase text-xs tracking-wider mb-2">
                          <Timer size={14} /> Tempo Sugerido
                      </div>
                      
                      <div className="text-5xl font-black text-stone-800 tabular-nums tracking-tight mb-4">
                          {formatTime(timeLeft)}
                      </div>

                      {/* Timer Controls */}
                      <div className="flex justify-center gap-3">
                          <button 
                            onClick={toggleTimer}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-chef-500 text-white hover:bg-chef-600 shadow-lg shadow-chef-500/30'}`}
                          >
                             {isActive ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                             {isActive ? 'Pausar' : 'Iniciar'}
                          </button>
                          <button 
                            onClick={resetTimer}
                            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                            title="Reiniciar Timer"
                          >
                             <RotateCcw size={20} />
                          </button>
                      </div>

                      {/* Visual Timer Progress Bar */}
                      <div className="mt-4 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chef-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${timeProgress}%` }}
                          />
                      </div>
                  </div>
                ) : (
                   <div className="text-stone-400 text-sm flex items-center justify-center gap-2 py-4">
                      <CheckCircle2 size={16} /> Passo sem tempo definido
                   </div>
                )}
             </div>
           )}

           {/* Marca d'água decorativa */}
           <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
             <ChefHat size={120} />
           </div>
        </div>

        {/* Controles de Navegação */}
        <div className="p-6 bg-white border-t border-stone-200 flex justify-between items-center gap-4 shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${currentStep === 0 
                ? 'text-stone-300 cursor-not-allowed' 
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}
            `}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          {isLastStep ? (
             <button
                onClick={handleFinish}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all transform hover:scale-105"
             >
                <Trophy size={20} />
                Concluir & Receber XP
             </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!hasSteps}
              className="bg-chef-500 hover:bg-chef-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-chef-500/30 flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRight size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
