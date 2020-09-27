/*JavaScript by Erin J. LeFevre, 2020*/
/* data processing/slider section based on the tutorial from neiugis.github.io/lab7*/

var myMap = L.map('mapid', {
    center: [41.172089, -98.379409],
    zoom: 4,
    /*zoomSnap: .5,*/
    maxBounds: [
        [-20.715083, -136.026606],
        [55.718298, -50.013921]
    ],
    maxZoom: 14,
    minZoom: 1
});

/*Background map tile layer*/
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZXJpbi1sZWZldnJlIiwiYSI6ImNrZjRxejcwcTAxeTYyc24xc2Jma2tydHgifQ.I3e4gsE09RQuhbDiKyVlYg'
}).addTo(myMap);


/* powerplants.geojson directy*/
$.getJSON('data/powerplants.geojson')
.done(function(data) {
    var info = processData(data);
    createPropSymbols(info.timestamps, data);
});

 /*process the data*/
function processData(data) {
    
    var timestamps = [];
    var min = Infinity;
    var max = -Infinity;
    
    for (var feature in data.features) {
      var properties = data.features[feature].properties;
        
      for (var attribute in properties) {
          if ( attribute != 'FID' &&
               attribute != 'Shape' &&
               attribute != 'Plant_Code' &&
               attribute != 'City' &&
               attribute != 'Latitude' &&
               attribute != 'Longitude' &&
               attribute != 'Plant_Name' )
          {
               if ( $.inArray(attribute,timestamps) === -1) {
            
                    timestamps.push(attribute);
                }
                if (properties[attribute] < min) {
                    min = properties[attribute];
                }
                if (properties[attribute] > max) {
                    max = properties[attribute];
                }  
            }
        }
    }
    return {
        timestamps : timestamps,
        min : min,
        max : max
    }
 }
/*end of data processing*/


/* Proportional symbols, min max on data values*/

function createPropSymbols(timestamps, data) {
    
    powerplants = L.geoJson(data, {
        
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                fillColor: '#501e65',
                color: '#501e65',
                weight: 2,
                fillOpacity: 0.5
            
            }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({fillColor: 'green'});
                },
                mouseout: function(e) {
                     this.closePopup();
                     this.setStyle({fillcolor: '#501e65'});
            }
        });
    }
}).addTo(myMap);

updatePropSymbols(timestamps[0]);

}

/*Update and resize each circle marker*/

function updatePropSymbols (timestamp) {
    
 powerplants.eachLayer(function(layer) {
     
     var props = layer.feature.properties;
     var radius = calcPropRadius(props[timestamp]);
     
     var popupContent = 'Year:' + timestamp + '-' + props.Plant_Name + ':' + String(props[timestamp]) +':' +'MWH';
     
     
     layer.setRadius(radius);
     layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
     
 });
}

/* Calculate the area of the proportional symbols*/
function calcPropRadius(attributeValue) {
    
    /*Adjust the scale factor as needed*/
    var scaleFactor = 0.00005;
    var area = attributeValue * scaleFactor;
    
    return Math.sqrt(area/Math.PI);
}





    








