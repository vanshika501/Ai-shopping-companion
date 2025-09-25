# AI Shopping Assistant

An AI-powered platform to summarize, compare, and suggest products. Users can input product URLs or 
details to get concise bullet-point summaries, pros/cons, and heuristic-based product recommendations.

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/vanshika501/Ai-shopping-companion
cd Ai-shopping-companion
```
2. **Backend**
```bash
cd backend
npm install
create .env file
# Add MONGO_URI and OPENAI_API_KEY to .env
npm run dev
```
3. **Frontend**
```bash
cd frontend
npm install
npm run dev
```
4. **Access**
   
   Frontend: http://localhost:5173
   Backend API: http://localhost:5000/api

## Architecture

Frontend (React): Handles user interaction, displays summaries and comparisons.
   
Backend (Node.js + Express + REST API): Provides REST endpoints for summarization, comparison, 
suggestion, and history.
   
MongoDB (Collections: Users, ProductSummaries, ProductComparisons): Stores user data, product 
summaries, and comparisons.
   
AI Service (OpenAI GPT for product summarization): Generates consumer-friendly bullet points and 
heuristic scores.

## AI Model Choices & Trade-offs

OpenAI GPT-4o-mini

Pros: High-quality text summarization, easy integration.

Cons: Paid API, network latency.

## Future Considerations for Production

Scalability: Add caching (Redis) for repeated product summaries.

Monitoring: Implement logging, error tracking (e.g., Sentry).

Security: Rate limiting, secure API keys, input validation.

Extensibility: Support more e-commerce sites, multi-language summaries.
