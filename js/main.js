/*JavaScript by Erin J. LeFevre, 2020*/


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


L.control.scale({position: 'topright', 'updateWhenIdle': true}).addTo(myMap);

/*Method 1: reads powerplants.js converted from powerplants.geojson
var powerplants = L.geoJSON(powerplants);
powerplants.addTo(myMap);*/

/* Method 2 reads powerplants.geojson directy*/
$.getJSON('/data/powerplants.geojson', function(geojson) {
    L.geoJSON(geojson).addTo(myMap);
});
        
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZXJpbi1sZWZldnJlIiwiYSI6ImNrZjRxejcwcTAxeTYyc24xc2Jma2tydHgifQ.I3e4gsE09RQuhbDiKyVlYg'
}).addTo(myMap);


        