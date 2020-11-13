// Draw new map
const drawMap = async mapData => {
    // Decuntruct mapdata variable 
    const { center, bbox, region, countries, points } = mapData;

    mapboxgl.accessToken = 'pk.eyJ1IjoieG5hdmlkIiwiYSI6ImNqdnFmOWoyczJrMTI0OGw2Y28yY2ppb2gifQ.0ONYG5AdejIME8V-U8Fe6g';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom: 12
    });

    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            // limit results to Singapore
            countries,

            // further limit results to the geographic bounds representing the region of
            // Centeral Singapore region
            bbox,

            // apply a client side filter to further limit results to those strictly within
            // the New Australie
            filter: function (item) {
                // returns true if item contains New South Wales region
                return item.context
                    .map(function (i) {
                        // id is in the form {index}.{id} per https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
                        // this example attempts to find the `region` named `New South Wales`
                        return (
                            i.id.split('.').shift() === 'region' &&
                            i.text === region
                        );
                    })
                    .reduce(function (acc, cur) {
                        return acc || cur;
                    });
            },
            mapboxgl: mapboxgl
        })
    );

    map.on('load', function () {
        // Add an image to use as a custom marker
        map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
            function (error, image) {
                if (error) throw error;
                map.addImage('custom-marker', image);
                // Add a GeoJSON source with 2 points
                map.addSource('points', {
                    type: 'geojson',
                    data: points,
                });

                // Add a symbol layer
                map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'points',
                    'layout': {
                        'icon-image': 'custom-marker',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'title'],
                        'text-font': [
                            'Open Sans Semibold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                    }
                });
            }
        );
    });
}

// Get map data from mapdata endpoint
const getMapData = async () => {
    try {
       const respone = await axios.get('/map-data');
       return respone.data;
    } catch (error) {
        return null;
    }
}

// Call start
(async() => {
    // Get mapdata
    const newMapData = await getMapData();
    await drawMap(newMapData)
})();