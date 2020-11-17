const express = require('express');
const app = express();
const port = 3000;
const geoCode = require('./utils/geocode');
const generateRandomPointsOnMap = require('./utils/randompointsgenerator');

app.use('/public', express.static('public'))
app.set('view engine', 'ejs')

app.get('/map-data', async (req, res) => {
	const addressData = await geoCode('Central, Singapore');
	let mapData = {
		center: addressData.data.features[0].center,
		bbox: addressData.data.features[0].bbox,
		countries: addressData.data.features[0].context[0].short_code,
		region: addressData.data.features[0].text,
	};

	// Generatre random points within map
	const randomPoints = await generateRandomPointsOnMap(50, addressData.data.features[0].bbox);

	// Add random points to map data
	mapData.points = randomPoints;

	return res.send(mapData);
});

app.get('/', async (req, res) => {
	return res.render('index')
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})