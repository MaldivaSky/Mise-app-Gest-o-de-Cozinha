
import React, { useState } from 'react';
import { X, Sparkles, ChefHat, ArrowRight } from 'lucide-react';
import { analyzeRecipeWithGemini } from '../services/geminiService';
import { Recipe, Ingredient } from '../types';

interface RecipeGeneratorModalProps {
  onClose: () => void;
  onRecipeGenerated: (recipe: Partial<Recipe>) => void;
}

export const RecipeGeneratorModal: React.FC<RecipeGeneratorModalProps> = ({ onClose, onRecipeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);

    const result = await analyzeRecipeWithGemini(prompt);

    if (result) {
      const newIngredients: Ingredient[] = result.ingredients.map((ing, idx) => ({
        id: Date.now().toString() + idx,
        name: ing.name,
        packagePrice: ing.packagePrice,
        packageQuantity: ing.packageQuantity,
        packageUnit: ing.packageUnit,
        usedQuantity: ing.usedQuantity,
        usedUnit: ing.usedUnit
      }));

      onRecipeGenerated({
        name: result.recipeName,
        ingredients: newIngredients,
        overheads: {
            preparationTimeMinutes: result.prepTimeMinutes,
            cookingTimeMinutes: result.cookingTimeMinutes,
            gasCylinderPrice: 120,
            gasCylinderWeight: 13,
            gasBurnerConsumption: 0.225, // Standard high flame
            laborHourlyRate: 20,
            electricityEstimate: 2,
            waterEstimate: 1,
            otherCosts: 2
        },
        instructions: result.instructions.map(i => ({ text: i.step, timeInMinutes: i.time }))
      });
      onClose();
    } else {
      setError("Não foi possível criar a receita. Tente detalhar mais o pedido.");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-300">
        
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-chef-500 to-chef-600 p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300" />
              Criar com IA
            </h2>
            <p className="text-chef-100 text-sm mt-1">
              Descreva sua ideia e deixe a inteligência gerar custos, ingredientes e o passo a passo.
            </p>
          </div>
          <ChefHat className="absolute -right-6 -bottom-6 text-white/10 w-32 h-32 transform rotate-12" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            O que vamos cozinhar hoje?
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Quero um bolo de cenoura com cobertura de chocolate, mas sem glúten e para render 15 fatias..."
            className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-chef-500 focus:border-transparent outline-none resize-none transition-all mb-4"
          />
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-stone-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
               <>
                 <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"/>
                 Criando Receita...
               </>
            ) : (
               <>
                 <Sparkles size={20} className="text-chef-400 group-hover:text-yellow-400 transition-colors" />
                 Gerar Receita Completa
                 <ArrowRight size={20} className="opacity-50 group-hover:translate-x-1 transition-transform" />
               </>
            )}
          </button>
        </div>
        
        {/* Footer info */}
        <div className="px-6 pb-6 text-center">
           <p className="text-xs text-stone-400">
             A IA irá estimar preços médios de mercado. Revise os valores para maior precisão.
           </p>
        </div>

      </div>
    </div>
  );
};
