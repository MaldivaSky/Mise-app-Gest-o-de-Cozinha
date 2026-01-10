import React from 'react';
import { X, Calendar, Trophy, History, ChefHat, Star } from 'lucide-react';
import { UserProfile } from '../types';

interface HistoryModalProps {
  userProfile: UserProfile;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ userProfile, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 h-[80vh] flex flex-col">
        
        {/* Profile Header */}
        <div className="bg-stone-800 p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-1"
          >
            <X size={20} />
          </button>
          
          <div className="w-20 h-20 bg-gradient-to-br from-chef-400 to-chef-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-3 ring-4 ring-stone-700">
             <ChefHat size={40} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold">Chef Nível {userProfile.level}</h2>
          <div className="flex items-center justify-center gap-1 text-chef-200 text-sm font-medium mt-1">
             <Trophy size={14} />
             <span>{userProfile.currentXP} / {userProfile.nextLevelXP} XP</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-stone-700 h-2 rounded-full w-full max-w-[200px] mx-auto overflow-hidden">
             <div 
               className="bg-chef-500 h-full transition-all"
               style={{ width: `${(userProfile.currentXP / userProfile.nextLevelXP) * 100}%` }}
             />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 border-b border-stone-200 shrink-0">
           <div className="p-4 text-center border-r border-stone-200">
              <div className="text-2xl font-bold text-stone-800">{userProfile.history.length}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Receitas</div>
           </div>
           <div className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-800">
                {userProfile.history.reduce((acc, curr) => acc + curr.xpEarned, 0)}
              </div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">XP Total</div>
           </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-0 bg-stone-50">
           <div className="p-4">
             <h3 className="text-sm font-semibold text-stone-500 mb-3 flex items-center gap-2">
               <History size={16} />
               Histórico de Cozinha
             </h3>
             
             {userProfile.history.length === 0 ? (
               <div className="text-center py-10 text-stone-400">
                 <ChefHat size={48} className="mx-auto mb-2 opacity-20" />
                 <p>Nenhuma receita concluída ainda.</p>
                 <p className="text-xs mt-1">Use o "Modo Cozinheiro" para ganhar XP.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {[...userProfile.history].reverse().map((session) => (
                   <div key={session.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-stone-800">{session.recipeName}</div>
                        <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                           <Calendar size={12} />
                           {new Date(session.date).toLocaleDateString('pt-BR', { 
                             day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                           })}
                        </div>
                      </div>
                      <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-100">
                         <Star size={12} fill="currentColor" />
                         +{session.xpEarned} XP
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};