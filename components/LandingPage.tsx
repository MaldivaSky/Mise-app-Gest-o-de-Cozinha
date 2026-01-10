import React, { useState, useEffect, useMemo } from 'react';
import { ChefHat, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onLogin: (name: string) => void;
}

// List of ingredients for the animation
const INGREDIENTS = ['🍅', '🧀', '🥚', '🥦', '🥕', '🥩', '🍋', '🧅', '🥑', '🌶️', '🌽', '🥔', '🥖', '🧈'];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Generate random positions for the background elements only once on mount
  const backgroundElements = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      emoji: INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 20}s`,
      size: `${1.5 + Math.random() * 2}rem`,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="relative min-h-screen bg-stone-900 overflow-hidden flex flex-col items-center justify-center p-4">
      
      {/* CSS Animation Styles */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .falling-item {
          position: absolute;
          top: -10vh;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0; /* Start hidden */
          filter: blur(1px);
          user-select: none;
          pointer-events: none;
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((el) => (
          <div
            key={el.id}
            className="falling-item text-stone-700"
            style={{
              left: el.left,
              fontSize: el.size,
              animationDelay: el.delay,
              animationDuration: el.duration,
            }}
          >
            {el.emoji}
          </div>
        ))}
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block p-4 bg-gradient-to-br from-chef-500 to-chef-600 rounded-2xl shadow-2xl shadow-chef-500/20 mb-4 transform hover:scale-110 transition-transform duration-500">
            <ChefHat size={48} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Mise<span className="text-chef-500">.</span>
          </h1>
          <p className="text-stone-400 text-lg">
            A inteligência financeira que sua cozinha precisa.
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl animate-in zoom-in fade-in duration-500 delay-150">
          
          <div className="flex justify-center mb-6 border-b border-white/10 pb-4">
             <button 
               onClick={() => setIsRegistering(false)}
               className={`px-4 py-2 text-sm font-medium transition-colors ${!isRegistering ? 'text-chef-400 border-b-2 border-chef-500' : 'text-stone-400 hover:text-white'}`}
             >
               Entrar
             </button>
             <button 
               onClick={() => setIsRegistering(true)}
               className={`px-4 py-2 text-sm font-medium transition-colors ${isRegistering ? 'text-chef-400 border-b-2 border-chef-500' : 'text-stone-400 hover:text-white'}`}
             >
               Cadastre-se
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1 ml-1 uppercase tracking-wider">
                Nome do Chef
              </label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRegistering ? "Como gosta de ser chamado?" : "Seu nome"}
                className="w-full bg-stone-800/50 border border-stone-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-chef-500 focus:border-transparent placeholder-stone-600 transition-all"
              />
            </div>

            {isRegistering && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="block text-xs font-medium text-stone-400 mb-1 ml-1 uppercase tracking-wider">
                  Email
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-stone-800/50 border border-stone-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-chef-500 focus:border-transparent placeholder-stone-600 transition-all"
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-chef-500 hover:bg-chef-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-chef-500/25 transition-all transform hover:-translate-y-1 hover:shadow-chef-500/40 flex items-center justify-center gap-2 group mt-4"
            >
              {isRegistering ? 'Criar minha conta' : 'Acessar Cozinha'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>
        
        {/* Footer */}
        <p className="text-center text-stone-500 text-xs mt-8">
          © {new Date().getFullYear()} Mise App. Feito para profissionais.
        </p>

      </div>
    </div>
  );
};