
import React, { useState } from 'react';
import { X, ChefHat, Star, Flame, Clock, Award, ArrowRight, Trash2, Book, Sparkles, User, Utensils, Coffee, Pizza, IceCream, Plus } from 'lucide-react';
import { Recipe, Difficulty, RecipeCategory } from '../types';

interface RecipeBookModalProps {
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  savedRecipes: Recipe[];
  onDeleteRecipe: (id: string) => void;
  generatedRecipes?: Recipe[];
  onSaveRecipe?: (recipe: Recipe) => void;
}

// Preset Recipes Data
const PRESET_RECIPES: (Recipe & { description: string })[] = [
  {
    id: 'preset_1',
    name: "Brigadeiro Gourmet",
    description: "O clássico brasileiro para vendas rápidas e alta margem.",
    category: 'dessert',
    yields: 25,
    portionSize: 15,
    profitMargin: 100,
    difficulty: 'easy',
    ingredients: [
      { id: 'p1', name: 'Leite Condensado', packagePrice: 6.50, packageQuantity: 395, packageUnit: 'g', usedQuantity: 395, usedUnit: 'g' },
      { id: 'p2', name: 'Creme de Leite', packagePrice: 4.00, packageQuantity: 200, packageUnit: 'g', usedQuantity: 200, usedUnit: 'g' },
      { id: 'p3', name: 'Chocolate em Pó 50%', packagePrice: 25.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 60, usedUnit: 'g' },
      { id: 'p4', name: 'Manteiga', packagePrice: 12.00, packageQuantity: 200, packageUnit: 'g', usedQuantity: 20, usedUnit: 'g' },
      { id: 'p5', name: 'Granulado Belga', packagePrice: 45.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 100, usedUnit: 'g' },
    ],
    overheads: {
      preparationTimeMinutes: 10,
      cookingTimeMinutes: 20,
      gasCylinderPrice: 120,
      gasCylinderWeight: 13,
      gasBurnerConsumption: 0.225,
      laborHourlyRate: 15,
      electricityEstimate: 0.5,
      waterEstimate: 0.2,
      otherCosts: 2.0
    },
    instructions: [
      { text: "Em uma panela de fundo grosso, misture o leite condensado e o chocolate em pó.", timeInMinutes: 2 },
      { text: "Adicione o creme de leite e a manteiga.", timeInMinutes: 1 },
      { text: "Leve ao fogo médio, mexendo sempre com espátula de silicone.", timeInMinutes: 0 },
      { text: "Cozinhe até desgrudar do fundo da panela (ponto de cambalhota).", timeInMinutes: 15 },
      { text: "Transfira para um prato untado e cubra com filme plástico em contato.", timeInMinutes: 2 },
      { text: "Deixe esfriar completamente (preferencialmente 6h de descanso).", timeInMinutes: 360 },
      { text: "Boleie as porções de 15g e passe no granulado.", timeInMinutes: 20 },
      { text: "Coloque nas forminhas.", timeInMinutes: 5 }
    ]
  },
  {
    id: 'preset_2',
    name: "Risoto de Funghi Secchi",
    description: "Prato sofisticado que exige técnica e atenção constante.",
    category: 'main',
    yields: 4,
    portionSize: 350,
    profitMargin: 150,
    difficulty: 'medium',
    ingredients: [
      { id: 'r1', name: 'Arroz Arbóreo', packagePrice: 22.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 400, usedUnit: 'g' },
      { id: 'r2', name: 'Funghi Secchi', packagePrice: 35.00, packageQuantity: 50, packageUnit: 'g', usedQuantity: 30, usedUnit: 'g' },
      { id: 'r3', name: 'Vinho Branco Seco', packagePrice: 40.00, packageQuantity: 750, packageUnit: 'ml', usedQuantity: 100, usedUnit: 'ml' },
      { id: 'r4', name: 'Manteiga sem Sal', packagePrice: 15.00, packageQuantity: 200, packageUnit: 'g', usedQuantity: 80, usedUnit: 'g' },
      { id: 'r5', name: 'Queijo Parmesão', packagePrice: 80.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 100, usedUnit: 'g' },
      { id: 'r6', name: 'Cebola', packagePrice: 6.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 100, usedUnit: 'g' },
    ],
    overheads: {
      preparationTimeMinutes: 20,
      cookingTimeMinutes: 30,
      gasCylinderPrice: 120,
      gasCylinderWeight: 13,
      gasBurnerConsumption: 0.225,
      laborHourlyRate: 20,
      electricityEstimate: 0.5,
      waterEstimate: 0.5,
      otherCosts: 0
    },
    instructions: [
      { text: "Hidrate o funghi em água morna por 30 minutos. Coe e reserve a água.", timeInMinutes: 30 },
      { text: "Pique o funghi hidratado.", timeInMinutes: 2 },
      { text: "Refogue a cebola em metade da manteiga até ficar translúcida.", timeInMinutes: 5 },
      { text: "Adicione o arroz e frite levemente (nacarar).", timeInMinutes: 2 },
      { text: "Adicione o vinho branco e mexa até evaporar o álcool.", timeInMinutes: 2 },
      { text: "Adicione o funghi e comece a colocar o caldo (água do funghi + caldo de legumes) concha a concha.", timeInMinutes: 0 },
      { text: "Mexa constantemente para soltar o amido.", timeInMinutes: 18 },
      { text: "Quando o grão estiver al dente, desligue o fogo.", timeInMinutes: 0 },
      { text: "Faça a 'mantecatura': adicione o restante da manteiga gelada e o parmesão.", timeInMinutes: 1 },
      { text: "Mexa vigorosamente para emulsionar e sirva imediatamente.", timeInMinutes: 1 }
    ]
  },
  {
    id: 'preset_3',
    name: "Boeuf Bourguignon",
    description: "O teste supremo de paciência e construção de sabores.",
    category: 'main',
    yields: 6,
    portionSize: 400,
    profitMargin: 200,
    difficulty: 'hard',
    ingredients: [
      { id: 'b1', name: 'Músculo ou Acém', packagePrice: 35.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 1.2, usedUnit: 'kg' },
      { id: 'b2', name: 'Vinho Tinto (Pinot Noir)', packagePrice: 60.00, packageQuantity: 750, packageUnit: 'ml', usedQuantity: 750, usedUnit: 'ml' },
      { id: 'b3', name: 'Bacon em Cubos', packagePrice: 25.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 200, usedUnit: 'g' },
      { id: 'b4', name: 'Cenoura', packagePrice: 5.00, packageQuantity: 1, packageUnit: 'kg', usedQuantity: 300, usedUnit: 'g' },
      { id: 'b5', name: 'Cebola Pérola', packagePrice: 15.00, packageQuantity: 500, packageUnit: 'g', usedQuantity: 300, usedUnit: 'g' },
      { id: 'b6', name: 'Cogumelo Paris Fresco', packagePrice: 18.00, packageQuantity: 300, packageUnit: 'g', usedQuantity: 300, usedUnit: 'g' },
    ],
    overheads: {
      preparationTimeMinutes: 45,
      cookingTimeMinutes: 180,
      gasCylinderPrice: 120,
      gasCylinderWeight: 13,
      gasBurnerConsumption: 0.225,
      laborHourlyRate: 25,
      electricityEstimate: 1.0,
      waterEstimate: 1.0,
      otherCosts: 0
    },
    instructions: [
      { text: "Corte a carne em cubos grandes e seque bem com papel toalha.", timeInMinutes: 10 },
      { text: "Em uma panela de ferro, frite o bacon. Reserve o bacon e mantenha a gordura.", timeInMinutes: 5 },
      { text: "Sele a carne na gordura do bacon em lotes para não criar água. Reserve.", timeInMinutes: 15 },
      { text: "Na mesma panela, refogue a cenoura e cebola picada.", timeInMinutes: 5 },
      { text: "Volte a carne e o bacon para a panela.", timeInMinutes: 1 },
      { text: "Adicione o vinho tinto e complete com caldo de carne até cobrir.", timeInMinutes: 2 },
      { text: "Adicione o bouquet garni (ervas).", timeInMinutes: 0 },
      { text: "Cozinhe em fogo muito baixo (ou forno) por cerca de 3 horas.", timeInMinutes: 180 },
      { text: "Nos últimos 20 minutos, adicione as cebolas pérola e os cogumelos salteados na manteiga.", timeInMinutes: 5 },
      { text: "Ajuste o sal e pimenta. O molho deve estar espesso e brilhante.", timeInMinutes: 2 }
    ]
  }
];

const DifficultyBadge = ({ level }: { level: Difficulty }) => {
  switch (level) {
    case 'easy':
      return (
        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <Star size={12} fill="currentColor" /> Fácil
        </span>
      );
    case 'medium':
      return (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <Flame size={12} fill="currentColor" /> Médio
        </span>
      );
    case 'hard':
      return (
        <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <Award size={12} fill="currentColor" /> Difícil
        </span>
      );
    default:
      return null;
  }
};

type Tab = 'presets' | 'custom' | 'generated';
type CategoryFilter = 'all' | 'main' | 'dessert' | 'snack' | 'drink';

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({ onClose, onSelectRecipe, savedRecipes, onDeleteRecipe, generatedRecipes = [], onSaveRecipe }) => {
  const [activeTab, setActiveTab] = useState<Tab>(generatedRecipes.length > 0 ? 'generated' : 'presets');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const getActiveRecipes = () => {
    let source: Recipe[] = [];
    
    switch (activeTab) {
      case 'presets': source = PRESET_RECIPES; break;
      case 'custom': source = savedRecipes; break;
      case 'generated': source = generatedRecipes; break;
      default: source = [];
    }

    if (activeCategory === 'all') return source;
    
    return source.filter(r => {
        // Handle recipes without category by defaulting to 'other' in memory if needed, or loosely matching
        if (!r.category) return false;
        return r.category === activeCategory;
    });
  };

  const activeRecipes = getActiveRecipes();

  // Helper to counts for badges (not efficient for huge lists but fine here)
  const getCount = (cat: CategoryFilter) => {
      let source: Recipe[] = [];
      switch (activeTab) {
        case 'presets': source = PRESET_RECIPES; break;
        case 'custom': source = savedRecipes; break;
        case 'generated': source = generatedRecipes; break;
      }
      if (cat === 'all') return source.length;
      return source.filter(r => r.category === cat).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-stone-900 p-6 text-white shrink-0 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
               <h2 className="text-2xl font-bold flex items-center gap-2">
                 <ChefHat className="text-chef-500" />
                 Livro do Chef
               </h2>
               <p className="text-stone-400 text-sm mt-1">
                 Receitas testadas e aprovadas para você praticar e lucrar.
               </p>
            </div>
            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Main Tabs */}
          <div className="relative z-10 flex gap-4 mt-6">
              <button 
                onClick={() => { setActiveTab('presets'); setActiveCategory('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'presets' ? 'bg-white text-stone-900' : 'bg-white/10 text-stone-400 hover:bg-white/20'}`}
              >
                  <Book size={16} /> Clássicas
              </button>
              <button 
                onClick={() => { setActiveTab('custom'); setActiveCategory('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'custom' ? 'bg-white text-stone-900' : 'bg-white/10 text-stone-400 hover:bg-white/20'}`}
              >
                  <User size={16} /> Minhas Receitas
              </button>
              {generatedRecipes.length > 0 && (
                 <button 
                    onClick={() => { setActiveTab('generated'); setActiveCategory('all'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'generated' ? 'bg-gradient-to-r from-chef-500 to-chef-600 text-white shadow-lg' : 'bg-white/10 text-stone-400 hover:bg-white/20'}`}
                >
                    <Sparkles size={16} /> Sugestões IA
                </button>
              )}
          </div>

          {/* Decorative Background */}
          <div className="absolute -right-10 -bottom-20 text-white/5 pointer-events-none">
             <ChefHat size={200} transform="rotate(15)" />
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
            {[
                { id: 'all', label: 'Todas', icon: null },
                { id: 'main', label: 'Prato Principal', icon: <Utensils size={14} /> },
                { id: 'dessert', label: 'Sobremesas', icon: <IceCream size={14} /> },
                { id: 'snack', label: 'Lanches', icon: <Pizza size={14} /> },
                { id: 'drink', label: 'Bebidas', icon: <Coffee size={14} /> },
            ].map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as CategoryFilter)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap
                        ${activeCategory === cat.id 
                            ? 'bg-stone-800 text-white shadow-md' 
                            : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-100'}
                    `}
                >
                    {cat.icon}
                    {cat.label}
                    <span className={`ml-1 text-[10px] py-0.5 px-1.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        {getCount(cat.id as CategoryFilter)}
                    </span>
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          
          {activeRecipes.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                <Book size={48} className="mb-4 opacity-20" />
                <p>Nenhuma receita encontrada nesta categoria.</p>
                {activeTab === 'custom' && <p className="text-xs mt-2">Salve receitas na tela principal para vê-las aqui.</p>}
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRecipes.map((recipe, idx) => (
                <div 
                    key={recipe.id || idx} 
                    className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
                >
                    {activeTab === 'custom' && recipe.id && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteRecipe(recipe.id!); }}
                          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-full z-10 transition-colors"
                          title="Excluir receita"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    
                    {/* Image Preview in Card */}
                    {recipe.image ? (
                        <div className="h-40 w-full overflow-hidden relative">
                             <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="h-24 bg-stone-100 w-full flex items-center justify-center border-b border-stone-100">
                            <ChefHat className="text-stone-300" size={32} />
                        </div>
                    )}

                    <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                        <DifficultyBadge level={recipe.difficulty || 'easy'} />
                        <span className="text-xs text-stone-400 font-mono">
                          {recipe.profitMargin}% Margem
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-chef-600 transition-colors line-clamp-1">
                        {recipe.name}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                        {recipe.description || "Receita personalizada."}
                    </p>

                    {/* Nutrition Tags Badge Preview */}
                    {recipe.nutrition?.tags && recipe.nutrition.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {recipe.nutrition.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-md font-semibold border border-stone-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-stone-400 border-t border-stone-100 pt-3">
                        <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {recipe.overheads.preparationTimeMinutes + recipe.overheads.cookingTimeMinutes} min
                        </div>
                        <div className="flex items-center gap-1">
                        <Award size={14} />
                        {recipe.ingredients.length} Ingred.
                        </div>
                    </div>
                    </div>

                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex gap-2">
                        {activeTab === 'generated' && onSaveRecipe && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSaveRecipe(recipe); }}
                                className="flex-1 bg-white hover:bg-stone-100 text-chef-500 border border-stone-200 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                                title="Salvar em Minhas Receitas"
                            >
                                <Plus size={16} /> Salvar
                            </button>
                        )}
                        <button
                            onClick={() => onSelectRecipe(recipe)}
                            className="flex-[2] bg-stone-900 hover:bg-chef-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all group-hover:shadow-lg"
                        >
                            Cozinhar Agora
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
                ))}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
};
