
function draw_map(){

  let custom_map_height = window.innerHeight - 120;
  // add a check to see if user is on mobile and set a different map height accordingly
  if (window.innerWidth<=768){
    custom_map_height = custom_map_height - 95;
  }
  document.getElementById('map').setAttribute("style","height:"+(custom_map_height)+"px");

  // Add a tile layer (you can change to other providers if needed)
  var def_Map = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });

  // make layer grousp for the markers - visist and images
  var borderMark_Layer = L.featureGroup();
  var conflictMark_Layer = L.featureGroup();

  // create dictionaries for baseMaps - in this case only the default map
  // this is a neede variable while making a layer control
  var baseMaps = {
    "Deafult Map": def_Map
  }
  // create a dictionary for different overlays - these will appear as checkbox
  var overlays = {
    "Conflicts": conflictMark_Layer,
    "Borders": borderMark_Layer
  };

  // initiate the map and select default map tile and selected checkboxes
  var map = L.map('map',{
    zoom: 10,
    layers: [def_Map, borderMark_Layer, conflictMark_Layer]
  });

  // initialize the control which can be interacted with
  var layerControl = L.control.layers(baseMaps,overlays).addTo(map);


  // initiate the icons which will be used for the markers
  var imageMarker = new L.icon({
    iconUrl: 'icons/map/image-marker.png',
    iconSize: [60,60]
  });

  var poiMarker = new L.icon({
    iconUrl: 'icons/map/poi-marker.png',
    iconSize: [60,60]
  });  

  // a list to store all coordinates which can be converted to a polyline eventually
  var routeCoordinates = [];
  i = 0;

  // Generate the points of conflict
  d3.csv("data/info25/conflicts.csv", function(err, data) {
    data.forEach(function(d) {
      
      var c_col = 'red'
      if (d.By == 'Indian Armed Forces'){
        c_col = 'orange';
      }
      else if(d.By == 'Pakistan Army - Shelling'){
        c_col = 'green';
      }
      var marker = L.circle([d.loc_x, d.loc_y], 4000,{color: c_col}).addTo(conflictMark_Layer);
        marker.bindTooltip(d.LocName);
    });    
  });

  var list = []
  d3.csv("data/country_shapes/pak.csv", function(err, data) {
    
    // make the polygon point list
    list = []
    data.forEach(function(d) {
      list.push([d.lat,d.long])
    });
    
    L.polygon(list, {color: 'green'}).addTo(borderMark_Layer);
  });

  d3.csv("data/country_shapes/ind.csv", function(err, data) {
    
    // make the polygon point list
    list = []
    data.forEach(function(d) {
      list.push([d.lat,d.long])
    });
    
    L.polygon(list, {color: 'orange'}).addTo(borderMark_Layer);
  });

  d3.csv("data/country_shapes/pok.csv", function(err, data) {
    
    // make the polygon point list
    list = []
    data.forEach(function(d) {
      list.push([d.lat,d.long])
    });
    
    L.polygon(list, {color: 'black'}).addTo(borderMark_Layer);
  });

  // set default settings for the map including bounds, active layers
  map.fitBounds(L.latLngBounds([36.5, 67],[30, 81]));
  map.setMaxBounds(map.getBounds());
  

}

// Toggle popup visibility
function toggleGeomapInfoPopup() {
  const infoPopup = document.getElementById('info-popup');
  infoPopup.classList.toggle('hidden');
}

// Show popup on page load
window.onload = function() {
  document.getElementById('info-popup').classList.remove('hidden');
};