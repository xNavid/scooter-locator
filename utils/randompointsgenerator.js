// Require turfs
var turf = require('@turf/random');

// This functions creates random points within a given polygon
const generateRandomPointsOnMap = async (count, polygon) => {
    try {
        const randomPoints =  turf.randomPoint(count, {bbox: polygon });
        return randomPoints;
    } catch (error) {
        return null;
    }
};

module.exports  = generateRandomPointsOnMap;