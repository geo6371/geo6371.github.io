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
        baselayers.darkMode
    ]
});

let layerControl = L.control.layers({
    "Standard": baselayers.standard,
    "Dark Mode": baselayers.darkMode,
    "Relief": baselayers.terrain,
//}, {
    //"Liniennetz Vienna Sightseeing": overlays.busLines,
}).addTo(map);