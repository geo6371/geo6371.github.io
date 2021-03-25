let stop = {
    nr: 20,
    name: "Wellington",
    lat: -41.2875,
    lng: 174.776111,
    user: "geo6371",
    wikipedia: "https://de.wikipedia.org/wiki/Wellington"
}
console.log(stop);

const map = L.map("map", {
    center: [stop.lat, stop.lng],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([stop.lat, stop.lng]).addTo(map);
mrk.bindPopup(`
    <h4>Stop ${stop.nr}: ${stop.name}</h4>
    <p><i class="fas fa-external-link-alt" mr-3></i> <a href="${stop.wikipedia}">Read about stop in Wikipedia</a></p>
`).openPopup();

console.log(document.querySelector("#map"))