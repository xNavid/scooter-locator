// Draw new map
const drawMap = async mapData => {
    // Decuntruct mapdata variable 
    const { center, bbox, region, countries, points } = mapData;

    mapboxgl.accessToken = 'pk.eyJ1IjoieG5hdmlkIiwiYSI6ImNqdnFmOWoyczJrMTI0OGw2Y28yY2ppb2gifQ.0ONYG5AdejIME8V-U8Fe6g';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom: 12
    });

    // location of the feature, with description HTML from its properties.
    map.on('click', function (e) {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);

        const searchResult = { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat]};
            // Code for the next step will go here
            var options = { units: 'kilometers' };
            points.features.forEach(point =>  {
                Object.defineProperty(point.properties, 'distance', {
                    value: turf.distance(searchResult, point.geometry, options),
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            });

            points.features.sort((a, b) => {
                if (a.properties.distance > b.properties.distance) {
                  return 1;
                }
                if (a.properties.distance < b.properties.distance) {
                  return -1;
                }
                return 0; // a must be equal to b
            });

            const createPopUp = (currentFeature) => {
                const popUps = document.getElementsByClassName('mapboxgl-popup');
                if (popUps[0]) popUps[0].remove();
            
                const popup = new mapboxgl.Popup({closeOnClick: false})
                  .setLngLat(currentFeature.geometry.coordinates)
                  .setHTML('<h3>Nearest Scooter</h3>')
                  .addTo(map);
            }

            createPopUp(points.features[0]);
    });

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


        const coordinateFeature = (lng, lat) => {
            return {
                center: [lng, lat],
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                place_name: 'Lat: ' + lat + ' Lng: ' + lng,
                place_type: ['coordinate'],
                properties: {},
                type: 'Feature'
            };
        }

        const coordinatesGeocoder = (query) => {
            // match anything which looks like a decimal degrees coordinate pair
            const matches = query.match(
                /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
            );
            // Invalid input return null
            if (!matches) return null;
             
            var coord1 = Number(matches[1]);
            var coord2 = Number(matches[2]);
            var geocodes = [];
             
            if (coord1 < -90 || coord1 > 90) {
                // must be lng, lat
                geocodes.push(coordinateFeature(coord1, coord2));
            }
             
            if (coord2 < -90 || coord2 > 90) {
                // must be lat, lng
                geocodes.push(coordinateFeature(coord2, coord1));
            }
             
            if (geocodes.length === 0) {
                // else could be either lng, lat or lat, lng
                geocodes.push(coordinateFeature(coord1, coord2));
                geocodes.push(coordinateFeature(coord2, coord1));
            }
             
            return geocodes;
        };

        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            // limit results to Singapore
            countries,
            marker: {
                color: 'orange'
            },

            zoom: 10.9,

            // further limit results to the geographic bounds representing the region of
            // Centeral Singapore region
            bbox,
            localGeocoder: coordinatesGeocoder,
            placeholder: 'Try: -40, 170',

            // apply a client side filter to further limit results to those strictly within
            // the New Australie
            filter: function (item) {
                // returns true if item contains New South Wales region
                return item.context
                    .map(function (i) {

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
        });
          
        map.addControl(geocoder, 'top-left');

        geocoder.on('result', function(ev) {
            const searchResult = ev.result.geometry;
            
            // Code for the next step will go here
            var options = { units: 'miles' };
            points.features.forEach(point =>  {
                Object.defineProperty(point.properties, 'distance', {
                    value: turf.distance(searchResult, point.geometry, options),
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            });

            points.features.sort((a, b) => {
                if (a.properties.distance > b.properties.distance) {
                  return 1;
                }
                if (a.properties.distance < b.properties.distance) {
                  return -1;
                }
                return 0; // a must be equal to b
            });

            const createPopUp = (currentFeature) => {
                const popUps = document.getElementsByClassName('mapboxgl-popup');
                if (popUps[0]) popUps[0].remove();
            
                const popup = new mapboxgl.Popup({closeOnClick: false})
                  .setLngLat(currentFeature.geometry.coordinates)
                  .setHTML('<h3>Nearest Scooter</h3>')
                  .addTo(map);
            }

            createPopUp(points.features[0]);
        });
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
};

// Call start
(async() => {
    // Get mapdata
    const newMapData = await getMapData();
    await drawMap(newMapData)
})();