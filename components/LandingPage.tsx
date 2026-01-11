
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
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

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

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    // Simulating API call delay
    setTimeout(() => {
      onLogin("Chef Google"); // Mock user name
    }, 1500);
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-stone-500 backdrop-blur-sm">Ou continue com</span>
            </div>
          </div>

          {/* Google Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="w-full bg-white hover:bg-stone-50 text-stone-800 font-bold py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
          >
             {isLoadingGoogle ? (
               <div className="animate-spin h-5 w-5 border-2 border-stone-300 border-t-stone-800 rounded-full"/>
             ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Google</span>
                </>
             )}
          </button>

        </div>
        
        {/* Footer */}
        <p className="text-center text-stone-500 text-xs mt-8">
          © {new Date().getFullYear()} Mise App. Feito para profissionais.
        </p>

      </div>
    </div>
  );
};
