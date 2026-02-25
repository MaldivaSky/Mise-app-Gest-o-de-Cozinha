
import React from 'react';
import { X, Share2, ChefHat, Check, Copy, Camera, Smartphone } from 'lucide-react';
import { Recipe, CostBreakdown } from '../types';

interface ShareModalProps {
  recipe: Recipe;
  breakdown: CostBreakdown;
  chefName?: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ recipe, breakdown, chefName, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const generateShareText = () => {
    return `
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
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = generateShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receita: ${recipe.name}`,
          text: text,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy(); // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm perspective-1000 flex flex-col max-h-[90vh]">
        
        {/* The Receipt Card */}
        <div className="bg-white transform transition-transform shadow-2xl relative overflow-y-auto scrollbar-hide rounded-t-lg">
            
            {/* Paper Jagged Top */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-stone-900 z-10" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'}}></div>

            {/* Optional Image Header */}
            {recipe.image && (
                <div className="h-48 w-full relative">
                    <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
            )}

            <div className="p-8 pt-10 text-center">
                {!recipe.image && (
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center">
                            <ChefHat size={24} className="text-white"/>
                        </div>
                    </div>
                )}
                
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
        <div className="mt-6 flex flex-col gap-3">
             <div className="flex gap-3">
                <button 
                onClick={handleWhatsApp}
                className="flex-1 bg-[#25D366] hover:bg-[#1ebc59] text-white py-3 px-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                </button>
                <button 
                onClick={handleNativeShare}
                className="bg-stone-800 hover:bg-black text-white py-3 px-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                title="Compartilhar"
                >
                    <Share2 size={20} />
                </button>
             </div>
             
             <div className="flex gap-3">
                <button 
                onClick={handleCopy}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    {copied ? 'Copiado' : 'Copiar Texto'}
                </button>
                <button 
                onClick={onClose}
                className="bg-stone-200 hover:bg-stone-300 text-stone-600 py-3 px-4 rounded-xl"
                >
                    <X size={20} />
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};
