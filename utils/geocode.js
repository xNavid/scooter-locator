const axios = require('axios')

const geoCode = async address => {
    try {
        const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+ encodeURIComponent(address) +'.json?access_token=pk.eyJ1IjoieG5hdmlkIiwiYSI6ImNraGU5d2ZwODA0MjgydHBsNTFkaWVmNmsifQ.BqaC-JIdCdMpd8BdhXy9pQ'
        const response = await axios.get(url);
        return response;
    } catch (error) {
        return null;
    }
  }

module.exports = geoCode;