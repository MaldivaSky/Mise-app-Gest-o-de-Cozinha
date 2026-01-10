import React from 'react';
import { X, Share2, ChefHat, Check, Copy } from 'lucide-react';
import { Recipe, CostBreakdown } from '../types';

interface ShareModalProps {
  recipe: Recipe;
  breakdown: CostBreakdown;
  chefName?: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ recipe, breakdown, chefName, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Generate a simple text format for clipboard
    const text = `
🍳 Receita: ${recipe.name || 'Nova Receita'}
👨‍🍳 Chef: ${chefName || 'Mise User'}
-------------------------
💰 Custo Total: ${breakdown.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
📊 Custo un.: ${breakdown.costPerUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
🏷️ Venda Sugerida: ${breakdown.suggestedSalePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
📈 Lucro: ${recipe.profitMargin}%
-------------------------
Gerado por Mise App
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm perspective-1000">
        
        {/* The Receipt Card */}
        <div className="bg-white transform transition-transform shadow-2xl relative overflow-hidden">
            
            {/* Paper Jagged Top */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-stone-900" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'}}></div>

            <div className="p-8 pt-10 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center">
                        <ChefHat size={24} className="text-white"/>
                    </div>
                </div>
                
                <h2 className="text-2xl font-black text-stone-900 uppercase tracking-widest mb-1">MISE</h2>
                <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase mb-6">Intelligence de Cuisine</p>

                <div className="border-b-2 border-dashed border-stone-200 w-full my-4"></div>

                <div className="text-left space-y-1 mb-6">
                    <p className="text-xs text-stone-400 font-mono">ITEM</p>
                    <h3 className="text-lg font-bold text-stone-800 leading-tight">{recipe.name || 'Receita Sem Nome'}</h3>
                    <p className="text-xs text-stone-500 italic">Chef {chefName || 'Visitante'}</p>
                </div>

                <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between text-stone-600">
                        <span>Custo Total</span>
                        <span>{breakdown.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                        <span>Rendimento</span>
                        <span>{recipe.yields} un.</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                        <span>Custo Un.</span>
                        <span>{breakdown.costPerUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 items-center">
                        <span>Margem</span>
                        <span className="bg-stone-100 px-1 rounded">{recipe.profitMargin}%</span>
                    </div>
                </div>

                <div className="border-b-2 border-dashed border-stone-200 w-full my-6"></div>

                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-stone-400 uppercase">Preço Venda</span>
                    <span className="text-2xl font-black text-stone-900">
                        {breakdown.suggestedSalePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
            
            </div>

            {/* Paper Jagged Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-stone-900 rotate-180" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'}}></div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
             <button 
               onClick={onClose}
               className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
             >
                <X size={24} />
             </button>
             <button 
               onClick={handleCopy}
               className="flex-1 bg-chef-500 hover:bg-chef-600 text-white py-3 px-6 rounded-full font-bold shadow-lg shadow-chef-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
             >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'Copiado!' : 'Copiar Resumo'}
             </button>
        </div>
        
        <p className="text-center text-stone-500 text-xs mt-4">
            Tire um print da tela para compartilhar no Instagram!
        </p>

      </div>
    </div>
  );
};