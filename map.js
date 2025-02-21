 // Set your Mapbox access token here
 mapboxgl.accessToken = 'pk.eyJ1IjoicGFuZGEyMDA0IiwiYSI6ImNtN2VlNnNhNDA3bm8yenE0M2tjZjVhN3cifQ.r8h8lqLIltZ4r227nmaX1A';

 // Initialize the map
 const map = new mapboxgl.Map({
   container: 'map', // ID of the div where the map will render
   style: 'mapbox://styles/mapbox/streets-v12', // Map style
   center: [-71.09415, 42.36027], // [longitude, latitude]
   zoom: 12, // Initial zoom level
   minZoom: 5, // Minimum allowed zoom
   maxZoom: 18 // Maximum allowed zoom
 });