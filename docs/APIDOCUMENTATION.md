# API DOCUMENTATION
openweathermap:
 - website: api.openweathermap.org
 - documentation: https://openweathermap.org/current 
 - sample: http://api.openweathermap.org/data/2.5/weather?q=$<CITY>&appid=<TOKEN> 

nasa:
 - webite: https://api.nasa.gov/
 - documentation: https://api.nasa.gov/
 - sample link: https://api.nasa.gov/planetary/apod?apikey=<nasa_token> 

nekos.best:
 - website: https://nekos.best/
 - documentation: https://docs.nekos.best/
 - link syntax: https://nekos.best/api/v2/<ENDPOINT>

/stock:
 - [Finnhub](https://finnhub.io/docs/api), free plan: 60 calls a minute. Put the key in `config.json` as `stock_token`.
 - Each ticker costs three calls: `quote` for the price and the day's range, `stock/profile2` for the company name, currency and exchange, and `stock/metric?metric=all` for the 52 week range. That is why the command takes at most 5 tickers.
 - A ticker Finnhub doesn't know answers 200 with zeroes and no timestamp rather than an error.
 - link syntax: https://finnhub.io/api/v1/&lt;ENDPOINT&gt;?symbol=&lt;TICKER&gt;&token=&lt;KEY&gt;
 - It replaced IEX Cloud (cloud.iexapis.com), which shut down in August 2024.

