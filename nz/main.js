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
    //center: [stop.lat, stop.lng],
    //zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let nav = document.querySelector("#navigation");
console.log('Navigation HTML Element: ', nav);
//console.log(nav);

//console.log(ROUTE);
ROUTE.sort((stop1, stop2) => {
    if (stop1.nr > stop2.nr) {
        return 1;
    } else {
        return -1;
    }
});


for (let entry of ROUTE) {
    console.log(entry);
    
nav.innerHTML += `
    <option value="${entry.user}">Stop ${entry.nr} ${entry.name}</option>
`;

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(`
        <h4>Stop ${entry.nr}: ${entry.name}</h4>
        <p><i class="fas fa-external-link-alt" mr-3></i> <a href="${entry.wikipedia}">Read about stop in Wikipedia</a></p>
    `);

    if (entry.nr == 20) {
        map.setView([entry.lat, entry.lng], 13);
        mrk.openPopup();
    }
}

nav.options.selectedIndex = 20-1;

//nav.selectedIndex = 20 - 1;
nav.onchange = (evt) => {
    console.log(evt.target.selectedIndex);
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;

    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;
    window.location.href = link;
    console.log(link);
}

console.log(document.querySelector("#map"));

