const options = {
  // Required: Your API key
  key: 'YbllC1olFg46a7D9evwnyfWicXCO4VDb',

  // Optional: Initial state of the map
  // 名古屋駅の場所を中心に表示
  lat: 35.170736,
  lon: 136.882104,
  zoom: 6,
};

// Initialize Windy API
windyInit(options, windyAPI => {
    const { map } = windyAPI;
    // .map is instance of Leaflet map
});
