🍳 Mise-app | Inteligência Artificial na Cozinha
O Mise-app é um ecossistema de gestão gastronômica que utiliza Inteligência Artificial de última geração para resolver o maior problema de qualquer cozinha: a padronização e o custo. Através dos modelos Gemini, o app atua como um Sous-Chef digital, gerando fichas técnicas precisas em segundos.

🚀 Diferenciais do Projeto
🤖 Cérebro de IA Dual-Model
O sistema alterna inteligentemente entre modelos para otimizar performance e custo:

Gemini 1.5 Pro: Para análises complexas e geração de receitas do zero.

Gemini 1.5 Flash: Para respostas rápidas e sugestões baseadas na despensa.

💰 Engenharia Reversa de Custos
Diferente de apps de receitas comuns, o Mise-app foca no lucro. Ele calcula:

Custo por porção.

Rateio de insumos (gramatura vs. preço de compra).

Sugestão de preço de venda baseado em margem.

📋 Ficha Técnica 360º
Cada receita gerada entrega:

Ingredientes: Com conversão automática de unidades.

Nutricional: Tabela completa de macros e calorias.

Tags Inteligentes: Identificação automática (Vegano, Sem Glúten, Low Carb).

Cooking Mode: Interface focada em execução, sem distrações.

🛠️ Stack Tecnológica
Frontend: React 18 com TypeScript (Tipagem estrita para segurança de dados).

Estilização: Tailwind CSS (Design responsivo e Dark Mode nativo).

Estado & Fluxo: Hooks customizados para gestão de estoque e histórico.

IA: Integração nativa com @google/generative-ai.

Build: Vite (Velocidade máxima no desenvolvimento).

⚙️ Configuração do Ambiente
1. Clonagem e Instalação
Bash
git clone https://github.com/seu-usuario/mise-app.git
cd mise-app
npm install
2. Variáveis de Ambiente
Crie um arquivo .env.local na raiz e insira sua chave:

GEMINI_API_KEY=seu_token_aqui

3. Execução
Bash
npm run dev
🌐 Deploy (Vercel)
Este projeto está pronto para ser hospedado na Vercel. Lembre-se de adicionar a GEMINI_API_KEY nas Environment Variables do painel da Vercel para que as funções de IA funcionem em produção.

📸 Preview da Interface
[!TIP]
Dica de Chef: Ao usar o "Gerador de Receitas", tente ser específico. Em vez de "Bolo", use "Bolo de chocolate amargo para 12 pessoas, focado em baixo custo". A IA irá ajustar os ingredientes para sua necessidade.

❤️ Desenvolvido por Mald1vas.T4ch -2026- Todos os direitos para transformar a gestão gastronômica.

---
*Última atualização de rotas e integração com Gemini AI finalizada com sucesso.*