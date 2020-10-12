/*JavaScript - Erin J. LeFevre, 2020*/
/* data processing/slider section based on the tutorial from neiugis.github.io/lab7*/

var myMap = L.map('mapid', {
    center: [38.815461, -98.368361],
   zoom: 5,
    
    maxBounds: [
        [20.227970, -136.789512],
        [54.755261, -52.750122]
    ],
    maxZoom: 15,
    minZoom: 3
    
});

/*Background map tile layer 1*/
var basemap1 = L.tileLayer('https://api.mapbox.com/styles/v1/erin-lefevre/ckg03iir70ezk19qrtlwbzwtu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJpbi1sZWZldnJlIiwiYSI6ImNrZnljaWQ2eDBvd3gzM283eDdxaW03ZmwifQ.pUnzIpTy98k-H2VfbkPFkA', {
    
    maxZoom: 18,
    
}).addTo(myMap);

/*Background map tile layer 2*/
var basemap2 = L.tileLayer('https://api.mapbox.com/styles/v1/erin-lefevre/ckg05kat80jec19lan4o72erl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXJpbi1sZWZldnJlIiwiYSI6ImNrZnljaWQ2eDBvd3gzM283eDdxaW03ZmwifQ.pUnzIpTy98k-H2VfbkPFkA', {
            
            maxZoom: 18
        });

/* powerplants.geojson directy*/
$.getJSON('data/powerplants.geojson')
.done(function(data) {
    var info = processData(data);
    createPropSymbols(info.timestamps, data);
    createSliderUI(info.timestamps);
	
});

/*Layer control start*/
var basemaps = {
    "Nuclear Earth": basemap1,
    "Aerial Imagery": basemap2
  };

var overlays = {    
  };

L.control.layers(basemaps, overlays, {
    collapsed: false
}).addTo(myMap);

/* End of layer control*/



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
                fillColor: '#eff782',
                color: '#eff782',
                weight: .25,
                fillOpacity: .30
            
            }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({fillColor: 'eff782'});
                },
                mouseout: function(e) {
                     this.closePopup();
                     this.setStyle({fillColor: '#eff782'});
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


/*Legend function could go here if necessary*/


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








