const api_key = "pk.eyJ1Ijoicm9zYXpodSIsImEiOiJja2ZvbTFvbzEyM2c1MnVwbTFjdmVycXk5In0.71jVP2vD8pBWO2bsKtI48Q";

var queryUrl= "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Make a GET request to the specified URL
d3.json(queryUrl).then(function (data) {
  console.log(data);
  // After receiving a response, pass the data.features object to the createFeatures function
  createFeatures(data.features);
});

function markerSize(magnitude) {
  return magnitude * 2000;
};

function chooseColor(depth) {
  switch(true) {
    case depth > 90:
      return "red";
    case depth > 70:
      return "orangered";
    case depth > 50:
      return "orange";
    case depth > 30:
      return "gold";
    case depth > 10:
      return "yellow";
    default:
      return "green";
  }
}

function createFeatures(earthquakeData) {

  // Define a function to run for each feature in the array
  // Attach a popup to each feature displaying the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer with the features array from the earthquakeData object
  // Execute the onEachFeature function for each item in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    // Use pointToLayer to alter markers
    pointToLayer: function(feature, latlng) {
      // Set marker style based on feature properties
      var markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.10,
        color: "black",
        stroke: true,
        weight: 0.5
      }
      return L.circle(latlng, markers);
    }
  });

  // Pass the earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style: 'mapbox/light-v11',
    access_token: api_key
  });

  // Create an object for base maps
  var baseMaps = {
    "Grayscale Map": grayscale
  };

  // Create an object for overlay layers
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Initialize the map with specified options
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 10,
    layers: [grayscale, earthquakes]
  });

  // Add a legend to the map
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);

  // Add layer control to the map
  // Pass baseMaps and overlayMaps
  // Ensure the layer control is added to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

