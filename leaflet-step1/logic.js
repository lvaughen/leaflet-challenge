// Create a map object
var myMap = L.map("map", {
  center: [37, -120],
  zoom: 4
});

L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// Store our API endpoint inside queryUrl, the link is for all week geojson
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  // console.log(data.features);



  // Loop through the cities array and create one marker for each city object
  for (var i = 0; i < data.features.length; i++) {

    //  console.log(data.features[i].geometry.coordinates)
    //  console.log(data.features[i].properties.mag)


    // Conditionals for countries points
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

    // Add circles to map
    L.circle(data.features[i].geometry.coordinates, {
      fillOpacity: 0.75,
      color: "white",
      fillColor: color,
      // Adjust radius
      radius: data.features[i].properties.mag * 15000
    }).bindPopup("<h1>" + data.features[i].properties.type + "</h1> <hr> <h3>Points: " + data.features[i].properties.title + "</h3>").addTo(myMap);

  }

  // Add Legend to map from this reference https://gis.stackexchange.com/questions/133630/adding-leaflet-legend, https://leafletjs.com/examples/choropleth/#custom-legend-control

  function getColor(i) {
    return i > 5 ? "#E74C3C" :
      i > 2 ? "#CA6F1E" :
        i > 1 ? "#F4D03F" :
          "#D7DBDD";
  }



  var legend = L.control({ position: 'bottomright' });


  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 5],
      colors = ["#D7DBDD", "#F4D03F", "#FFA500", "#FF0000"];

    div.innerHTML = "<H3>Legend</H3>" + "<h4> Color - EQ Mag </h4>"

    for (var i = 0; i < grades.length; i++) {

      div.innerHTML +=
        '<i  style="background:' + colors[i] + '"></i> ' + "&nbsp;&nbsp;&nbsp;&nbsp;"+
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');

        console.log(i, colors[grades[i]]);
    }

    return div;
  };

  legend.addTo(myMap);



});
