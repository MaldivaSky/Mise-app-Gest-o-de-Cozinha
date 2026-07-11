# 🍳 Mise — Gestão de cozinha com Inteligência Artificial

> Ecossistema de gestão gastronômica que usa IA (Gemini) para resolver os dois maiores problemas de qualquer cozinha profissional: **padronização** e **custo**. Um sous-chef digital que gera fichas técnicas precisas em segundos.

**[🌐 Ver demo ao vivo](https://mise-app-gest-o-de-cozinha.vercel.app)** · [English below](#-english)

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=googlegemini&logoColor=white)

---

## ✨ Diferenciais

### 🤖 Cérebro de IA dual-model

O sistema alterna inteligentemente entre modelos para otimizar performance e custo:

| Modelo | Uso |
| --- | --- |
| **Gemini Pro** | Análises complexas e geração de receitas do zero |
| **Gemini Flash** | Respostas rápidas e sugestões baseadas na despensa |

### 💰 Engenharia reversa de custos

Diferente de apps de receitas comuns, o Mise foca no **lucro**:

- Custo por porção
- Rateio de insumos (gramatura × preço de compra)
- Sugestão de preço de venda baseada em margem

### 📋 Ficha técnica 360°

Cada receita gerada entrega:

- **Ingredientes** com conversão automática de unidades
- **Tabela nutricional** completa (macros e calorias)
- **Tags inteligentes** — identificação automática (Vegano, Sem Glúten, Low Carb)
- **Cooking Mode** — interface focada em execução, sem distrações

## 🛠️ Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18 · TypeScript (strict) · Vite |
| Estilização | Tailwind CSS · dark mode nativo |
| Estado | Hooks customizados (estoque e histórico) |
| IA | `@google/generative-ai` (Gemini) |
| Deploy | Vercel |

## 🚀 Rodando localmente

**Pré-requisitos:** Node.js 18+

```bash
git clone https://github.com/MaldivaSky/Mise-app-Gest-o-de-Cozinha.git
cd Mise-app-Gest-o-de-Cozinha
npm install
```

Crie um `.env.local` na raiz:

```
GEMINI_API_KEY=sua_chave_aqui
```

```bash
npm run dev
```

> **Deploy na Vercel:** adicione `GEMINI_API_KEY` nas Environment Variables do painel.

> 💡 **Dica de chef:** no Gerador de Receitas, seja específico. Em vez de "Bolo", peça "Bolo de chocolate amargo para 12 pessoas, focado em baixo custo" — a IA ajusta os ingredientes à necessidade.

## 🇬🇧 English

Kitchen management ecosystem powered by AI (Gemini) that tackles professional kitchens' two biggest problems: standardization and cost. It works as a digital sous-chef, generating precise recipe spec sheets in seconds — including cost per serving, ingredient cost breakdown, margin-based pricing suggestions, full nutrition tables and smart dietary tags. Built with React 18, strict TypeScript, Tailwind CSS and Vite.

---

Desenvolvido por **Rafael Paiva** · [GitHub](https://github.com/MaldivaSky) · [LinkedIn](https://www.linkedin.com/in/rafael-paiva-dias-da-silva-022b17122/) · rafaelmaldivas@gmail.com
