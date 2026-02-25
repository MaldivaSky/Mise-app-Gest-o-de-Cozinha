
import { PantryItem } from "../types";

export type NotificationType = 'low_stock' | 'meal_suggestion' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

// Helper to check if we already sent a notification today
const hasNotifiedToday = (key: string): boolean => {
  const last = localStorage.getItem(key);
  if (!last) return false;
  const lastDate = new Date(last).toDateString();
  const today = new Date().toDateString();
  return lastDate === today;
};

const setNotifiedToday = (key: string) => {
  localStorage.setItem(key, new Date().toISOString());
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  
  if (Notification.permission === "granted") return true;
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

export const sendBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: '/favicon.ico', // Assuming you might have one, or generic
    });
  }
};

export const checkPantryNotifications = (items: PantryItem[]): AppNotification | null => {
  const LOW_STOCK_THRESHOLD = 2;
  const NOTIF_KEY = 'mise_last_stock_notif';

  if (hasNotifiedToday(NOTIF_KEY)) return null;

  // Check for low stock items
  const lowStockItems = items.filter(i => i.quantity <= LOW_STOCK_THRESHOLD);

  if (lowStockItems.length > 0) {
    const names = lowStockItems.map(i => i.name).slice(0, 2).join(', ');
    const suffix = lowStockItems.length > 2 ? ` e mais ${lowStockItems.length - 2} itens` : '';
    
    setNotifiedToday(NOTIF_KEY);
    
    const message = `Sua dispensa precisa de atenção! ${names}${suffix} estão acabando.`;
    sendBrowserNotification("Estoque Baixo 📉", message);

    return {
      id: Date.now().toString(),
      title: "Estoque Baixo",
      message,
      type: 'low_stock'
    };
  }

  return null;
};

export const checkMealNotifications = (): AppNotification | null => {
  const hour = new Date().getHours();
  let mealKey = '';
  let title = '';
  let message = '';

  // Logic for Meal Times
  if (hour >= 7 && hour < 10) {
    mealKey = 'mise_notif_breakfast';
    title = "Hora do Café ☕";
    message = "Que tal preparar algo especial para começar o dia? Veja suas sugestões.";
  } else if (hour >= 11 && hour < 14) {
    mealKey = 'mise_notif_lunch';
    title = "Planejando o Almoço? 🥗";
    message = "Veja o que você pode cozinhar com o que tem na dispensa agora.";
  } else if (hour >= 18 && hour < 20) {
    mealKey = 'mise_notif_dinner';
    title = "Jantar Prático 🍝";
    message = "Não sabe o que fazer hoje? A IA pode montar seu cardápio.";
  } else {
    return null; // Not a specific meal time
  }

  if (hasNotifiedToday(mealKey)) return null;

  setNotifiedToday(mealKey);
  sendBrowserNotification(title, message);

  return {
    id: Date.now().toString(),
    title,
    message,
    type: 'meal_suggestion'
  };
};
