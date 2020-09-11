Company News (make default background)
fetch("https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2020-04-30&to=2020-05-01&token=bsuu7qv48v6qu589jlj0") 
	.then((response) => response.json())
	.then((data) => {console.log(data)})

Get Company News by symbol.
fetch('https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2020-04-30&to=2020-05-01&token=bsuu7qv48v6qu589jlj0')
	.then((response) => response.json())
	.then((data) => {console.log(data)})

Get Company Peers
fetch('https://finnhub.io/api/v1/stock/peers?symbol=AAPL&token=bsuu7qv48v6qu589jlj0')
	.then((response) => response.json())
	.then((data) => {console.log(data)})

Basic Financials
fetch('https://finnhub.io/api/v1/stock/metric?symbol=AAPL&metric=all&token=bsuu7qv48v6qu589jlj0')
	.then((response) => response.json())
	.then((data) => {console.log(data)})

Company profile 2
fetch('https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=bsuu7qv48v6qu589jlj0')
	.then((response) => response.json())
	.then((data) => {console.log(data)})

stock Quote
fetch('https://finnhub.io/api/v1/quote?symbol=AAPL&token=bsuu7qv48v6qu589jlj0')
		.then((response) => response.json())
		.then((data) => {console.log(data)})

stock candle 

const request = require('request');

fetch('https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=1&from=1572651390&to=1572910590&token=bsuu7qv48v6qu589jlj0')
	.then((response) => response.json())
	.then((data) => {console.log(data)})
-----------------------------------------------------------------------------------------------

import { tsvParse} from  "d3-dsv";
fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
		.then(response => response.text())
		.then(data => console.log(data)



data = [
	{
		date: '12/31/2019',
		open: 1,
		close: 2,
		high: 3,
		low: 1,
	},

	{
		date: '12/31/2019',
		open: 5,
		close: 6,
		high: 7,
		low: 4,
	}
]

data.forEach(d => {
	d.open = +d.open;
	d.high = +d.high;
	d.low = +d.low;
	d.close = +d.close;
})
