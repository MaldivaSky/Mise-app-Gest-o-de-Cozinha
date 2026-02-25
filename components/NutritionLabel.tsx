
import React from 'react';
import { Activity, Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';
import { NutritionData } from '../types';

interface NutritionLabelProps {
  nutrition: NutritionData;
  yields: number;
}

export const NutritionLabel: React.FC<NutritionLabelProps> = ({ nutrition, yields }) => {
  // If yields change, we recalculate per serving on the fly if needed, 
  // but usually we rely on what comes from the recipe or simple division
  const perServingCalories = nutrition.totalCalories / (yields || 1);
  const perServingProtein = nutrition.protein / (yields || 1);
  const perServingCarbs = nutrition.carbs / (yields || 1);
  const perServingFats = nutrition.fats / (yields || 1);

  return (
    <div className="bg-white border-2 border-stone-900 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
      <div className="absolute top-0 right-0 bg-stone-900 text-chef-500 text-[10px] font-black uppercase px-2 py-1 rounded-bl-lg">
        Informação Nutricional
      </div>

      <div className="flex items-center gap-2 mb-4">
         <div className="p-2 bg-green-100 text-green-700 rounded-full">
            <Activity size={20} />
         </div>
         <div>
             <div className="text-xs text-stone-500 uppercase font-bold tracking-wide">Por Porção</div>
             <div className="text-3xl font-black text-stone-900 leading-none">
                {Math.round(perServingCalories)} <span className="text-sm font-bold text-stone-400">kcal</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
         {/* Protein */}
         <div className="bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
             <div className="flex justify-center mb-1 text-blue-500">
                <Dumbbell size={16} />
             </div>
             <div className="text-lg font-bold text-stone-800">{Math.round(perServingProtein)}g</div>
             <div className="text-[10px] text-stone-400 uppercase font-bold">Proteína</div>
             <div className="w-full bg-stone-200 h-1 mt-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '60%' }}></div> {/* Visual mock */}
             </div>
         </div>

         {/* Carbs */}
         <div className="bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
             <div className="flex justify-center mb-1 text-yellow-600">
                <Wheat size={16} />
             </div>
             <div className="text-lg font-bold text-stone-800">{Math.round(perServingCarbs)}g</div>
             <div className="text-[10px] text-stone-400 uppercase font-bold">Carboid.</div>
             <div className="w-full bg-stone-200 h-1 mt-1 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full" style={{ width: '40%' }}></div>
             </div>
         </div>

         {/* Fats */}
         <div className="bg-stone-50 p-2 rounded-lg text-center border border-stone-100">
             <div className="flex justify-center mb-1 text-red-500">
                <Droplet size={16} />
             </div>
             <div className="text-lg font-bold text-stone-800">{Math.round(perServingFats)}g</div>
             <div className="text-[10px] text-stone-400 uppercase font-bold">Gorduras</div>
             <div className="w-full bg-stone-200 h-1 mt-1 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: '30%' }}></div>
             </div>
         </div>
      </div>
      
      <p className="text-[10px] text-stone-400 text-center mt-3">
         *Valores estimados baseados nos ingredientes.
      </p>
    </div>
  );
};
