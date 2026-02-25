
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Trash2, ChefHat, Flame, Clock, Droplets, Banknote, Sparkles, Save, RotateCcw, DollarSign, PlayCircle, BookOpen, Wand2, Calculator, Trophy, Star, LogOut, User, Share2, AlertTriangle, ArrowRight, Scale, ShoppingBag, Utensils, AlertCircle, CheckCircle2, Book, PieChart, Hash, ShoppingBasket, SaveAll, Activity, HeartPulse, Camera } from 'lucide-react';
import { Ingredient, Recipe, Overheads, CostBreakdown, UserProfile, CookingSession, InstructionStep, PantryItem } from './types';
import { generateInstructionsOnly, calculateNutrition } from './services/geminiService';
import { requestNotificationPermission, checkPantryNotifications, checkMealNotifications, AppNotification } from './services/notificationService';
import { CostChart } from './components/CostChart';
import { InfoTooltip } from './components/InfoTooltip';
import { CookingMode } from './components/CookingMode';
import { RecipeGeneratorModal } from './components/RecipeGeneratorModal';
import { HistoryModal } from './components/HistoryModal';
import { LandingPage } from './components/LandingPage';
import { ShareModal } from './components/ShareModal';
import { RecipeBookModal } from './components/RecipeBookModal';
import { PantryModal } from './components/PantryModal';
import { NotificationToast } from './components/NotificationToast';
import { NutritionLabel } from './components/NutritionLabel';

// --- Constants & Helpers ---

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Quilo (kg)', type: 'mass', baseFactor: 1000 },
  { value: 'g', label: 'Grama (g)', type: 'mass', baseFactor: 1 },
  { value: 'mg', label: 'Miligrama (mg)', type: 'mass', baseFactor: 0.001 },
  { value: 'l', label: 'Litro (l)', type: 'vol', baseFactor: 1000 },
  { value: 'ml', label: 'Mililitro (ml)', type: 'vol', baseFactor: 1 },
  { value: 'un', label: 'Unidade (un)', type: 'count', baseFactor: 1 },
  { value: 'cx', label: 'Caixa (cx)', type: 'count', baseFactor: 1 },
  { value: 'lt', label: 'Lata (lt)', type: 'count', baseFactor: 1 },
  { value: 'pct', label: 'Pacote (pct)', type: 'count', baseFactor: 1 },
  { value: 'dz', label: 'Dúzia (dz)', type: 'count', baseFactor: 12 },
];

const getBaseFactor = (unit: string) => {
  const opt = UNIT_OPTIONS.find(u => u.value === unit);
  return opt ? opt.baseFactor : 1;
};

const getUnitType = (unit: string) => {
  const opt = UNIT_OPTIONS.find(u => u.value === unit);
  return opt ? opt.type : 'unknown';
};

// Helper to estimate mass in grams for calculation
const getEstimatedGramage = (qty: number, unit: string): number => {
    const type = getUnitType(unit);
    const factor = getBaseFactor(unit);
    
    // We assume 1ml approx 1g for general cooking (water density)
    if (type === 'mass' || type === 'vol') {
        return qty * factor;
    }
    // Cannot estimate mass for 'units', 'box', etc without density
    return 0;
};

// Reduced default overheads for more realistic initial values
const defaultOverheads: Overheads = {
  preparationTimeMinutes: 30,
  cookingTimeMinutes: 45,
  gasCylinderPrice: 120, 
  gasCylinderWeight: 13, // Standard in Brazil
  gasBurnerConsumption: 0.225, // Kg/hour standard high flame
  laborHourlyRate: 10, // Reduced from 20 to 10 (approx minimum wage + margins)
  electricityEstimate: 0.50, // Reduced fixed costs
  waterEstimate: 0.20,
  otherCosts: 1.00
};

const initialRecipe: Recipe = {
  name: '',
  yields: 1,
  portionSize: 0,
  profitMargin: 100,
  ingredients: [
    { id: '1', name: 'Leite Condensado', packagePrice: 6.50, packageQuantity: 1, packageUnit: 'lt', usedQuantity: 1, usedUnit: 'lt' },
    { id: '2', name: 'Leite Integral', packagePrice: 4.80, packageQuantity: 1, packageUnit: 'l', usedQuantity: 395, usedUnit: 'ml' }, // Example of conversion
    { id: '3', name: 'Ovos', packagePrice: 18.00, packageQuantity: 1, packageUnit: 'dz', usedQuantity: 3, usedUnit: 'un' }, // Example of conversion
  ],
  overheads: defaultOverheads,
  instructions: [],
  difficulty: 'custom',
  category: 'other'
};

// --- Gamification Logic ---
const calculateNextLevelXP = (level: number) => {
  return level * 500; // Linear progression for simplicity
};

const initialProfile: UserProfile = {
  level: 1,
  currentXP: 0,
  nextLevelXP: 500,
  history: []
};

// Helper to determine tag color
const getTagColor = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('fitness') || t.includes('low carb') || t.includes('balanced')) return 'bg-teal-100 text-teal-800 border-teal-200';
  if (t.includes('bodybuild') || t.includes('protein')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (t.includes('fat') || t.includes('sugar') || t.includes('high')) return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-stone-100 text-stone-600 border-stone-200';
};

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // App State
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [isCalculatingNutrition, setIsCalculatingNutrition] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [generatedPantryRecipes, setGeneratedPantryRecipes] = useState<Recipe[]>([]);
  
  // Modals & UI State
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [rewardData, setRewardData] = useState<{xp: number, levelUp: boolean} | null>(null);
  const [currentNotification, setCurrentNotification] = useState<AppNotification | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);

  // Load Persistence
  useEffect(() => {
    const savedProfile = localStorage.getItem('mise_profile');
    const savedAuth = localStorage.getItem('mise_auth');
    const savedPantry = localStorage.getItem('mise_pantry');
    const savedCustomRecipes = localStorage.getItem('mise_custom_recipes');

    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) { console.error(e); }
    }
    
    if (savedPantry) {
      try {
        setPantryItems(JSON.parse(savedPantry));
      } catch (e) { console.error(e); }
    }

    if (savedCustomRecipes) {
      try {
        setSavedRecipes(JSON.parse(savedCustomRecipes));
      } catch (e) { console.error(e); }
    }
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Notification Logic
  useEffect(() => {
    if (isAuthenticated) {
      // 1. Request Permission
      requestNotificationPermission();

      // 2. Check for notifications immediately
      const stockNotif = checkPantryNotifications(pantryItems);
      if (stockNotif) {
        setCurrentNotification(stockNotif);
      } else {
        const mealNotif = checkMealNotifications();
        if (mealNotif) setCurrentNotification(mealNotif);
      }

      // 3. Set interval to check periodically (every 10 minutes)
      const interval = setInterval(() => {
         const mealNotif = checkMealNotifications();
         if (mealNotif) setCurrentNotification(mealNotif);
      }, 600000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, pantryItems]);


  // Save Persistence
  useEffect(() => {
    localStorage.setItem('mise_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('mise_pantry', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('mise_custom_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // Auth Handlers
  const handleLogin = (name: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('mise_auth', 'true');
    setUserProfile(prev => ({ ...prev, name: name }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mise_auth');
  };

  // Pantry Handlers
  const handleAddToPantry = (item: Omit<PantryItem, 'id' | 'purchaseDate'>) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString(),
      purchaseDate: new Date().toISOString()
    };
    setPantryItems(prev => [newItem, ...prev]);
  };

  const handleRemoveFromPantry = (id: string) => {
    setPantryItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePantryGeneratedRecipes = (recipes: Recipe[]) => {
      setGeneratedPantryRecipes(recipes);
      setIsRecipeBookOpen(true); // Open book to show generated tab
  };

  // Custom Recipe Handlers
  const handleSaveCurrentRecipe = () => {
    if (!recipe.name) {
      alert("Dê um nome para a receita antes de salvar.");
      return;
    }
    const newRecipe: Recipe = {
      ...recipe,
      id: recipe.id || Date.now().toString()
    };
    
    // Check if exists to update, else add
    const exists = savedRecipes.find(r => r.id === newRecipe.id);
    if (exists) {
       setSavedRecipes(prev => prev.map(r => r.id === newRecipe.id ? newRecipe : r));
    } else {
       setSavedRecipes(prev => [...prev, newRecipe]);
    }
    
    // UI Feedback
    setRewardData({ xp: 0, levelUp: false }); // Hack to show popup
    setTimeout(() => setRewardData(null), 2000);
  };

  // New function to save generated recipes
  const handleSaveGeneratedRecipe = (generatedRecipe: Recipe) => {
    const newRecipe: Recipe = {
      ...generatedRecipe,
      id: Date.now().toString() // Ensure a fresh unique ID
    };
    
    setSavedRecipes(prev => [...prev, newRecipe]);
    
    // UI Feedback "Saved"
    setRewardData({ xp: 0, levelUp: false }); 
    setTimeout(() => setRewardData(null), 2000);
  };

  const handleDeleteCustomRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipe(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  // --- Calculations ---

  const calculateIngredientCost = (ing: Ingredient) => {
    if (ing.packageQuantity <= 0 || ing.packagePrice <= 0) return 0;

    const pkgType = getUnitType(ing.packageUnit);
    const usedType = getUnitType(ing.usedUnit);
    
    // Case 1: Identical Units (e.g., kg to kg, un to un) - Simple Ratio
    if (ing.packageUnit === ing.usedUnit) {
         return (ing.packagePrice / ing.packageQuantity) * ing.usedQuantity;
    }

    // Case 2: Compatible Types (e.g., kg to g, l to ml) - Base Factor Conversion
    if (pkgType === usedType && pkgType !== 'unknown') {
         const pkgBase = ing.packageQuantity * getBaseFactor(ing.packageUnit);
         const usedBase = ing.usedQuantity * getBaseFactor(ing.usedUnit);
         
         if (pkgBase > 0) {
           return (ing.packagePrice / pkgBase) * usedBase;
         }
    } 
    
    // Case 3: Special Cases (Dozen to Unit)
    if (ing.packageUnit === 'dz' && ing.usedUnit === 'un') {
         const pkgUnits = ing.packageQuantity * 12;
         return (ing.packagePrice / pkgUnits) * ing.usedQuantity;
    }

    // Case 4: Incompatible Types (e.g. 'lt' vs 'g') -> Cannot calculate safely
    return 0; 
  };

  const breakdown = useMemo<CostBreakdown>(() => {
    let totalIngredients = 0;
    let totalMass = 0;

    // 1. Ingredients Cost & Mass Calculation
    recipe.ingredients.forEach(ing => {
        totalIngredients += calculateIngredientCost(ing);
        totalMass += getEstimatedGramage(ing.usedQuantity, ing.usedUnit);
    });

    // 2. Gas Cost
    const gasPricePerKg = recipe.overheads.gasCylinderWeight > 0 
       ? recipe.overheads.gasCylinderPrice / recipe.overheads.gasCylinderWeight 
       : 0;
    
    const consumptionRate = recipe.overheads.gasBurnerConsumption || 0.225; 
    const gasCostPerHour = gasPricePerKg * consumptionRate;
    const totalGas = gasCostPerHour * (recipe.overheads.cookingTimeMinutes / 60);

    // 3. Labor Cost
    const totalHoursWorked = (recipe.overheads.preparationTimeMinutes + recipe.overheads.cookingTimeMinutes) / 60;
    const totalLabor = totalHoursWorked * recipe.overheads.laborHourlyRate;

    // 4. Utilities
    const totalUtilities = recipe.overheads.electricityEstimate + recipe.overheads.waterEstimate + recipe.overheads.otherCosts;

    // 5. Totals
    const totalCost = totalIngredients + totalGas + totalLabor + totalUtilities;
    const costPerUnit = recipe.yields > 0 ? totalCost / recipe.yields : 0;
    
    const profitAmount = totalCost * (recipe.profitMargin / 100);
    const suggestedSalePriceTotal = totalCost + profitAmount;
    const suggestedSalePrice = recipe.yields > 0 ? suggestedSalePriceTotal / recipe.yields : 0;

    return {
      totalIngredients,
      totalGas,
      totalLabor,
      totalUtilities,
      totalCost,
      costPerUnit,
      suggestedSalePrice,
      totalProfit: profitAmount,
      totalMass
    };
  }, [recipe]);

  // Sync effect: When Mass changes, update portion size based on current yields (keep yields fixed)
  useEffect(() => {
     if (recipe.yields > 0 && breakdown.totalMass > 0) {
        setRecipe(prev => ({
            ...prev,
            portionSize: parseFloat((breakdown.totalMass / prev.yields).toFixed(0))
        }));
     }
  }, [breakdown.totalMass]);


  // --- Handlers ---

  const handleYieldChange = (newYield: number) => {
     if (newYield <= 0) return;
     // If user changes Yield count, calculate new Portion Size (keeping Total Mass constant)
     const newPortionSize = breakdown.totalMass > 0 ? breakdown.totalMass / newYield : 0;
     
     setRecipe(prev => ({
         ...prev,
         yields: newYield,
         portionSize: parseFloat(newPortionSize.toFixed(0))
     }));
  };

  const handlePortionSizeChange = (newSize: number) => {
     if (newSize <= 0) return;
     // If user changes Portion Size, calculate new Yield Count (keeping Total Mass constant)
     if (breakdown.totalMass > 0) {
         const newYields = breakdown.totalMass / newSize;
         setRecipe(prev => ({
             ...prev,
             yields: Math.max(1, parseFloat(newYields.toFixed(1))), // Allow decimals or keep integer? Let's allow 1 decimal
             portionSize: newSize
         }));
     } else {
         setRecipe(prev => ({ ...prev, portionSize: newSize }));
     }
  };

  const handleRecipeGenerated = (newRecipeData: Partial<Recipe>) => {
      setRecipe(prev => ({
          ...prev,
          name: newRecipeData.name || prev.name,
          ingredients: newRecipeData.ingredients || [],
          overheads: {
              ...prev.overheads,
              ...(newRecipeData.overheads || {})
          },
          instructions: newRecipeData.instructions || [],
          difficulty: 'custom',
          category: newRecipeData.category || 'other',
          nutrition: newRecipeData.nutrition // Import nutrition if available
      }));
  };

  const handleLoadPreset = (presetRecipe: Recipe) => {
    // We need to strip the ID if it's a generated or preset recipe so it doesn't overwrite
    // unless it's a custom recipe we want to edit.
    // For now, loading a recipe essentially starts a "session" with that data.
    const newRecipe = {
        ...presetRecipe,
        // Keep ID if it's in savedRecipes, otherwise new ID to treat as new instance
        id: savedRecipes.some(r => r.id === presetRecipe.id) ? presetRecipe.id : undefined 
    };
    setRecipe(newRecipe);
    setIsRecipeBookOpen(false);
  };

  const handleGenerateInstructions = async () => {
     if (!recipe.name.trim()) {
        setAiError("O nome da receita é necessário para gerar instruções.");
        return;
     }
     setAiError(null);
     setIsGeneratingInstructions(true);

     const ingredientNames = recipe.ingredients.map(i => i.name);
     const instructions = await generateInstructionsOnly(recipe.name, ingredientNames);

     if (instructions) {
        setRecipe(prev => ({ ...prev, instructions }));
     } else {
        setAiError("Erro ao gerar instruções. Tente novamente.");
     }
     setIsGeneratingInstructions(false);
  };

  const handleCalculateNutrition = async () => {
     if (recipe.ingredients.length === 0) return;
     
     setIsCalculatingNutrition(true);
     const ingredientsList = recipe.ingredients.map(i => ({
         name: i.name,
         quantity: i.usedQuantity,
         unit: i.usedUnit
     }));
     
     const nutrition = await calculateNutrition(recipe.name || 'Receita', ingredientsList);
     
     if (nutrition) {
         setRecipe(prev => ({ ...prev, nutrition }));
     } else {
         // Optionally show error toast
     }
     setIsCalculatingNutrition(false);
  };

  const handleRecipeCompletion = () => {
    // 1. Calculate XP based on complexity
    // Base: 100
    // Ingredients: 10 per ingredient
    // Steps: 5 per step
    const ingredientXP = recipe.ingredients.length * 10;
    const stepsXP = (recipe.instructions?.length || 0) * 5;
    let baseXP = 100 + ingredientXP + stepsXP;

    // Apply Difficulty Multiplier
    let multiplier = 1;
    if (recipe.difficulty === 'medium') multiplier = 1.5;
    if (recipe.difficulty === 'hard') multiplier = 2.0;
    
    const xpEarned = Math.round(baseXP * multiplier);

    let newXP = userProfile.currentXP + xpEarned;
    let newLevel = userProfile.level;
    let levelUp = false;

    // Level Up Logic
    while (newXP >= userProfile.nextLevelXP) {
      newXP -= userProfile.nextLevelXP;
      newLevel++;
      levelUp = true;
    }

    const nextLevelXP = calculateNextLevelXP(newLevel);

    const newSession: CookingSession = {
      id: Date.now().toString(),
      recipeName: recipe.name || 'Receita sem nome',
      date: new Date().toISOString(),
      xpEarned
    };

    setUserProfile(prev => ({
      ...prev,
      level: newLevel,
      currentXP: newXP,
      nextLevelXP,
      history: [...prev.history, newSession]
    }));

    setRewardData({ xp: xpEarned, levelUp });
    setIsCookingMode(false);

    // Auto-hide reward after 4 seconds
    setTimeout(() => setRewardData(null), 4000);
  };

  const addIngredient = () => {
    const newId = Date.now().toString();
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { 
        id: newId, 
        name: '', 
        packagePrice: 0, 
        packageQuantity: 0, 
        packageUnit: 'kg', 
        usedQuantity: 0, 
        usedUnit: 'g' 
      }]
    }));
  };

  const removeIngredient = (id: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== id)
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => {
        if (ing.id === id) {
          return { ...ing, [field]: value };
        }
        return ing;
      })
    }));
  };

  const updateOverhead = (field: keyof Overheads, value: number) => {
    setRecipe(prev => ({
      ...prev,
      overheads: { ...prev.overheads, [field]: value }
    }));
  };

  // Simplified manual handler: treats everything as text only (0 mins time)
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const lines = text.split('\n');
    // Map text lines to InstructionStep objects
    const newSteps: InstructionStep[] = lines.map(line => ({
        text: line,
        timeInMinutes: 0
    }));
    setRecipe(prev => ({ ...prev, instructions: newSteps }));
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const overheadInputClass = "w-full bg-stone-700 text-yellow-400 border-stone-600 rounded-lg text-sm px-3 py-2 outline-none border focus:border-chef-500 focus:ring-1 focus:ring-chef-500 placeholder-stone-400";

  // --- Render ---

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-12 relative animate-in fade-in duration-500">
      
      {/* Notifications */}
      <NotificationToast 
        notification={currentNotification} 
        onClose={() => setCurrentNotification(null)}
        onAction={() => {
          setCurrentNotification(null);
          setIsPantryOpen(true);
        }} 
      />

      {/* Reward Popup */}
      {rewardData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 flex flex-col items-center animate-in zoom-in fade-in duration-300 pointer-events-auto max-w-sm text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4 relative">
              <Trophy size={48} className="text-yellow-600 animate-bounce" />
              <Star size={24} className="text-yellow-400 absolute -top-2 -right-2 animate-spin-slow" fill="currentColor"/>
            </div>
            {rewardData.xp > 0 ? (
                <>
                <h2 className="text-2xl font-black text-stone-800 uppercase tracking-wide">
                {rewardData.levelUp ? 'Nível Subiu!' : 'Receita Concluída!'}
                </h2>
                <p className="text-stone-500 mt-2">Você ganhou</p>
                <div className="text-4xl font-black text-chef-500 my-2">+{rewardData.xp} XP</div>
                {rewardData.levelUp && (
                <div className="bg-chef-500 text-white px-4 py-1 rounded-full text-sm font-bold mt-2 animate-pulse">
                    Agora você é Nível {userProfile.level}!
                </div>
                )}
                </>
            ) : (
                <>
                <h2 className="text-2xl font-black text-stone-800 uppercase tracking-wide">
                    Salvo com Sucesso!
                </h2>
                <p className="text-stone-500 mt-2">Sua receita foi adicionada ao seu Livro do Chef.</p>
                </>
            )}
            
            <button 
              onClick={() => setRewardData(null)}
              className="mt-6 text-stone-400 hover:text-stone-800 text-sm font-medium underline"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {isCookingMode && (
        <CookingMode 
          recipeName={recipe.name || 'Nova Receita'} 
          steps={recipe.instructions} 
          onClose={() => setIsCookingMode(false)}
          onComplete={handleRecipeCompletion}
        />
      )}

      {isGeneratorOpen && (
          <RecipeGeneratorModal 
            onClose={() => setIsGeneratorOpen(false)}
            onRecipeGenerated={handleRecipeGenerated}
          />
      )}

      {isRecipeBookOpen && (
        <RecipeBookModal 
          onClose={() => setIsRecipeBookOpen(false)}
          onSelectRecipe={handleLoadPreset}
          savedRecipes={savedRecipes}
          onDeleteRecipe={handleDeleteCustomRecipe}
          generatedRecipes={generatedPantryRecipes}
          onSaveRecipe={handleSaveGeneratedRecipe}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal 
          userProfile={userProfile} 
          onClose={() => setIsHistoryOpen(false)} 
        />
      )}

      {isShareOpen && (
        <ShareModal 
          recipe={recipe}
          breakdown={breakdown}
          chefName={userProfile.name}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {isPantryOpen && (
        <PantryModal
          items={pantryItems}
          onAddItem={handleAddToPantry}
          onRemoveItem={handleRemoveFromPantry}
          onGenerateRecipes={handlePantryGeneratedRecipes}
          onClose={() => setIsPantryOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">

            <img src="/logo.png" alt="Logo Mise" className="w-24 h-24 object-contain"/>

            <h1 className="text-2xl font-bold text-stone-900 tracking-tight hidden sm:block">Mise<span className="text-chef-600">.</span></h1>
            {userProfile.name && <span className="text-stone-400 text-sm ml-2 hidden md:block">| Olá, Chef {userProfile.name}</span>}
          </div>
          
          <div className="flex items-center gap-3">
             
             {/* Pantry Button - Highlighted (Orange/Black Theme) */}
             <button 
                onClick={() => setIsPantryOpen(true)}
                className="bg-chef-500 hover:bg-chef-400 text-stone-900 pl-4 pr-5 py-2.5 rounded-full transition-all shadow-lg shadow-chef-500/20 hover:shadow-chef-500/40 flex items-center gap-2 transform hover:-translate-y-1 active:scale-95 group font-bold border-2 border-stone-900"
                title="Minha Dispensa"
             >
                <div className="relative">
                    <ShoppingBasket size={22} className="group-hover:rotate-12 transition-transform text-stone-900" />
                    {pantryItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 bg-stone-900 text-chef-500 rounded-full text-[10px] flex items-center justify-center font-black border border-chef-500">
                            {pantryItems.length}
                        </span>
                    )}
                </div>
                <span className="font-black tracking-tight text-base hidden sm:block uppercase">MINHA DISPENSA</span>
             </button>

             <div className="h-6 w-px bg-stone-200 hidden sm:block"></div>

             {/* Gamification Badge */}
             <button 
               onClick={() => setIsHistoryOpen(true)}
               className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full border border-stone-200 transition-all group"
             >
                <div className="w-6 h-6 bg-chef-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {userProfile.level}
                </div>
                <div className="flex flex-col items-start">
                   <span className="text-[10px] text-stone-500 font-bold uppercase leading-none">Nível</span>
                   <div className="w-16 h-1.5 bg-stone-300 rounded-full mt-0.5 overflow-hidden">
                      <div 
                        className="h-full bg-chef-500" 
                        style={{ width: `${(userProfile.currentXP / userProfile.nextLevelXP) * 100}%` }}
                      />
                   </div>
                </div>
             </button>

             <div className="h-6 w-px bg-stone-200 hidden sm:block"></div>

             <button 
                onClick={() => setIsRecipeBookOpen(true)}
                className="bg-stone-900 hover:bg-black text-white p-2 rounded-full transition-colors flex items-center justify-center shadow-lg shadow-stone-500/20"
                title="Livro de Receitas"
             >
                <Book size={18} />
             </button>

             <button 
                onClick={() => setIsShareOpen(true)}
                className="text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 p-2 rounded-full transition-colors flex items-center justify-center"
                title="Gerar Comanda"
             >
                <Share2 size={18}/>
             </button>

             <button 
                onClick={() => setRecipe(initialRecipe)}
                className="text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 p-2 rounded-full transition-colors flex items-center justify-center"
                title="Limpar Receita"
             >
                <RotateCcw size={18}/> 
             </button>

             <button 
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center justify-center"
                title="Sair / Logout"
             >
                <LogOut size={18}/>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Recipe Name, Photo & Smart Import */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
                  <div className="w-full flex gap-4">
                     {/* Image Upload Trigger */}
                     <div className="shrink-0 relative group">
                        <label htmlFor="recipe-image-upload" className="block w-20 h-20 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-chef-500 hover:bg-chef-50 transition-all overflow-hidden relative">
                           {recipe.image ? (
                              <>
                                <img src={recipe.image} alt="Recipe" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={20} />
                                </div>
                              </>
                           ) : (
                              <Camera className="text-stone-400 group-hover:text-chef-500" size={24} />
                           )}
                        </label>
                        <input 
                           id="recipe-image-upload" 
                           type="file" 
                           accept="image/*"
                           capture="environment" // Forces camera on mobile
                           className="hidden"
                           onChange={handleImageUpload}
                        />
                     </div>

                     <div className="flex-1">
                        <label className="block text-sm font-medium text-stone-700 mb-2">Nome da Receita</label>
                        <input 
                        type="text" 
                        value={recipe.name}
                        onChange={(e) => setRecipe({...recipe, name: e.target.value})}
                        placeholder="Ex: Pudim de Leite Condensado"
                        className="w-full rounded-xl bg-stone-900 border-stone-800 text-yellow-400 placeholder-stone-600 shadow-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 p-3 border outline-none transition-all font-bold"
                        />
                     </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsGeneratorOpen(true)}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold"
                        title="Gerar com IA"
                    >
                        <Sparkles size={18} />
                    </button>
                    <button 
                        onClick={handleSaveCurrentRecipe}
                        className="flex-1 bg-chef-500 hover:bg-chef-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md font-bold"
                        title="Salvar no Livro"
                    >
                        <SaveAll size={18} />
                    </button>
                  </div>
              </div>
              
              {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
            </div>

            {/* 2. Ingredients List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                  <Banknote size={20} className="text-chef-500"/>
                  Ingredientes
                </h2>
                <button 
                  onClick={addIngredient} 
                  className="bg-chef-500 hover:bg-chef-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-chef-500/20 flex items-center gap-1 transition-all transform hover:-translate-y-0.5"
                >
                  <Plus size={16}/> Novo Ingrediente
                </button>
              </div>

              <div className="space-y-4">
                {recipe.ingredients.map((ing) => {
                  const itemCost = calculateIngredientCost(ing);
                  const pkgType = getUnitType(ing.packageUnit);
                  const usedType = getUnitType(ing.usedUnit);
                  
                  // Validation Logic for UI colors
                  let statusColor = "bg-stone-200 text-stone-500"; // Default/Neutral
                  let statusIcon = <ArrowRight size={14} />;
                  let isError = false;
                  let isAutoConvert = false;

                  if (ing.packageUnit === ing.usedUnit) {
                     // Same unit
                     statusColor = "bg-green-100 text-green-600";
                     statusIcon = <CheckCircle2 size={14} />;
                  } else if (pkgType !== 'unknown' && pkgType === usedType) {
                     // Compatible conversion
                     statusColor = "bg-blue-100 text-blue-600";
                     statusIcon = <Scale size={14} />;
                     isAutoConvert = true;
                  } else if (ing.packageUnit === 'dz' && ing.usedUnit === 'un') {
                     // Dozen logic
                     statusColor = "bg-blue-100 text-blue-600";
                     statusIcon = <Scale size={14} />;
                     isAutoConvert = true;
                  } else {
                     // Error / Incompatible
                     statusColor = "bg-red-100 text-red-500";
                     statusIcon = <AlertCircle size={14} />;
                     isError = true;
                  }

                  // If empty/zero, keep neutral
                  if (ing.packageQuantity <= 0 || ing.usedQuantity <= 0) {
                      statusColor = "bg-stone-100 text-stone-400";
                      statusIcon = <ArrowRight size={14} />;
                      isError = false; // Don't scream error if just empty
                  }
                  
                  return (
                  <div key={ing.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 transition-all hover:shadow-md animate-in slide-in-from-bottom-2 duration-300">
                    
                    {/* Header: Name and Remove */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-full mr-4">
                            <input 
                              type="text" 
                              placeholder="Nome do Item (ex: Farinha de Trigo)"
                              value={ing.name}
                              onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                              className="w-full text-lg font-bold text-stone-800 placeholder-stone-300 border-none outline-none focus:ring-0 bg-transparent p-0 transition-all focus:scale-[1.01] origin-left"
                            />
                        </div>
                        <button 
                           onClick={() => removeIngredient(ing.id)}
                           className="text-stone-300 hover:text-red-500 transition-colors p-1"
                           title="Remover item"
                        >
                           <Trash2 size={18} />
                        </button>
                    </div>

                    {/* Flow Container */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                        
                        {/* 1. Market Section (Buy) */}
                        <div className="flex-1 bg-stone-50 rounded-xl p-3 border border-stone-100 hover:border-stone-300 transition-all duration-300 focus-within:ring-2 focus-within:ring-stone-200 focus-within:border-stone-300 focus-within:shadow-lg focus-within:-translate-y-1">
                            <div className="flex items-center gap-1 mb-2 text-stone-500">
                                <ShoppingBag size={12} />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Mercado (Compra)</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {/* Price Input */}
                                <div className="bg-white rounded-lg border border-stone-200 px-2 py-1 flex items-center shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-chef-500 focus-within:border-transparent focus-within:scale-105 origin-left">
                                    <span className="text-stone-400 text-xs mr-1">R$</span>
                                    <input 
                                      type="number" min="0" step="0.01"
                                      value={ing.packagePrice}
                                      onChange={(e) => updateIngredient(ing.id, 'packagePrice', parseFloat(e.target.value) || 0)}
                                      className="w-full text-sm font-semibold text-stone-700 outline-none bg-transparent"
                                      placeholder="0.00"
                                    />
                                </div>
                                
                                {/* Quantity Group */}
                                <div className="flex bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-chef-500 focus-within:border-transparent focus-within:scale-105 origin-left">
                                    <input 
                                      type="number" min="0"
                                      value={ing.packageQuantity}
                                      onChange={(e) => updateIngredient(ing.id, 'packageQuantity', parseFloat(e.target.value) || 0)}
                                      className="w-full text-sm font-semibold text-stone-700 outline-none px-2 py-1 text-center bg-transparent"
                                      placeholder="Qtd"
                                    />
                                    <select
                                       value={ing.packageUnit}
                                       onChange={(e) => updateIngredient(ing.id, 'packageUnit', e.target.value)}
                                       className="bg-stone-100 text-xs font-bold text-stone-600 outline-none px-1 border-l border-stone-200 cursor-pointer"
                                    >
                                       {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Connector */}
                        <div className={`hidden md:flex flex-col items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${statusColor}`}>
                             {statusIcon}
                        </div>

                        {/* 3. Recipe Section (Use) */}
                        <div className="flex-1 bg-chef-50 rounded-xl p-3 border border-chef-100 hover:border-chef-300 transition-all duration-300 relative overflow-hidden focus-within:ring-2 focus-within:ring-chef-200 focus-within:border-chef-300 focus-within:shadow-lg focus-within:-translate-y-1">
                            {/* Decorative line for error state */}
                            {isError && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>}
                            
                            <div className="flex items-center gap-1 mb-2 text-chef-600">
                                <Utensils size={12} />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Receita (Uso)</span>
                            </div>

                            <div className="flex bg-white rounded-lg border border-chef-200 shadow-sm overflow-hidden h-[34px] transition-all duration-200 focus-within:ring-2 focus-within:ring-chef-500 focus-within:border-transparent focus-within:scale-105 origin-left">
                                <input 
                                  type="number" min="0"
                                  value={ing.usedQuantity}
                                  onChange={(e) => updateIngredient(ing.id, 'usedQuantity', parseFloat(e.target.value) || 0)}
                                  className="w-full text-sm font-semibold text-stone-700 outline-none px-2 py-1 bg-transparent"
                                  placeholder="Qtd usada"
                                />
                                <select
                                   value={ing.usedUnit}
                                   onChange={(e) => updateIngredient(ing.id, 'usedUnit', e.target.value)}
                                   className="bg-chef-100 text-xs font-bold text-chef-700 outline-none px-2 border-l border-chef-200 cursor-pointer"
                                >
                                   {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                                </select>
                            </div>
                        </div>

                    </div>

                    {/* Footer: Messages & Total */}
                    <div className="mt-3 flex justify-between items-center border-t border-stone-100 pt-2">
                         <div className="flex items-center gap-2">
                             {isError && (
                               <span className="text-xs text-red-500 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded-full">
                                  Unidades incompatíveis
                               </span>
                             )}
                             {isAutoConvert && (
                               <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wide bg-blue-50 px-2 py-1 rounded-full">
                                  Conversão Auto
                               </span>
                             )}
                         </div>

                         <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-400 font-medium uppercase">Custo:</span>
                            <span className={`text-lg font-bold ${itemCost > 0 ? 'text-stone-800' : 'text-stone-300'}`}>
                               {formatCurrency(itemCost)}
                            </span>
                         </div>
                    </div>

                  </div>
                )})}

                {recipe.ingredients.length === 0 && (
                   <div className="text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center group cursor-pointer hover:bg-stone-100 transition-colors" onClick={addIngredient}>
                      <ShoppingBag size={32} className="text-stone-300 mb-2 group-hover:text-chef-400 transition-colors" />
                      <p className="text-stone-500 font-medium">Sua lista de compras está vazia</p>
                      <p className="text-xs text-stone-400 mt-1">Adicione ingredientes para calcular o custo</p>
                      <button className="mt-4 text-chef-500 font-bold text-sm hover:underline">Adicionar Item +</button>
                   </div>
                )}
              </div>
            </div>

            {/* 3. Instructions (Smart Book Feature) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                     <BookOpen size={20} className="text-chef-500"/>
                     Modo de Preparo
                  </h2>
                  <button 
                     onClick={handleGenerateInstructions}
                     disabled={isGeneratingInstructions || !recipe.name}
                     className="text-xs bg-chef-50 text-chef-600 px-3 py-1.5 rounded-full font-medium hover:bg-chef-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                     {isGeneratingInstructions ? (
                        <div className="animate-spin h-3 w-3 border-2 border-chef-500 border-t-transparent rounded-full"/>
                     ) : (
                        <Wand2 size={12}/>
                     )}
                     Escrever com IA
                  </button>
               </div>
               
               <p className="text-xs text-stone-500 mb-2">Edite os passos abaixo (um por linha) ou deixe a IA gerar.</p>
               <textarea
                 rows={6}
                 value={recipe.instructions ? recipe.instructions.map(i => i.text).join('\n') : ''}
                 onChange={handleInstructionsChange}
                 placeholder="1. Misture os ovos...&#10;2. Adicione o leite..."
                 className="w-full bg-stone-50 border-stone-200 rounded-xl p-4 text-sm focus:ring-1 focus:ring-chef-500 border outline-none resize-y"
               />
            </div>

            {/* 4. Production Variables (Overheads) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
               <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2 mb-6">
                  <Clock size={20} className="text-chef-500"/>
                  Produção e Custos Fixos
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tempo */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                     <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                        <Clock size={16}/> Tempo
                     </h3>
                     <div className="space-y-3">
                        <div>
                           <label className="text-xs text-stone-500 block mb-1">Preparo Total (min)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.preparationTimeMinutes}
                              onChange={(e) => updateOverhead('preparationTimeMinutes', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                        <div>
                           <label className="text-xs text-stone-500 block mb-1">Tempo de Fogo/Forno (min)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.cookingTimeMinutes}
                              onChange={(e) => updateOverhead('cookingTimeMinutes', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Gas Config - REDESIGNED */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                     <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                        <Flame size={16}/> Custo de Gás (Detalhado)
                     </h3>
                     <div className="grid grid-cols-2 gap-3 mb-2">
                         <div>
                           <label className="text-xs text-stone-500 block mb-1">Preço Botijão (R$)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.gasCylinderPrice}
                              onChange={(e) => updateOverhead('gasCylinderPrice', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                        <div>
                           <label className="text-xs text-stone-500 block mb-1">Peso (Kg)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.gasCylinderWeight}
                              onChange={(e) => updateOverhead('gasCylinderWeight', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                              placeholder="ex: 13"
                           />
                        </div>
                     </div>
                     <div className="bg-stone-200/50 p-2 rounded-lg text-xs text-stone-600">
                        <div className="flex justify-between mb-1">
                          <span>Consumo Médio (Alta Chama):</span>
                          <strong>0.225 Kg/h</strong>
                        </div>
                        <div className="flex justify-between text-chef-700 font-bold">
                          <span>Custo por Hora:</span>
                          <span>
                            {recipe.overheads.gasCylinderWeight > 0 
                              ? formatCurrency((recipe.overheads.gasCylinderPrice / recipe.overheads.gasCylinderWeight) * 0.225)
                              : 'R$ 0,00'
                            }/h
                          </span>
                        </div>
                     </div>
                  </div>

                   {/* Labor */}
                   <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                     <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                        <ChefHat size={16}/> Mão de Obra
                     </h3>
                     <div>
                           <label className="text-xs text-stone-500 block mb-1">Valor Hora (R$) <InfoTooltip text="Salário mensal / 220h."/></label>
                           <input 
                              type="number"
                              value={recipe.overheads.laborHourlyRate}
                              onChange={(e) => updateOverhead('laborHourlyRate', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                  </div>

                  {/* Utilities */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                     <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                        <Droplets size={16}/> Gastos Extras
                     </h3>
                     <div className="grid grid-cols-2 gap-2">
                         <div>
                           <label className="text-xs text-stone-500 block mb-1">Água (R$)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.waterEstimate}
                              onChange={(e) => updateOverhead('waterEstimate', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                        <div>
                           <label className="text-xs text-stone-500 block mb-1">Luz (R$)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.electricityEstimate}
                              onChange={(e) => updateOverhead('electricityEstimate', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                         <div className="col-span-2">
                           <label className="text-xs text-stone-500 block mb-1">Embalagens (R$)</label>
                           <input 
                              type="number"
                              value={recipe.overheads.otherCosts}
                              onChange={(e) => updateOverhead('otherCosts', parseFloat(e.target.value) || 0)}
                              className={overheadInputClass}
                           />
                        </div>
                     </div>
                  </div>

               </div>
            </div>

          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Sticky Card */}
            <div className="sticky top-24 space-y-6">
                
                {/* Main Results Card */}
                <div className="bg-stone-800 text-white p-6 rounded-3xl shadow-xl ring-1 ring-white/10">
                    <h2 className="text-lg font-medium text-stone-300 mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-chef-500"/>
                        Resumo de Custos
                    </h2>

                    <div className="mb-6 flex justify-center">
                        <CostChart breakdown={breakdown} />
                    </div>

                    <div className="space-y-4 border-t border-stone-700 pt-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-400">Total Ingredientes</span>
                            <span className="font-semibold">{formatCurrency(breakdown.totalIngredients)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-400">Gás + Energia</span>
                            <span className="font-semibold">{formatCurrency(breakdown.totalGas + breakdown.totalUtilities)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-400">Mão de Obra</span>
                            <span className="font-semibold">{formatCurrency(breakdown.totalLabor)}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-chef-400 pt-2 border-t border-stone-700 mt-2">
                            <span>Custo Total</span>
                            <span>{formatCurrency(breakdown.totalCost)}</span>
                        </div>
                    </div>
                </div>

                {/* Health Profile Card (New Feature) */}
                {recipe.nutrition && (
                   <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="p-2 bg-pink-100 text-pink-600 rounded-full">
                            <HeartPulse size={20} />
                         </div>
                         <h3 className="font-bold text-stone-800">Perfil Nutricional</h3>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                         <div>
                            <span className="text-xs text-stone-400 uppercase tracking-wide">Total Receita</span>
                            <div className="text-2xl font-black text-stone-800">{recipe.nutrition.totalCalories} <span className="text-sm font-normal text-stone-500">kcal</span></div>
                         </div>
                         <div className="text-right">
                             <span className="text-xs text-stone-400 uppercase tracking-wide">Por Unidade</span>
                             <div className="text-xl font-bold text-stone-800">
                                {Math.round(recipe.nutrition.totalCalories / (recipe.yields || 1))} <span className="text-sm font-normal text-stone-500">kcal</span>
                             </div>
                         </div>
                      </div>

                      {recipe.nutrition.tags && recipe.nutrition.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                             {recipe.nutrition.tags.map((tag, idx) => (
                                <span key={idx} className={`text-xs px-2 py-1 rounded-md font-bold border ${getTagColor(tag)}`}>
                                   {tag}
                                </span>
                             ))}
                          </div>
                      )}
                   </div>
                )}
                
                {/* Nutrition Card Logic (Details) */}
                {recipe.nutrition ? (
                   <NutritionLabel nutrition={recipe.nutrition} yields={recipe.yields} />
                ) : (
                   <div className="bg-white border-2 border-dashed border-stone-200 rounded-xl p-6 text-center">
                       <p className="text-stone-400 text-sm mb-3">Sem dados nutricionais</p>
                       <button
                         onClick={handleCalculateNutrition}
                         disabled={isCalculatingNutrition || recipe.ingredients.length === 0}
                         className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
                       >
                           {isCalculatingNutrition ? (
                             <div className="animate-spin h-4 w-4 border-2 border-stone-400 border-t-transparent rounded-full"/>
                           ) : (
                             <Activity size={16} />
                           )}
                           Calcular Calorias & Perfil
                       </button>
                   </div>
                )}

                {/* Tutorial / Cooking Mode CTA */}
                <button
                    onClick={() => setIsCookingMode(true)}
                    disabled={!recipe.instructions || recipe.instructions.length === 0}
                    className="w-full bg-gradient-to-r from-chef-500 to-chef-600 text-white p-4 rounded-2xl shadow-lg shadow-chef-500/20 hover:shadow-chef-500/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <PlayCircle size={28} />
                    <div className="text-left">
                        <div className="text-xs font-medium text-chef-100 uppercase tracking-wider">Modo Cozinheiro</div>
                        <div className="text-lg font-bold leading-tight">Iniciar Preparo</div>
                    </div>
                </button>

                {/* Profit Calculator with Slider */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-200">
                    <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                        <Scale size={20} className="text-green-600"/>
                        Rendimento & Precificação
                    </h2>
                    
                    <div className="space-y-6">
                        
                        {/* Yield Calculator */}
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold uppercase text-stone-500 tracking-wider">Calculadora de Porções</span>
                              <span className="text-[10px] text-stone-400">Baseado no peso total</span>
                           </div>
                           
                           <div className="flex items-center gap-3 mb-4">
                               <div className="p-2 bg-stone-200 rounded-full text-stone-600">
                                   <Scale size={16} />
                               </div>
                               <div>
                                   <div className="text-xs text-stone-500">Peso Total da Receita</div>
                                   <div className="font-bold text-stone-800">{breakdown.totalMass.toFixed(0)}g <span className="text-xs font-normal text-stone-400">(Estimado)</span></div>
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="text-xs font-medium text-stone-500 block mb-1 flex items-center gap-1">
                                      <Hash size={12} /> Qtd. Unidades
                                   </label>
                                   <input 
                                       type="number"
                                       min="1"
                                       step="1"
                                       value={recipe.yields}
                                       onChange={(e) => handleYieldChange(parseFloat(e.target.value) || 0)}
                                       className="w-full bg-white border border-stone-200 rounded-lg text-sm px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors text-center font-bold"
                                   />
                               </div>
                               <div>
                                   <label className="text-xs font-medium text-stone-500 block mb-1 flex items-center gap-1">
                                      <PieChart size={12} /> Peso Porção (g)
                                   </label>
                                   <input 
                                       type="number"
                                       min="1"
                                       step="1"
                                       value={recipe.portionSize}
                                       onChange={(e) => handlePortionSizeChange(parseFloat(e.target.value) || 0)}
                                       className="w-full bg-white border border-stone-200 rounded-lg text-sm px-3 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors text-center font-bold"
                                   />
                               </div>
                           </div>
                        </div>

                        {/* Interactive Profit Slider */}
                        <div className="pt-2 pb-4">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-medium text-stone-500">Margem de Lucro</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                      type="number"
                                      value={recipe.profitMargin}
                                      onChange={(e) => setRecipe({...recipe, profitMargin: parseFloat(e.target.value) || 0})}
                                      className="w-16 text-right bg-transparent text-sm font-bold text-green-700 outline-none border-b border-green-200 focus:border-green-500"
                                    />
                                    <span className="text-sm font-bold text-green-700">%</span>
                                </div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="300"
                              step="5"
                              value={recipe.profitMargin}
                              onChange={(e) => setRecipe({...recipe, profitMargin: parseFloat(e.target.value)})}
                              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-chef-500"
                            />
                            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                                <span>0%</span>
                                <span>150%</span>
                                <span>300%</span>
                            </div>
                        </div>

                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100 shadow-inner">
                             <div className="space-y-3">
                                 <div className="flex justify-between items-baseline text-stone-600">
                                     <span className="text-sm font-medium">Custo Total da Receita</span>
                                     <div className="flex-grow border-b-2 border-dotted border-stone-300 mx-2 opacity-30"></div>
                                     <span className="font-bold text-stone-800">{formatCurrency(breakdown.totalCost)}</span>
                                 </div>
                                 <div className="flex justify-between items-baseline text-stone-600">
                                     <span className="text-sm font-medium">Custo por Unidade</span>
                                     <div className="flex-grow border-b-2 border-dotted border-stone-300 mx-2 opacity-30"></div>
                                     <span className="font-bold text-stone-800">{formatCurrency(breakdown.costPerUnit)}</span>
                                 </div>
                                 <div className="flex justify-between items-baseline text-green-700">
                                     <span className="text-sm font-bold">Lucro Total</span>
                                     <div className="flex-grow border-b-2 border-dotted border-green-300 mx-2 opacity-30"></div>
                                     <span className="font-bold">{formatCurrency(breakdown.totalProfit)}</span>
                                 </div>
                             </div>

                             <div className="pt-5 mt-5 border-t border-green-200">
                                <div className="text-[10px] text-green-600 uppercase font-bold tracking-widest mb-1">Preço de Venda Sugerido (un)</div>
                                <div className="text-4xl font-black text-green-600 tracking-tighter shadow-green-200 drop-shadow-sm">{formatCurrency(breakdown.suggestedSalePrice)}</div>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
