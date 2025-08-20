import { ApiClientFactory } from '../_core/clientFactory.js';
import { HttpClient } from '../_core/httpClient.js';

/**
 * OpenAI API client
 * Support for GPT models and portfolio analysis
 */
export class OpenAIClient {
  private client: HttpClient;

  constructor(apiKey: string) {
    this.client = ApiClientFactory.createOpenAIClient(apiKey);
  }

  /**
   * Generates portfolio analysis using GPT
   * @param {PortfolioAnalysisRequest} portfolioData - Portfolio data to analyze
   * @return {Promise<PortfolioAnalysis>} AI-generated portfolio analysis with recommendations
   */
  async analyzePortfolio(
    portfolioData: PortfolioAnalysisRequest
  ): Promise<PortfolioAnalysis> {
    const prompt = this.buildPortfolioPrompt(portfolioData);

    const response = await this.client.post<OpenAIResponse>(
      '/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert financial analyst. Analyze investment portfolios and provide precise, data-driven recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3, // More deterministic for financial analysis
      }
    );

    const analysis = response.data.choices[0].message.content;
    return this.parsePortfolioAnalysis(analysis || '');
  }

  /**
   * Generates market news summary
   * @param {string[]} articles - Array of news articles to summarize
   * @return {Promise<MarketSummary>} AI-generated market summary with trends and recommendations
   */
  async summarizeMarketNews(articles: string[]): Promise<MarketSummary> {
    const prompt = `Analyze the following financial news and generate an executive summary:

${articles.map((article, i) => `${i + 1}. ${article}`).join('\n\n')}

Provide:
1. Main market trends
2. Most affected sectors
3. Trading recommendations
4. Expected volatility level (1-10)`;

    const response = await this.client.post<OpenAIResponse>(
      '/chat/completions',
      {
        model: 'gpt-4o-mini', // More economical for summaries
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.4,
      }
    );

    const summary = response.data.choices[0].message.content || '';
    return this.parseMarketSummary(summary);
  }

  /**
   * Generates personalized trading strategies
   * @param {TradingStrategyRequest} request - Trading strategy requirements and user profile
   * @return {Promise<TradingStrategy>} AI-generated personalized trading strategy
   */
  async generateTradingStrategy(
    request: TradingStrategyRequest
  ): Promise<TradingStrategy> {
    const prompt = `Generate a personalized trading strategy:

Investor profile:
- Risk tolerance: ${request.riskTolerance}
- Available capital: $${request.capital}
- Time horizon: ${request.timeHorizon}
- Experience: ${request.experience}
- Goals: ${request.goals}

Current market conditions:
- VIX: ${request.marketConditions.vix}
- S&P500 trend: ${request.marketConditions.sp500Trend}
- Interest rate: ${request.marketConditions.interestRate}%

Provide a detailed strategy with:
1. Recommended asset allocation
2. Specific financial instruments
3. Entry and exit points
4. Risk management
5. Tracking metrics`;

    const response = await this.client.post<OpenAIResponse>(
      '/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        temperature: 0.2, // Very deterministic for strategies
      }
    );

    const strategy = response.data.choices[0].message.content || '';
    return this.parseTradingStrategy(strategy);
  }

  private buildPortfolioPrompt(data: PortfolioAnalysisRequest): string {
    const positions = data.positions
      .map(
        (p) =>
          `${p.symbol}: ${p.shares} shares @ $${p.avgPrice} (Current: $${p.currentPrice})`
      )
      .join('\n');

    return `Analyze this portfolio:

POSITIONS:
${positions}

CURRENT METRICS:
- Total value: $${data.totalValue}
- Total P&L: $${data.totalPnL} (${data.totalPnLPercent}%)
- Diversification: ${data.positions.length} positions

Provide:
1. Diversification analysis by sector
2. Risk/return evaluation
3. Rebalancing recommendations
4. Positions to consider closing/opening
5. Overall portfolio score (1-10)`;
  }

  private parsePortfolioAnalysis(text: string): PortfolioAnalysis {
    // Simple parsing - in production use more robust structures
    return {
      overallScore: this.extractScore(text),
      diversificationAnalysis: this.extractSection(text, 'diversification'),
      riskAssessment: this.extractSection(text, 'risk'),
      recommendations: this.extractRecommendations(text),
      rebalancingSuggestions: this.extractSection(text, 'rebalancing'),
    };
  }

  private parseMarketSummary(text: string): MarketSummary {
    return {
      mainTrends: this.extractSection(text, 'trends'),
      affectedSectors: this.extractSection(text, 'sectors'),
      tradingRecommendations: this.extractSection(text, 'recommendations'),
      volatilityLevel: this.extractVolatilityLevel(text),
      summary: text.split('\n')[0] || '',
    };
  }

  private parseTradingStrategy(text: string): TradingStrategy {
    return {
      assetAllocation: this.extractSection(text, 'allocation'),
      instruments: this.extractSection(text, 'instruments'),
      entryExitPoints: this.extractSection(text, 'entry'),
      riskManagement: this.extractSection(text, 'risk'),
      metrics: this.extractSection(text, 'metrics'),
      strategy: text,
    };
  }

  private extractScore(text: string): number {
    const match = text.match(/score.*?(\d+)\/10/i) || text.match(/(\d+)\/10/);
    return match ? parseInt(match[1]) : 5;
  }

  private extractVolatilityLevel(text: string): number {
    const match = text.match(/volatility.*?(\d+)/i);
    return match ? parseInt(match[1]) : 5;
  }

  private extractSection(text: string, keyword: string): string {
    const regex = new RegExp(`${keyword}[^\\n]*\\n([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractRecommendations(text: string): string[] {
    const lines = text.split('\n');
    const recommendations: string[] = [];

    for (const line of lines) {
      if (line.match(/^\d+\.|^-|^•/) && line.includes('recommend')) {
        recommendations.push(line.trim());
      }
    }

    return recommendations;
  }
}

// Types
export interface PortfolioAnalysisRequest {
  positions: Array<{
    symbol: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
  }>;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export interface PortfolioAnalysis {
  overallScore: number;
  diversificationAnalysis: string;
  riskAssessment: string;
  recommendations: string[];
  rebalancingSuggestions: string;
}

export interface MarketSummary {
  mainTrends: string;
  affectedSectors: string;
  tradingRecommendations: string;
  volatilityLevel: number;
  summary: string;
}

export interface TradingStrategyRequest {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  capital: number;
  timeHorizon: 'short' | 'medium' | 'long';
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string;
  marketConditions: {
    vix: number;
    sp500Trend: 'bullish' | 'bearish' | 'sideways';
    interestRate: number;
  };
}

export interface TradingStrategy {
  assetAllocation: string;
  instruments: string;
  entryExitPoints: string;
  riskManagement: string;
  metrics: string;
  strategy: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
}
