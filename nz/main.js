const map = L.map("map", {
    center: [ -41.2875, 174.776111 ], 
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([ -41.2875, 174.776111 ]) .addTo(map);
mrk.bindPopup("Wellington") .openPopup();

console.log(document.querySelector("#map"))