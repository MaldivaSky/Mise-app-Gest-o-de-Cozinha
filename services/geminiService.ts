
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Ingredient, Overheads, InstructionStep, PantryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We define a simplified structure for the AI response to map into our app types
interface AIJoaquinRecipe {
  recipeName: string;
  ingredients: {
    name: string;
    packagePrice: number;
    packageQuantity: number;
    packageUnit: string;
    usedQuantity: number;
    usedUnit: string;
  }[];
  prepTimeMinutes: number;
  cookingTimeMinutes: number;
  instructions: { step: string; time: number }[];
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

const RECIPE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          packagePrice: { type: Type.NUMBER, description: "Estimated market price for the full package" },
          packageQuantity: { type: Type.NUMBER, description: "Full package size (e.g., 1 for 1kg)" },
          packageUnit: { type: Type.STRING, description: "Unit: kg, g, l, ml, un, cx, lt, dz" },
          usedQuantity: { type: Type.NUMBER },
          usedUnit: { type: Type.STRING, description: "Unit: kg, g, l, ml, un, cx, lt, dz" },
        },
        required: ["name", "packagePrice", "packageQuantity", "packageUnit", "usedQuantity", "usedUnit"],
      },
    },
    prepTimeMinutes: { type: Type.NUMBER },
    cookingTimeMinutes: { type: Type.NUMBER },
    instructions: { 
      type: Type.ARRAY, 
      items: { 
          type: Type.OBJECT,
          properties: {
              step: { type: Type.STRING },
              time: { type: Type.NUMBER, description: "Time in minutes for this step" }
          },
          required: ["step", "time"]
      },
    },
    difficulty: { type: Type.STRING, description: "Difficulty level: easy, medium, or hard" }
  },
  required: ["recipeName", "description", "ingredients", "prepTimeMinutes", "cookingTimeMinutes", "instructions", "difficulty"],
};

export const analyzeRecipeWithGemini = async (userPrompt: string): Promise<AIJoaquinRecipe | null> => {
  try {
    const prompt = `
      You are a professional chef and cost accountant.
      User Request: "${userPrompt}".
      
      Based on this request, generate a full recipe structure.
      1. Create a suitable Title (Recipe Name) in Portuguese.
      2. List ingredients with estimated costs in BRL (Brazil).
         IMPORTANT: For ingredients, specify how it is bought (package) vs how it is used.
         Example: Bought 1 'kg' of Sugar, used 200 'g'.
         Units allowed: 'kg', 'g', 'l', 'ml', 'un', 'cx' (box), 'lt' (can), 'dz' (dozen).
      3. Estimate preparation and cooking times.
      4. Write step-by-step instructions in Portuguese.
         IMPORTANT: For each step, estimate the time in minutes it takes to complete (e.g., "Mix ingredients" = 2 mins, "Bake" = 40 mins).

      Be realistic with quantities and prices.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIJoaquinRecipe;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing recipe with Gemini:", error);
    return null;
  }
};

export const generateInstructionsOnly = async (recipeName: string, ingredients: string[]): Promise<InstructionStep[] | null> => {
  try {
    const ingredientsContext = ingredients.length > 0 ? `Ingredients available: ${ingredients.join(', ')}.` : '';
    
    const prompt = `
      Write step-by-step cooking instructions for a recipe named "${recipeName}".
      ${ingredientsContext}
      
      Return a JSON object containing a list of objects (instructions).
      Each object must have:
      - 'text': A clear, actionable step in Portuguese (start with imperative verbs like "Misture", "Asse").
      - 'timeInMinutes': Estimated time to complete this step (number). Use 0 if it's instantaneous.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            instructions: {
              type: Type.ARRAY,
              items: { 
                  type: Type.OBJECT,
                  properties: {
                      text: { type: Type.STRING },
                      timeInMinutes: { type: Type.NUMBER }
                  },
                  required: ["text", "timeInMinutes"]
              },
            }
          },
          required: ["instructions"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.instructions;
    }
    return null;
  } catch (error) {
    console.error("Error generating instructions:", error);
    return null;
  }
};

export const suggestRecipesFromPantry = async (pantryItems: PantryItem[]): Promise<AIJoaquinRecipe[] | null> => {
  try {
    const pantryList = pantryItems.map(p => `${p.quantity}${p.unit} of ${p.name}`).join(', ');
    
    const prompt = `
      I have these ingredients in my pantry: ${pantryList}.
      
      TASK: Create a DAILY MEAL PLAN (Menu do Dia) using these items (you can assume I have basics like salt, oil, water, flour, sugar).
      
      You must return exactly 3 recipes corresponding to:
      1. Breakfast (Café da Manhã)
      2. Lunch (Almoço)
      3. Dinner (Jantar)
      
      CRITICAL INSTRUCTIONS:
      - In the 'description' field of the recipe, explicitly state: "Sugestão para: [Café/Almoço/Jantar]".
      - For EVERY ingredient (even the ones from my pantry), you MUST estimate the 'packagePrice' and 'packageQuantity' based on typical Brazilian market prices (BRL). This is required so I can calculate the cost of the recipe.
      
      Example Ingredient Output:
      { name: "Milk", packagePrice: 5.00, packageQuantity: 1, packageUnit: "l", usedQuantity: 200, usedUnit: "ml" }
      
      Output strictly JSON. Language: Portuguese.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipes: {
                type: Type.ARRAY,
                items: RECIPE_SCHEMA 
              }
            },
            required: ["recipes"]
          }
        }
    });

    if (response.text) {
       const data = JSON.parse(response.text);
       return data.recipes;
    }
    return null;

  } catch (error) {
    console.error("Error suggesting from pantry:", error);
    return null;
  }
}
