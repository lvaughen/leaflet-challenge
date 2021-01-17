// Get and define base map layers, pulled from https://docs.mapbox.com/api/maps/styles/#mapbox-styles
// Outdoors style is visibly the same as streets so did not include

var streets_map = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
})

var satellite_map = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
})

var light_map = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
})

var dark_map = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/dark-v10",
  accessToken: API_KEY
})

// Allow background maps to be selectable base_layers

var base_layers = {
  
  Satellite: satellite_map,
  Light: light_map,
  Dark: dark_map,
  Street: streets_map

}

//  Create 2 separate layer data group layers (EQ data, Plate data)

var eq_point_layer = new L.LayerGroup();
var plate_lines = new L.LayerGroup();

// create a lverlay layer object so layers within can be selectable via control layer

var data_layer = {
  "Plates": plate_lines,
  "EQ points": eq_point_layer
};


// Create Map object that holds the base map layers

var myMap = L.map("map", {
  center: [37, -120],
  zoom: 4,
  layers: [streets_map, satellite_map, light_map, dark_map, plate_lines, eq_point_layer]
});

// Add the map control to the map for base and data layers

L.control.layers(base_layers, data_layer).addTo(myMap);


// Get Earthquake spot data - Store our API endpoint inside queryUrl (part 1)
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {

  // console.log(data.features);

  // Loop through the cities array and create one marker for each city object
  for (var i = 0; i < data.features.length; i++) {

    //  console.log(data.features[i].geometry.coordinates)
    //  console.log(data.features[i].properties.mag)


    // set color per point based on EQ magnitude
    var color = "";
    if (data.features[i].properties.mag > 5) {
      color = "red";
    }
    else if (data.features[i].properties.mag > 2) {
      color = "orange";
    }
    else if (data.features[i].properties.mag > 1) {
      color = "yellow";
    }
    else {
      color = "grey";
    }

    // fix geometry.coordinates
    var lat = data.features[i].geometry.coordinates[1]
    var long = data.features[i].geometry.coordinates[0]

    data.features[i].geometry.coordinates[0] = lat;
    data.features[i].geometry.coordinates[1] = long;

    // console.log(data.features[i].geometry.coordinates)

    // console.log(color)

    // Add circles to map layer, provides access outside of function
    var quakespots_layer = L.circle(data.features[i].geometry.coordinates, {
      fillOpacity: 0.75,
      color: "white",
      fillColor: color,
      // Adjust radius
      radius: data.features[i].properties.mag * 15000
    }).bindPopup("<h1>" + data.features[i].properties.type + "</h1> <hr> <h3>Points: " + data.features[i].properties.title + "</h3>").addTo(eq_point_layer);

  }

});



//  Get data for plate information from downloaded file
var queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
var plates_data = d3.json(queryUrl2, function (data) {

  // console.log(data.features);

  // Loop through the features for each plate line
  for (var i = 0; i < data.features.length; i++) {

    console.log(data.features[i].geometry.coordinates)

    // // fix geometry.coordinates
    // var lat = data.features[i].geometry.coordinates[1]
    // var long = data.features[i].geometry.coordinates[0]

    // data.features[i].geometry.coordinates[0] = lat;
    // data.features[i].geometry.coordinates[1] = long;

    // Add liness to plate layer and make accessible outside of function
    var plates_layer = L.polyline(data.features[i].geometry.coordinates, {
      fillOpacity: 0.75,
      color: "blue",
      weight: 1,
      dashArray: '5,5,1,5'

    }).addTo(plate_lines);

  }

});




//   // Add Legend to map from this reference https://gis.stackexchange.com/questions/133630/adding-leaflet-legend, https://leafletjs.com/examples/choropleth/#custom-legend-control

//   function getColor(i){
//     return i > 5 ? "#E74C3C" :
//     i > 2  ? "#CA6F1E" :
//     i > 1  ? "#F4D03F" :
//              "#D7DBDD";
//   }

//   // Create a map object
// var myMap = L.map("map", {
//     center: [37, -120],
//     zoom: 4
//   });

//   L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//     tileSize: 512,
//     maxZoom: 18,
//     zoomOffset: -1,
//     id: "mapbox/streets-v11",
//     accessToken: API_KEY
//   }).addTo(myMap);

//   var legend = L.control({ position: 'bottomright' });
//   legend.onAdd = function (myMap) {

//     var div = L.DomUtil.create('div', 'info legend'),
//     grades = [0, 1, 2, 5],
//     labels = [];

//     // grades = ['EQ Magnitude > 5.0', 'EQ Magnitude > 2.0', 'EQ Magnitude > 1.0', 'EQ Magnitude <= 1.0'];

//     for (var i = 0; i < grades.length; i++) {

//       div.innerHTML +=
//       '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
//       grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
//     }

//     return div;
//   };

//   legend.addTo(myMap);


// });
