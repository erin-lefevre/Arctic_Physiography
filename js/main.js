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
    attribution: 'Map data &copy; <a href=https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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
    createSliderUI(info.timestamps);
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
                weight: .25,
                fillOpacity: .15
            
            }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({fillColor: 'green'});
                },
                mouseout: function(e) {
                     this.closePopup();
                     this.setStyle({fillColor: '#501e65'});
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
     
     var popupContent = '<b>' + 'Year:' + '</b>' + ' ' + timestamp + '<br>'
     
     + '<b>' + 'Plant Name:' + '</b>' + ' ' + props.Plant_Name + '<br>'
     + '<b>' + 'MWh:' + '</b>' + ' ' + String(props[timestamp]);
     
     
     layer.setRadius(radius);
     layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
     
 });
}

/* Calculate the radius of the proportional symbols*/

function calcPropRadius(attributeValue) {
    
    /*Adjust the scale factor as needed*/
    var scaleFactor = 0.00005;
    var area = attributeValue * scaleFactor;
    
    return Math.sqrt(area/Math.PI);
}


/*Temporal time slider content*/

function createSliderUI(timestamps) {
  var sliderControl = L.control({ position: 'bottomleft'} );
    
    sliderControl.onAdd = function(map) {
        var slider = L.DomUtil.create('input', 'range-slider');
        L.DomEvent.addListener(slider, 'mousedown', function(e) {
            L.DomEvent.stopPropagation(e);
            map.dragging.disable(e);
            map.dragging.enable(e)
        });
        
            
        var labels = ['2013', '2014', '2015', '2016', '2017', '2018', '2019'];
        
        $(slider)
        .attr({
            'type':'range',
            'max': timestamps[timestamps.length-1],
            'min':timestamps[0],
            'step': 1,
            'value': String(timestamps[0])
        })
        .on('input change', function() {
            updatePropSymbols($(this).val().toString());
            var i = $.inArray(this.value,timestamps);
            $(".temporal-legend").text(labels[i]);
        });
        return slider;
    }
    sliderControl.addTo(myMap);
    createTimeLabel('2013'); 
  }
    
  /*add labels to the timeslider*/ 
function createTimeLabel(startTimestamp) {
    var temporalLegend = L.control({position: 'bottomleft' });
    temporalLegend.onAdd = function(myMap) {
        var output = L.DomUtil.create("output", "temporal-legend");
        $(output).text(startTimestamp);
        
        return output;
    }
    temporalLegend.addTo(myMap);   

}








