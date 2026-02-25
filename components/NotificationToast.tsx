
import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, ChefHat, Bell } from 'lucide-react';
import { AppNotification } from '../services/notificationService';

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onAction?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification && !isVisible) return null;

  const isLowStock = notification?.type === 'low_stock';

  return (
    <div 
      className={`fixed top-20 right-4 z-50 transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="bg-white border-l-4 border-stone-900 rounded-lg shadow-2xl p-4 w-80 relative overflow-hidden group">
        
        {/* Visual Cue */}
        <div className={`absolute top-0 right-0 p-16 rounded-full transform translate-x-1/3 -translate-y-1/3 opacity-10 ${isLowStock ? 'bg-red-500' : 'bg-chef-500'}`}></div>

        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-stone-300 hover:text-stone-800 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex gap-3">
          <div className={`p-2 rounded-full h-fit shrink-0 ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-chef-100 text-chef-600'}`}>
            {isLowStock ? <AlertTriangle size={20} /> : <ChefHat size={20} />}
          </div>
          
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">{notification?.title}</h4>
            <p className="text-xs text-stone-500 leading-relaxed mb-3">
              {notification?.message}
            </p>
            
            {onAction && (
              <button 
                onClick={onAction}
                className="text-xs font-bold uppercase tracking-wider text-chef-600 hover:text-chef-700 flex items-center gap-1 group-hover:underline"
              >
                Verificar agora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
