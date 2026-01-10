
import React, { useState } from 'react';
import { X, ShoppingBasket, Plus, Trash2, ChefHat, Sparkles, AlertTriangle, Coffee, Sun, Moon } from 'lucide-react';
import { PantryItem, Recipe } from '../types';
import { suggestRecipesFromPantry } from '../services/geminiService';

interface PantryModalProps {
  items: PantryItem[];
  onAddItem: (item: Omit<PantryItem, 'id' | 'purchaseDate'>) => void;
  onRemoveItem: (id: string) => void;
  onGenerateRecipes: (recipes: Recipe[]) => void;
  onClose: () => void;
}

const UNIT_OPTIONS = ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct'];

export const PantryModal: React.FC<PantryModalProps> = ({ items, onAddItem, onRemoveItem, onGenerateRecipes, onClose }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '', unit: 'un' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.quantity) return;

    onAddItem({
      name: newItem.name,
      price: parseFloat(newItem.price),
      quantity: parseFloat(newItem.quantity),
      unit: newItem.unit
    });
    setNewItem({ name: '', price: '', quantity: '', unit: 'un' });
  };

  const handleMagicGeneration = async () => {
    if (items.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const aiRecipes = await suggestRecipesFromPantry(items);
      
      if (aiRecipes && aiRecipes.length > 0) {
        // Map AI Recipe structure to App Recipe Structure
        const mappedRecipes: Recipe[] = aiRecipes.map((r, idx) => ({
          id: `gen_${Date.now()}_${idx}`,
          name: r.recipeName,
          description: r.description,
          yields: 4, // Default assumption
          portionSize: 200, // Default assumption
          profitMargin: 100,
          ingredients: r.ingredients.map((i, iIdx) => ({
               id: `ing_${idx}_${iIdx}`,
               name: i.name,
               packagePrice: i.packagePrice,
               packageQuantity: i.packageQuantity,
               packageUnit: i.packageUnit,
               usedQuantity: i.usedQuantity,
               usedUnit: i.usedUnit
          })),
          overheads: {
              preparationTimeMinutes: r.prepTimeMinutes,
              cookingTimeMinutes: r.cookingTimeMinutes,
              gasCylinderPrice: 120,
              gasCylinderWeight: 13,
              gasBurnerConsumption: 0.225,
              laborHourlyRate: 20,
              electricityEstimate: 1,
              waterEstimate: 0.5,
              otherCosts: 1
          },
          instructions: r.instructions.map(inst => ({ text: inst.step, timeInMinutes: inst.time })),
          difficulty: r.difficulty as 'easy' | 'medium' | 'hard'
        }));
        
        onGenerateRecipes(mappedRecipes);
        onClose();
      } else {
        setError("Não foi possível gerar receitas com estes itens. Tente adicionar itens mais comuns.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com a IA. Tente novamente em instantes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const totalValue = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-stone-800 p-6 text-white shrink-0 flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBasket className="text-chef-500" />
                Minha Dispensa
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                 Gerencie seu estoque e descubra o menu do dia.
              </p>
           </div>
           <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-10">
             <X size={20} />
           </button>
           {/* Background Decoration */}
           <ShoppingBasket size={150} className="absolute -right-6 -bottom-8 text-white/5 transform rotate-12 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* List Section */}
            <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden border-r border-stone-200">
                
                {/* Add Form */}
                <form onSubmit={handleAdd} className="p-4 bg-white border-b border-stone-200 shrink-0">
                    <div className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-5">
                            <input 
                              type="text" placeholder="Item (ex: Leite)" 
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-chef-500"
                              value={newItem.name}
                              onChange={e => setNewItem({...newItem, name: e.target.value})}
                            />
                        </div>
                        <div className="col-span-3">
                             <div className="flex">
                                <span className="inline-flex items-center px-2 rounded-l-lg border border-r-0 border-stone-200 bg-stone-100 text-stone-500 text-xs">R$</span>
                                <input 
                                type="number" placeholder="0.00" 
                                className="w-full bg-stone-50 border border-stone-200 rounded-r-lg px-2 py-2 text-sm outline-none focus:border-chef-500"
                                value={newItem.price}
                                onChange={e => setNewItem({...newItem, price: e.target.value})}
                                />
                             </div>
                        </div>
                        <div className="col-span-4 flex gap-1">
                             <input 
                                type="number" placeholder="Qtd" 
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-chef-500"
                                value={newItem.quantity}
                                onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                             />
                             <select 
                               className="bg-stone-100 border border-stone-200 rounded-lg text-xs"
                               value={newItem.unit}
                               onChange={e => setNewItem({...newItem, unit: e.target.value})}
                             >
                                 {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                             </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-stone-900 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                        <Plus size={16} /> Adicionar Compra
                    </button>
                </form>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {items.length === 0 ? (
                        <div className="text-center text-stone-400 mt-10">
                            <ShoppingBasket size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Sua dispensa está vazia.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center shadow-sm animate-in slide-in-from-left duration-200">
                                <div>
                                    <div className="font-bold text-stone-800">{item.name}</div>
                                    <div className="text-xs text-stone-500">{item.quantity}{item.unit} • Compra: {new Date(item.purchaseDate).toLocaleDateString('pt-BR')}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-stone-700">R$ {item.price.toFixed(2)}</span>
                                    <button onClick={() => onRemoveItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Total Footer */}
                <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-between items-center shrink-0">
                    <span className="text-sm font-medium text-stone-600">Valor em Estoque</span>
                    <span className="text-lg font-bold text-stone-900">R$ {totalValue.toFixed(2)}</span>
                </div>
            </div>

            {/* AI Generator Section */}
            <div className="w-full md:w-72 bg-chef-50 p-6 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-chef-100 shrink-0 relative">
                
                {error && (
                    <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-600 p-2 rounded-lg text-xs border border-red-200 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 z-20">
                         <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                         {error}
                    </div>
                )}

                <div className="mb-6 flex gap-4 text-chef-300">
                    <Coffee size={24} className="animate-bounce" style={{ animationDelay: '0s' }} />
                    <Sun size={24} className="animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Moon size={24} className="animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>

                <div className="bg-white p-4 rounded-full shadow-lg mb-4 ring-4 ring-chef-100">
                    <Sparkles size={32} className="text-chef-500" />
                </div>
                
                <h3 className="text-xl font-black text-stone-800 mb-2">Sugestão do Dia</h3>
                <p className="text-xs text-stone-500 mb-8 leading-relaxed px-2">
                   Vou planejar seu <strong>Café, Almoço e Jantar</strong> usando os {items.length} itens da sua dispensa para economia máxima.
                </p>
                
                <button 
                  onClick={handleMagicGeneration}
                  disabled={items.length === 0 || isGenerating}
                  className="w-full bg-gradient-to-r from-chef-500 to-chef-600 hover:from-chef-600 hover:to-chef-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-chef-500/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isGenerating ? (
                        <span className="flex items-center justify-center gap-2">
                             <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"/>
                             Planejando...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                             <ChefHat size={20} />
                             Gerar Menu Completo
                        </span>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};
