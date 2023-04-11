const express = require('express');
const yahooFinance = require('yahoo-finance');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const app = express();
app.use(express.json());

app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const cachedPrice = cache.get(ticker);
  console.log(ticker)
  if (cachedPrice) {
    console.log(`Returning cached price for ${ticker}: ${cachedPrice}`);
    return res.json({ ticker, price: cachedPrice });
  }

  try {
    const quote = await yahooFinance.quote({
      symbol: ticker,
      modules: ['price']
    });

    const price = quote.price.regularMarketPrice;

    console.log(`get price for ${ticker}: ${price}`);
    cache.set(ticker, price);
    res.json({ ticker, price });
  } catch (error) {
    console.error(`Error get price for ${ticker}: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
