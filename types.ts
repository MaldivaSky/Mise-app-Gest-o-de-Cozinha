
export interface Ingredient {
  id: string;
  name: string;
  // Package Info (How you bought it)
  packagePrice: number; 
  packageQuantity: number; 
  packageUnit: string; // e.g., 'kg', 'l', 'un'
  // Usage Info (How much you used)
  usedQuantity: number; 
  usedUnit: string; // e.g., 'g', 'ml', 'un'
}

export interface Overheads {
  preparationTimeMinutes: number;
  cookingTimeMinutes: number; // Forno/Fogão
  
  // Gas Logic
  gasCylinderPrice: number; // Preço do botijão (R$)
  gasCylinderWeight: number; // Peso do botijão (Kg) - Novo campo
  gasBurnerConsumption: number; // Consumo médio Kg/h (default 0.225)
  
  laborHourlyRate: number; // Valor da hora de trabalho
  electricityEstimate: number; // Estimativa fixa ou calculada
  waterEstimate: number; // Estimativa fixa
  otherCosts: number; // Embalagens, fitas, etc.
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export interface InstructionStep {
  text: string;
  timeInMinutes?: number; // Tempo estimado para este passo
}

export interface Recipe {
  id?: string; // Optional for new recipes, required for saved ones
  name: string;
  yields: number; // Rendimento em porções/unidades (Count)
  portionSize: number; // Tamanho da porção em gramas (Weight)
  profitMargin: number; // Porcentagem de lucro desejada
  ingredients: Ingredient[];
  overheads: Overheads;
  instructions: InstructionStep[]; // Atualizado para suportar tempo
  difficulty?: Difficulty; // Novo campo para gamificação
  description?: string; // Description for the book
}

export interface CostBreakdown {
  totalIngredients: number;
  totalGas: number;
  totalLabor: number;
  totalUtilities: number;
  totalCost: number;
  costPerUnit: number;
  suggestedSalePrice: number;
  totalProfit: number;
  totalMass: number; // Total estimated weight in grams
}

// --- Pantry Types ---
export interface PantryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  purchaseDate: string;
}

// --- Gamification Types ---

export interface CookingSession {
  id: string;
  recipeName: string;
  date: string; // ISO String
  xpEarned: number;
}

export interface UserProfile {
  name?: string; // Chef Name
  level: number;
  currentXP: number;
  nextLevelXP: number;
  history: CookingSession[];
}
