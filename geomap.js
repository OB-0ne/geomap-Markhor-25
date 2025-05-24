// Define layers for assigning shapes
var borderMark_Layer;
var conflictMark_Layer;
var map;
var userIsPhone = false;

function draw_map(){

  let custom_map_height = window.innerHeight - 115;
  // add a check to see if user is on mobile and set a different map height accordingly
  if (window.innerWidth<=768){
    custom_map_height = custom_map_height - 60;
    userIsPhone = true;
  }
  document.getElementById('map').setAttribute("style","height:"+(custom_map_height)+"px");

  // Add a tile layer (you can change to other providers if needed)
  var def_Map = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    zoomSnap: 0.1,
    maxZoom: 11
  });

  // make layer grousp for the markers - visist and images
  borderMark_Layer = L.featureGroup();
  conflictMark_Layer = L.featureGroup();

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
  map = L.map('map',{
    layers: [def_Map, borderMark_Layer, conflictMark_Layer]
  });

  // initialize the control which can be interacted with
  var layerControl = L.control.layers(baseMaps,overlays).addTo(map);

    

}

var conficts_data, selected_date, date_range_list;
var temp;
function setup_map(){
  var inputDateRange = document.getElementById("map-date-slider");
  var inputDateInfo = document.getElementById("map-date-slider-info");
  if (conficts_data){
    // get the unique dates from data
    date_range_list = d3.map(conficts_data, function(d){return(d.Date)}).keys();
    date_range_list.push('All')

    // set the limits for range
    inputDateRange.setAttribute("min", 0); 
    inputDateRange.setAttribute("max", date_range_list.length-1); 
    // set the slider value for display
    date_range_list.forEach(function(d){
      const dateName = document.createElement('p');
      dateName.classList.add("map-date-slider-name");
      dateName.textContent = d;
      inputDateInfo.appendChild(dateName);
    });
    inputDateRange.value = 0;

    makeBoundaryPoly();
    change_date();
  }
  else{
    // assign global UI control variables
    d3.csv("data/info25/conflicts.csv",function(data) {
      conficts_data = data
      console.log("Data-Read");
      setup_map();
    });
  }
}

function makeBoundaryPoly(){

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
  
}

function change_date(){

  // Remove revious conflicts if any
  conflictMark_Layer.clearLayers();
  //get the current date selected
  var inputDateRange = document.getElementById("map-date-slider");
  var cons;
  selected_date = date_range_list[inputDateRange.value];
  // Generate the points of conflict
  if (selected_date != "All"){
    var cons = conficts_data.filter(function(d){ return d.Date == selected_date });
  }
  else{
    var cons = conficts_data;
  }
  
  // draw each conflict as a circle
  cons.forEach(function(d) {
    var c_col = 'red'
    if (d.By == 'Indian Armed Forces'){
      c_col = 'orange';
    }
    else if(d.By.includes("Pakistan Army")){
      c_col = 'green';
    }
    var marker = L.circle([d.loc_x, d.loc_y], 4000,{color: c_col}).addTo(conflictMark_Layer);
      marker.bindTooltip(d.LocName);
  });

  // get bounds of current dataset
  lat_min = d3.min(cons, function(d) { return d.loc_y; });
  lat_max = d3.max(cons, function(d) { return d.loc_y; });
  long_min = d3.min(cons, function(d) { return d.loc_x; });
  long_max = d3.max(cons, function(d) { return d.loc_x; });
  
  // set default settings for the map including bounds, active layers
  buffer = 0.7
  if (userIsPhone){
    map.fitBounds(L.latLngBounds([long_min-2.2*buffer, lat_min-buffer],[Number(long_max)+0.4*buffer, Number(lat_max)+0.2*buffer]));
  } else{
    map.fitBounds(L.latLngBounds([long_min-buffer, lat_min-2*buffer],[Number(long_max)+buffer, Number(lat_max)+buffer]));
  }

  // Set the text for info pop-up
  var popup_info_byDate = document.getElementById("info-popup-byDate-content");
  var temp_element;

  
  // Remoive any previous text in the div
  popup_info_byDate.innerHTML = '';

  // Add a title as the selected date and add it to div
  temp_element = document.createElement('h2');
  temp_element.innerHTML = selected_date;
  temp_element.setAttribute("style","text-align: center;");
  popup_info_byDate.appendChild(temp_element);

  temp_element = document.createElement('hr');
  temp_element.setAttribute("width","70%");
  temp_element.setAttribute("color","white");
  temp_element.setAttribute("size","2");
  temp_element.setAttribute("style","opacity: 0.65");
  popup_info_byDate.appendChild(temp_element);

  // make a dictionary where repeated decription is the key and cities as the list of values
  let popup_info_dict = new Map();
  cons.forEach(function(d){    
    if(popup_info_dict.get(d.desc)){
      popup_info_dict.get(d.desc).push(d.LocName)
    }else{
      popup_info_dict.set(d.desc,[d.LocName])
    }    
  });

  // convert the dictionary to list to append all info the div
  popup_info_dict.entries().forEach(function(d){
    
    temp_element = document.createElement('p');
    temp_element.classList.add('info-popup-paragraph');
    temp_element.innerHTML = d[0];            // the key is stored on index 0
    popup_info_byDate.appendChild(temp_element);

    temp_element = document.createElement('p');
    temp_element.classList.add('info-popup-cities');
    temp_element.innerHTML = d[1].join(", ");            // the list of values is stored on index 1
    popup_info_byDate.appendChild(temp_element);

    temp_element = document.createElement('hr');
    temp_element.setAttribute("width","70%");
    temp_element.setAttribute("color","white");
    temp_element.setAttribute("size","2");
    temp_element.setAttribute("style","opacity: 0.65");
    popup_info_byDate.appendChild(temp_element);

  });

}

// Toggle popup visibility
function toggleGeomapInfoPopup() {
  const infoPopup = document.getElementById('info-popup');
  infoPopup.classList.toggle('hidden');
  document.getElementById('info-popup-byDate').classList.toggle('hidden');

}

// Show popup on page load
window.onload = function() {
  document.getElementById('info-popup').classList.remove('hidden');
  L.DomEvent.disableScrollPropagation(document.getElementById('info-popup-byDate'));
};