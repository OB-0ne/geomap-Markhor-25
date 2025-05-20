
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
  var imgMark_Layer = L.featureGroup();
  var visitMark_Layer = L.featureGroup();

  // create dictionaries for baseMaps - in this case only the default map
  // this is a neede variable while making a layer control
  var baseMaps = {
    "Deafult Map": def_Map
  }
  // create a dictionary for different overlays - these will appear as checkbox
  var overlays = {
    "Visits": visitMark_Layer,
    "Photos": imgMark_Layer
  };

  // initiate the map and select default map tile and selected checkboxes
  var map = L.map('map',{
    zoom: 10,
    layers: [def_Map, visitMark_Layer, imgMark_Layer]
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

  // Generate the points of interest from the trip GPS info
  d3.csv("data/info25/conflicts.csv", function(err, data) {
    console.log(data)
    data.forEach(function(d) {
      
      var c_col = 'red'
      if (d.By == 'Indian Armed Forces'){
        c_col = 'orange';
      }
      else if(d.By == 'Pakistan Army'){
        c_col = 'green';
      }
      var marker = L.circle([d.loc_x, d.loc_y], 4000,{color: c_col}).addTo(visitMark_Layer);
        marker.bindTooltip(d.LocName);
    });
    
    var trip_line = L.polyline(routeCoordinates, {color: 'blue', className: 'day0'}).addTo(map);
    
  });

  // Generate the points of interest from trip images
  // d3.csv("data/trip_imageinfo.csv", function(err, img_data) {
  //   img_data.forEach(function(d) {
  //     var marker = L.marker([d.latitude, d.longitude], {icon: imageMarker, class: 'abc'}).addTo(imgMark_Layer); 
  //     const popupContent = `
  //         <div>
  //           <img src="${"data/image_content/trip/" + d.filename}" class="geomap_marker_trip_image" />
  //         </div>
  //       `;
  //       marker.bindPopup(popupContent);
  //   });
  // });

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