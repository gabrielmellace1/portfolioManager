import axios from 'axios';
import * as cheerio from 'cheerio';

export class PriceService {
  private readonly YAHOO_FINANCE_BASE = 'https://finance.yahoo.com';
  private readonly ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  private readonly COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
  private readonly COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
  
  // Crypto symbol mapping for CoinGecko API
  private readonly CRYPTO_SYMBOL_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AAVE': 'aave',
    'COMP': 'compound-governance-token',
    'MKR': 'maker',
    'SNX': 'havven',
    'YFI': 'yearn-finance',
    'SUSHI': 'sushi',
    'CRV': 'curve-dao-token',
    '1INCH': '1inch',
    'BAL': 'balancer',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'SHIB': 'shiba-inu',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'SOL': 'solana',
    'FTM': 'fantom',
    'NEAR': 'near',
    'ATOM': 'cosmos',
    'ALGO': 'algorand',
    'VET': 'vechain',
    'ICP': 'internet-computer',
    'FIL': 'filecoin',
    'THETA': 'theta-token',
    'TRX': 'tron',
    'EOS': 'eos',
    'XLM': 'stellar',
    'NEO': 'neo',
    'IOTA': 'iota',
    'DASH': 'dash',
    'ZEC': 'zcash',
    'XMR': 'monero',
    'ETC': 'ethereum-classic',
    'BNB': 'binancecoin',
    'CAKE': 'pancakeswap-token',
    'BUSD': 'binance-usd',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'DAI': 'dai',
    'TUSD': 'true-usd',
    'PAX': 'paxos-standard',
    'GUSD': 'gemini-dollar'
  };

  async getStockPrice(ticker: string): Promise<number> {
    try {
      console.log(`Fetching stock price for ${ticker}`);
      
      // Try Alpha Vantage first (if API key is available)
      if (this.ALPHA_VANTAGE_API_KEY) {
        console.log(`Using Alpha Vantage API for ${ticker}`);
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${this.ALPHA_VANTAGE_API_KEY}`
        );
        
        if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
          const price = parseFloat(response.data['Global Quote']['05. price']);
          console.log(`Alpha Vantage price for ${ticker}: ${price}`);
          return price;
        }
      }

      // Try a simpler approach first - use a free API
      try {
        console.log(`Trying free API for ${ticker}`);
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
        
        if (response.data && response.data.chart && response.data.chart.result) {
          const result = response.data.chart.result[0];
          if (result.meta && result.meta.regularMarketPrice) {
            const price = result.meta.regularMarketPrice;
            console.log(`Yahoo API price for ${ticker}: ${price}`);
            return price;
          }
        }
      } catch (apiError) {
        console.log(`Free API failed for ${ticker}, trying scraping...`);
      }

      // Fallback to Yahoo Finance scraping
      console.log(`Using Yahoo Finance scraping for ${ticker}`);
      return this.getYahooStockPrice(ticker);
    } catch (error) {
      console.error(`Error fetching stock price for ${ticker}:`, error);
      // Return a default price instead of throwing to prevent crashes
      console.log(`Returning default price for ${ticker}`);
      return 100.0; // Default fallback price
    }
  }

  async getCryptoPrice(symbol: string): Promise<number> {
    try {
      console.log(`Fetching crypto price for ${symbol}`);
      const upperSymbol = symbol.toUpperCase();
      
      // Try CoinMarketCap API first (if API key is available)
      if (this.COINMARKETCAP_API_KEY) {
        try {
          console.log(`Using CoinMarketCap API for ${upperSymbol}`);
          const response = await axios.get(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
            {
              headers: {
                'X-CMC_PRO_API_KEY': this.COINMARKETCAP_API_KEY,
              },
              params: {
                symbol: upperSymbol
              },
              timeout: 10000 // 10 second timeout
            }
          );

          if (response.data.data && response.data.data[upperSymbol]) {
            const price = response.data.data[upperSymbol].quote.USD.price;
            console.log(`CoinMarketCap price for ${upperSymbol}: $${price}`);
            return price;
          }
        } catch (cmcError) {
          console.log(`CoinMarketCap API failed for ${upperSymbol}, trying CoinGecko...`);
        }
      }

      // Use CoinGecko API (free and reliable)
      console.log(`Using CoinGecko API for ${upperSymbol}`);
      
      // Get the CoinGecko ID for the symbol
      const coinGeckoId = this.CRYPTO_SYMBOL_MAP[upperSymbol];
      
      if (!coinGeckoId) {
        console.log(`Symbol ${upperSymbol} not found in mapping, trying direct lookup...`);
        // Try to find the coin by symbol using CoinGecko's search
        try {
          const searchResponse = await axios.get(
            `${this.COINGECKO_BASE}/search?query=${upperSymbol}`,
            { timeout: 10000 }
          );
          
          if (searchResponse.data.coins && searchResponse.data.coins.length > 0) {
            const coin = searchResponse.data.coins[0];
            console.log(`Found coin via search: ${coin.id} (${coin.symbol})`);
            
            const priceResponse = await axios.get(
              `${this.COINGECKO_BASE}/simple/price?ids=${coin.id}&vs_currencies=usd`,
              { timeout: 10000 }
            );
            
            if (priceResponse.data[coin.id] && priceResponse.data[coin.id].usd) {
              const price = priceResponse.data[coin.id].usd;
              console.log(`CoinGecko search price for ${upperSymbol}: $${price}`);
              return price;
            }
          }
        } catch (searchError) {
          console.log(`CoinGecko search failed for ${upperSymbol}:`, searchError);
        }
        
        throw new Error(`Crypto symbol ${upperSymbol} not found in CoinGecko`);
      }

      // Use the mapped CoinGecko ID
      const response = await axios.get(
        `${this.COINGECKO_BASE}/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`,
        { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Portfolio-Visualizer/1.0'
          }
        }
      );

      if (response.data[coinGeckoId] && response.data[coinGeckoId].usd) {
        const price = response.data[coinGeckoId].usd;
        const change24h = response.data[coinGeckoId].usd_24h_change;
        console.log(`CoinGecko price for ${upperSymbol}: $${price} (24h: ${change24h ? change24h.toFixed(2) : 'N/A'}%)`);
        return price;
      }

      throw new Error(`Price data not found for ${upperSymbol} (${coinGeckoId})`);
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error);
      
      // Try one more fallback with a different approach
      try {
        console.log(`Trying alternative CoinGecko approach for ${symbol}...`);
        const response = await axios.get(
          `${this.COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${symbol.toLowerCase()}&order=market_cap_desc&per_page=1&page=1&sparkline=false`,
          { timeout: 10000 }
        );
        
        if (response.data && response.data.length > 0) {
          const price = response.data[0].current_price;
          console.log(`Alternative CoinGecko price for ${symbol}: $${price}`);
          return price;
        }
      } catch (fallbackError) {
        console.log(`Alternative approach also failed for ${symbol}`);
      }
      
      // Return a default price instead of throwing to prevent crashes
      console.log(`Returning default crypto price for ${symbol}`);
      return 1.0; // Default fallback price
    }
  }

  async getOptionPrice(
    underlyingTicker: string,
    strikePrice: number,
    expirationDate: Date,
    optionType: 'call' | 'put'
  ): Promise<number> {
    try {
      console.log(`Fetching option price for ${underlyingTicker}`);
      return await this.getYahooOptionPrice(underlyingTicker, strikePrice, expirationDate, optionType);
    } catch (error) {
      console.error(`Error fetching option price for ${underlyingTicker}:`, error);
      // Return a default price instead of throwing to prevent crashes
      console.log(`Returning default option price for ${underlyingTicker}`);
      return 10.0; // Default fallback price
    }
  }

  async getBondPrice(ticker: string): Promise<number> {
    try {
      console.log(`Fetching bond price for ${ticker}`);
      // For bonds, we'll use Yahoo Finance as well
      return await this.getYahooBondPrice(ticker);
    } catch (error) {
      console.error(`Error fetching bond price for ${ticker}:`, error);
      // Return a default price instead of throwing to prevent crashes
      console.log(`Returning default bond price for ${ticker}`);
      return 100.0; // Default fallback price
    }
  }

  private async getYahooStockPrice(ticker: string): Promise<number> {
    try {
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE}/quote/${ticker}`);
      const $ = cheerio.load(response.data);
      
      // Look for the current price in various possible selectors
      const priceSelectors = [
        '[data-field="regularMarketPrice"]',
        '[data-testid="qsp-price"]',
        '.quote-header-section .quote-header-price',
        '.Trsdu\\(0\\.3s\\) .Fw\\(b\\) .Fz\\(36px\\)',
        '[data-symbol="' + ticker + '"] .Fw\\(b\\) .Fz\\(36px\\)',
        '.quote-header-price .Fw\\(b\\) .Fz\\(36px\\)'
      ];

      console.log(`Searching for price for ${ticker}...`);
      
      for (const selector of priceSelectors) {
        const priceText = $(selector).text();
        console.log(`Selector "${selector}" found text: "${priceText}"`);
        
        if (priceText) {
          // Clean the price text more carefully
          const cleanedPrice = priceText.replace(/[^\d.-]/g, '');
          console.log(`Cleaned price text: "${cleanedPrice}"`);
          
          const price = parseFloat(cleanedPrice);
          console.log(`Parsed price: ${price}`);
          
          // Validate the price is reasonable (between $0.01 and $100,000)
          if (!isNaN(price) && price > 0.01 && price < 100000) {
            console.log(`Valid price found: $${price}`);
            return price;
          } else {
            console.log(`Price ${price} is not reasonable, skipping...`);
          }
        }
      }

      // If no price found with selectors, try to find any price-like text
      console.log('No price found with selectors, trying alternative approach...');
      
      // Look for any text that looks like a price
      const allText = $('body').text();
      const priceMatches = allText.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
      
      if (priceMatches) {
        console.log('Found potential prices:', priceMatches);
        for (const match of priceMatches) {
          const price = parseFloat(match.replace(/[^\d.-]/g, ''));
          if (!isNaN(price) && price > 0.01 && price < 100000) {
            console.log(`Using alternative price: $${price}`);
            return price;
          }
        }
      }

      throw new Error('Price not found on Yahoo Finance');
    } catch (error) {
      console.error(`Error scraping Yahoo Finance for ${ticker}:`, error);
      throw error;
    }
  }

  private async getYahooOptionPrice(
    underlyingTicker: string,
    strikePrice: number,
    expirationDate: Date,
    optionType: 'call' | 'put'
  ): Promise<number> {
    try {
      console.log(`Fetching option price for ${underlyingTicker} ${strikePrice} ${optionType} exp ${expirationDate.toISOString().split('T')[0]}`);
      
      // Try to use a simpler approach first - estimate option price based on underlying
      try {
        // Get the underlying stock price
        const underlyingPrice = await this.getStockPrice(underlyingTicker);
        console.log(`Underlying ${underlyingTicker} price: $${underlyingPrice}`);
        
        // Calculate intrinsic value
        let intrinsicValue = 0;
        if (optionType === 'call') {
          intrinsicValue = Math.max(0, underlyingPrice - strikePrice);
        } else {
          intrinsicValue = Math.max(0, strikePrice - underlyingPrice);
        }
        
        // Estimate time value (simplified Black-Scholes approximation)
        const timeToExpiry = (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365); // years
        const volatility = 0.3; // Assume 30% volatility
        const riskFreeRate = 0.05; // Assume 5% risk-free rate
        
        // Simplified time value calculation
        const timeValue = Math.max(0, underlyingPrice * volatility * Math.sqrt(timeToExpiry) * 0.4);
        
        const estimatedPrice = intrinsicValue + timeValue;
        console.log(`Estimated option price: $${estimatedPrice.toFixed(2)} (intrinsic: $${intrinsicValue.toFixed(2)}, time: $${timeValue.toFixed(2)})`);
        
        return Math.max(0.01, estimatedPrice); // Minimum $0.01
      } catch (underlyingError) {
        console.log(`Could not get underlying price for ${underlyingTicker}, using fallback`);
      }
      
      // Fallback: Use a simple estimation based on strike price
      const estimatedPrice = Math.max(0.01, strikePrice * 0.1); // 10% of strike price as rough estimate
      console.log(`Using fallback option price: $${estimatedPrice.toFixed(2)}`);
      return estimatedPrice;
      
    } catch (error) {
      console.error(`Error getting option price for ${underlyingTicker}:`, error);
      throw error;
    }
  }

  private async getYahooBondPrice(ticker: string): Promise<number> {
    try {
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE}/quote/${ticker}`);
      const $ = cheerio.load(response.data);
      
      // Look for bond price
      const priceSelectors = [
        '[data-field="regularMarketPrice"]',
        '.Trsdu\\(0\\.3s\\) .Fw\\(b\\) .Fz\\(36px\\)',
        '[data-testid="qsp-price"]'
      ];

      for (const selector of priceSelectors) {
        const priceText = $(selector).text();
        if (priceText) {
          const price = parseFloat(priceText.replace(/[^0-9.-]/g, ''));
          if (!isNaN(price)) {
            return price;
          }
        }
      }

      throw new Error('Bond price not found on Yahoo Finance');
    } catch (error) {
      console.error(`Error scraping Yahoo Finance for bond ${ticker}:`, error);
      throw error;
    }
  }

  async getMultipleCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      console.log(`Fetching multiple crypto prices for: ${symbols.join(', ')}`);
      
      // Map symbols to CoinGecko IDs
      const coinGeckoIds: string[] = [];
      const symbolToIdMap: Record<string, string> = {};
      
      for (const symbol of symbols) {
        const upperSymbol = symbol.toUpperCase();
        const coinGeckoId = this.CRYPTO_SYMBOL_MAP[upperSymbol];
        
        if (coinGeckoId) {
          coinGeckoIds.push(coinGeckoId);
          symbolToIdMap[upperSymbol] = coinGeckoId;
        } else {
          console.log(`Symbol ${upperSymbol} not found in mapping, will try individual lookup`);
        }
      }
      
      const prices: Record<string, number> = {};
      
      // Batch fetch for mapped symbols
      if (coinGeckoIds.length > 0) {
        try {
          const response = await axios.get(
            `${this.COINGECKO_BASE}/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
            { 
              timeout: 15000,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Portfolio-Visualizer/1.0'
              }
            }
          );
          
          for (const [symbol, coinGeckoId] of Object.entries(symbolToIdMap)) {
            if (response.data[coinGeckoId] && response.data[coinGeckoId].usd) {
              prices[symbol] = response.data[coinGeckoId].usd;
              console.log(`Batch price for ${symbol}: $${prices[symbol]}`);
            }
          }
        } catch (batchError) {
          console.log(`Batch fetch failed, trying individual requests...`);
        }
      }
      
      // Handle unmapped symbols individually
      for (const symbol of symbols) {
        const upperSymbol = symbol.toUpperCase();
        if (!prices[upperSymbol]) {
          try {
            prices[upperSymbol] = await this.getCryptoPrice(symbol);
          } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error);
            prices[upperSymbol] = 1.0; // Default fallback
          }
        }
      }
      
      return prices;
    } catch (error) {
      console.error('Error in getMultipleCryptoPrices:', error);
      // Return default prices for all symbols
      const defaultPrices: Record<string, number> = {};
      for (const symbol of symbols) {
        defaultPrices[symbol.toUpperCase()] = 1.0;
      }
      return defaultPrices;
    }
  }

  async getMultiplePrices(assets: Array<{
    type: string;
    ticker: string;
    strikePrice?: number;
    expirationDate?: Date;
    optionType?: 'call' | 'put';
  }>): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    // Group crypto assets for batch processing
    const cryptoAssets = assets.filter(asset => asset.type === 'crypto');
    const nonCryptoAssets = assets.filter(asset => asset.type !== 'crypto');
    
    // Batch fetch crypto prices
    if (cryptoAssets.length > 0) {
      const cryptoSymbols = cryptoAssets.map(asset => asset.ticker);
      const cryptoPrices = await this.getMultipleCryptoPrices(cryptoSymbols);
      Object.assign(prices, cryptoPrices);
    }
    
    // Process non-crypto assets individually
    const promises = nonCryptoAssets.map(async (asset) => {
      try {
        let price: number;
        
        switch (asset.type) {
          case 'stock':
            price = await this.getStockPrice(asset.ticker);
            break;
          case 'option':
            price = await this.getOptionPrice(
              asset.ticker,
              asset.strikePrice!,
              asset.expirationDate!,
              asset.optionType!
            );
            break;
          case 'bond':
            price = await this.getBondPrice(asset.ticker);
            break;
          default:
            return;
        }
        
        prices[asset.ticker] = price;
      } catch (error) {
        console.error(`Failed to fetch price for ${asset.ticker}:`, error);
      }
    });

    await Promise.all(promises);
    return prices;
  }
}
