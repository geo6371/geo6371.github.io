const map = L.map("map", {
    center: [ -41.2875, 174.776111 ], 
    zoom: 13
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
//-41.2875, 174.776111
console.log(document.querySelector("#map"))