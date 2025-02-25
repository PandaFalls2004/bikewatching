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


let timeFilter = -1;
// Load the traffic data
const tripsUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv';
let trips = [];
let filteredArrivals = new Map();
let filteredDepartures = new Map();
let filteredStations = [];

// Initialize departure and arrival buckets
let departuresByMinute = Array.from({ length: 1440 }, () => []);
let arrivalsByMinute = Array.from({ length: 1440 }, () => []);

// Select the slider and display elements
const timeSlider = document.getElementById('time-slider');
const selectedTime = document.getElementById('selected-time');
const anyTimeLabel = document.getElementById('any-time');

// Helper function to format time
function formatTime(minutes) {
  const date = new Date(0, 0, 0, 0, minutes);  // Set hours & minutes
  return date.toLocaleString('en-US', { timeStyle: 'short' }); // Format as HH:MM AM/PM
}

// Function to update the UI when the slider moves
function updateTimeDisplay() {
  timeFilter = Number(timeSlider.value);  // Get slider value

  if (timeFilter === -1) {
    selectedTime.textContent = '';  // Clear time display
    anyTimeLabel.style.display = 'block';  // Show "(any time)"
  } else {
    selectedTime.textContent = formatTime(timeFilter);  // Display formatted time
    anyTimeLabel.style.display = 'none';  // Hide "(any time)"
  }

  // Trigger filtering logic
  filterTripsByTime();
}

// Bind the slider's input event to our function
timeSlider.addEventListener('input', updateTimeDisplay);

// Set the initial display state
updateTimeDisplay();



// Load the trips data
d3.csv(tripsUrl).then(tripData => {
  trips = tripData;
  console.log('Loaded Trip Data:', trips);

  // Convert start and end time strings to Date objects and populate buckets
  trips.forEach(trip => {
    trip.started_at = new Date(trip.started_at);
    trip.ended_at = new Date(trip.ended_at);
    
    let startedMinutes = minutesSinceMidnight(trip.started_at);
    departuresByMinute[startedMinutes].push(trip);
    
    let endedMinutes = minutesSinceMidnight(trip.ended_at);
    arrivalsByMinute[endedMinutes].push(trip);
  });

  // Load the nested JSON file
  const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
  d3.json(jsonurl).then(jsonData => {
    console.log('Loaded JSON Data:', jsonData);

    stations = jsonData.data.stations;
    console.log('Stations Array:', stations);

    // Initial filtering and marker updating
    filterTripsByTime();
  }).catch(error => {
    console.error('Error loading JSON:', error);
  });
}).catch(error => {
  console.error('Error loading Trip Data:', error);
});

// Helper function to calculate minutes since midnight
function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

// Helper function to filter trips by minute
function filterByMinute(tripsByMinute, minute) {
  let minMinute = (minute - 60 + 1440) % 1440;
  let maxMinute = (minute + 60) % 1440;

  if (minMinute > maxMinute) {
    let beforeMidnight = tripsByMinute.slice(minMinute);
    let afterMidnight = tripsByMinute.slice(0, maxMinute);
    return beforeMidnight.concat(afterMidnight).flat();
  } else {
    return tripsByMinute.slice(minMinute, maxMinute).flat();
  }
}

// Function to filter trips by time
function filterTripsByTime() {
  filteredDepartures = filterByMinute(departuresByMinute, timeFilter);
  filteredArrivals = filterByMinute(arrivalsByMinute, timeFilter);

  // Calculate filtered arrivals and departures
  let arrivalsMap = d3.rollup(filteredArrivals, v => v.length, d => d.end_station_id);
  let departuresMap = d3.rollup(filteredDepartures, v => v.length, d => d.start_station_id);

  // Update stations with filtered data
  filteredStations = stations.map(station => {
    station = { ...station };
    const id = station.short_name;
    station.arrivals = arrivalsMap.get(id) ?? 0;
    station.departures = departuresMap.get(id) ?? 0;
    station.totalTraffic = station.departures + station.arrivals;
    return station;
  });

  // Update the radius scale based on total traffic
  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(filteredStations, d => d.totalTraffic)])
    .range(timeFilter === -1 ? [0, 25] : [3, 50]);

  // Append or update SVG circles for each station
  const circles = svg.selectAll('circle')
    .data(filteredStations);

  circles.enter()
    .append('circle')
    .attr('fill', 'steelblue')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8)
    .merge(circles)
    .attr('r', d => radiusScale(d.totalTraffic)) // Set radius based on total traffic
    .each(function(d) {
      d3.select(this)
        .select('title')
        .remove(); // Remove existing <title> to prevent duplicates

      d3.select(this)
        .append('title')
        .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
    });

  circles.exit().remove();

  // Function to update circle positions when the map moves/zooms
  function updatePositions() {
    function getCoords(station) {
      const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Convert lon/lat to Mapbox LngLat
      const { x, y } = map.project(point); // Project to pixel coordinates
      return { cx: x, cy: y }; // Return as object for use in SVG attributes
    }

    circles
      .attr('cx', d => getCoords(d).cx) // Set the x-position using projected coordinates
      .attr('cy', d => getCoords(d).cy); // Set the y-position using projected coordinates
  }

  // Initial position update when map loads
  updatePositions();

  // Reposition markers on map interactions
  map.on('move', updatePositions); // Update during map movement
  map.on('zoom', updatePositions); // Update during zooming
  map.on('resize', updatePositions); // Update on window resize
  map.on('moveend', updatePositions); // Final adjustment after movement ends
}



