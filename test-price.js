const axios = require('axios');

async function testPrice() {
  try {
    const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/AAPL');
    
    if (response.data && response.data.chart && response.data.chart.result) {
      const result = response.data.chart.result[0];
      if (result.meta && result.meta.regularMarketPrice) {
        const price = result.meta.regularMarketPrice;
        console.log(`AAPL price: $${price}`);
        return price;
      }
    }
    console.log('No price found in API response');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPrice();

