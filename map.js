// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
 // Set your Mapbox access token here
 import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
 mapboxgl.accessToken = 'pk.eyJ1IjoicGFuZGEyMDA0IiwiYSI6ImNtN2VnODUyYzBkazYybG9xNjBuZjc0ZTQifQ.dDhc4DynAY1yTeoVvo3Cfw';

 // Initialize the map
 const map = new mapboxgl.Map({
   container: 'map', // ID of the div where the map will render
   style: 'mapbox://styles/mapbox/streets-v12', // Map style
   center: [-71.09415, 42.36027], // [longitude, latitude]
   zoom: 12, // Initial zoom level
   minZoom: 5, // Minimum allowed zoom
   maxZoom: 18 // Maximum allowed zoom
 });
 map.on('load', () => { 
  //code 
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
  });
  
  map.addLayer({
    id: 'bike-lanes',
    type: 'line',
    source: 'boston_route',
    paint: {
      'line-color': 'green',
      'line-width': 3,
      'line-opacity': 0.4
    }
  });
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson?...'
  });
  map.addLayer({
    id: 'lanes',
    type: 'line',
    source: 'cambridge_route',
    paint: {
      'line-color': 'green',
      'line-width': 3,
      'line-opacity': 0.4
    }
  });
  
});
// Select the SVG element inside the map container
const svg = d3.select('#map').select('svg');

// Initialize an empty stations array (only once)
let stations = [];

// map.on('load', () => {
//   // Load the nested JSON file
//   const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json'
//   d3.json(jsonurl).then(jsonData => {
//     console.log('Loaded JSON Data:', jsonData);  // Log to verify structure
//   }).catch(error => {
//     console.error('Error loading JSON:', error);  // Handle errors if JSON loading fails
//   });
// });
// const stations = jsonData.data.stations;
// console.log('Stations Array:', stations);

// // Step 3.3
// const svg = d3.select('#map').select('svg');
// let stations = [];
// const circles = svg.selectAll('circle')
//   .data(stations)
//   .enter()
//   .append('circle')
//   .attr('r', 5)               // Radius of the circle
//   .attr('fill', 'steelblue')  // Circle fill color
//   .attr('stroke', 'white')    // Circle border color
//   .attr('stroke-width', 1)    // Circle border thickness
//   .attr('opacity', 0.8);      // Circle opacity

// function getCoords(station) {
//   const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
//   const { x, y } = map.project(point);  // Project to pixel coordinates
//   return { cx: x, cy: y };  // Return as object for use in SVG attributes
// }



//    // Function to update circle positions when the map moves/zooms
//    function updatePositions() {
//     circles
//       .attr('cx', d => getCoords(d).cx)  // Set the x-position using projected coordinates
//       .attr('cy', d => getCoords(d).cy); // Set the y-position using projected coordinates
//   }

//   // Initial position update when map loads
//   updatePositions();

//     // Reposition markers on map interactions
//   map.on('move', updatePositions);     // Update during map movement
//   map.on('zoom', updatePositions);     // Update during zooming
//   map.on('resize', updatePositions);   // Update on window resize
//   map.on('moveend', updatePositions);  // Final adjustment after movement ends

// Wait for the map to load
map.on('load', () => {
  // Load the nested JSON file
  const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
  d3.json(jsonurl).then(jsonData => {
      console.log('Loaded JSON Data:', jsonData);  // Log to verify structure

      // Access the nested stations array
      stations = jsonData.data.stations;
      console.log('Stations Array:', stations);

      // Append SVG circles for each station
      const circles = svg.selectAll('circle')
          .data(stations)
          .enter()
          .append('circle')
          .attr('r', 5)               // Radius of the circle
          .attr('fill', 'steelblue')  // Circle fill color
          .attr('stroke', 'white')    // Circle border color
          .attr('stroke-width', 1)    // Circle border thickness
          .attr('opacity', 0.8);      // Circle opacity

      

      // Function to update circle positions when the map moves/zooms
      function updatePositions() {
          function getCoords(station) {
              const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
              const { x, y } = map.project(point);  // Project to pixel coordinates
              return { cx: x, cy: y };  // Return as object for use in SVG attributes
          }

          circles
              .attr('cx', d => getCoords(d).cx)  // Set the x-position using projected coordinates
              .attr('cy', d => getCoords(d).cy); // Set the y-position using projected coordinates
      }
      // Initial position update when map loads
      updatePositions();

      // Reposition markers on map interactions
      map.on('move', updatePositions);     // Update during map movement
      map.on('zoom', updatePositions);     // Update during zooming
      map.on('resize', updatePositions);   // Update on window resize
      map.on('moveend', updatePositions);  // Final adjustment after movement ends
  }).catch(error => {
      console.error('Error loading JSON:', error);  // Handle errors if JSON loading fails
  });
});



