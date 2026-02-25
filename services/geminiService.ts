import { PantryItem, NutritionData, InstructionStep } from "../types";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

// AGORA SIM: O modelo exato que o Google listou na sua conta
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt: string) {
  if (!API_KEY) return null;

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ERRO DIRETO DO GOOGLE:", errorData);
      return null;
    }

    const data = await response.json();
    let textResponse = data.candidates[0].content.parts[0].text;

    // Limpeza de Markdown
    textResponse = textResponse.replace(/```json|```/g, "").trim();

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("ERRO NO PROCESSAMENTO:", error);
    return null;
  }
}

// --- AS SUAS FUNÇÕES INTACTAS ---

export const analyzeRecipeWithGemini = async (userPrompt: string) => {
  const prompt = `Gere uma ficha técnica gastronômica em JSON para: "${userPrompt}". 
  Use este formato: { "recipeName": "string", "description": "string", "ingredients": [{ "name": "string", "packagePrice": 0, "packageQuantity": 0, "packageUnit": "g", "usedQuantity": 0, "usedUnit": "g" }], "prepTimeMinutes": 0, "cookingTimeMinutes": 0, "instructions": [{ "step": "string", "time": 0 }], "difficulty": "Médio", "category": "Almoço", "nutrition": { "totalCalories": 0, "caloriesPerServing": 0, "protein": 0, "carbs": 0, "fats": 0, "tags": [] } }`;
  return await callGemini(prompt);
};

export const calculateNutrition = async (recipeName: string, ingredients: any[]): Promise<NutritionData | null> => {
  const ingList = ingredients.map(i => `${i.usedQuantity} ${i.usedUnit} de ${i.name}`).join(", ");
  const prompt = `Calcule a nutrição para "${recipeName}" com: ${ingList}. JSON: { "totalCalories": 0, "caloriesPerServing": 0, "protein": 0, "carbs": 0, "fats": 0, "tags": [] }`;
  return await callGemini(prompt);
};

export const suggestRecipesFromPantry = async (pantryItems: PantryItem[]) => {
  const items = pantryItems.map(p => p.name).join(", ");
  const prompt = `Sugira 3 receitas com: ${items}. JSON: { "recipes": [...] }`;
  const result = await callGemini(prompt);
  return result?.recipes || [];
};

export const generateInstructionsOnly = async (recipeName: string, ingredients: string[]) => {
  const prompt = `Gere instruções para "${recipeName}". JSON: [ { "step": "string", "time": 0 } ]`;
  return await callGemini(prompt);
};