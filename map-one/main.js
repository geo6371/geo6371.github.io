let baselayers = {
    standard: L.tileLayer.provider("OpenStreetMap.DE"),
    darkMode: L.tileLayer.provider("Stadia.AlidadeSmoothDark"),
    terrain: L.tileLayer.provider("OpenTopoMap"),
};

const map = L.map("map", {
    fullscreenControl: true,
    center: [15, 0],
    zoom: 2,
    layers: [
        baselayers.standard
    ]
});

let layerControl = L.control.layers({
    "Standard": baselayers.standard,
    "Dark Mode": baselayers.darkMode,
    "Relief": baselayers.terrain,
//}, {
  //  "Liniennetz Vienna Sightseeing": overlays.country,
}).addTo(map);

//So komme ich an die CO2-Daten
//console.log('CO2-Daten: ', CODATA[0].Afghanistan.data[70].cement_co2);

// Länderliste abrufen
//console.log('CO2-Daten: ', CODATA[0].country);

let countries = CODATA[0].country;
console.log('Länder: ', countries)

console.log(CODATA.length);

//for (let i = 0; i < CODATA[0].length; i++){
//    console.log(array[i]);
//  }


const selectedCountry = "data";

for (let coTwo of CODATA) {
    if (selectedCountry == coTwo) {
        selected = 'selected';
    } else {
        selected = 'no';
    }
console.log(selected);
}

//Länder-Polygone hinzugefuegt
L.geoJson(COUNTRY).addTo(map);
