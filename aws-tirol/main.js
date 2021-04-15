let basemapGray = L.tileLayer.provider('BasemapAT.grau');


let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ]),
    "BasemapAT.terrain": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "OpenTopoMap": L.tileLayer.provider('OpenTopoMap')
}).addTo(map);

let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

//Wetterstationen können an und ausgemacht werden
let awsLayer = L.featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
awsLayer.addTo(map);

fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertieren: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker = L.marker(
                [
                    station.geometry.coordinates[1], station.geometry.coordinates[0]
                ]);
            
            //Datum formatieren
            let formattedDate = new Date(station.properties.date);

            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                    <li>Temperatur: ${station.properties.LT} °C</li>
                    <li>Schneehöhe: ${station.properties.HS} m</li>
                    <li>Schneehöhe: ${station.properties.RH} %</li>
                    <li>Höhe über NHN: ${station.geometry.coordinates[2]} m</li>


                </ul>
            `);
            marker.addTo(awsLayer);
        }

        //set map view to all stations
        map.fitBounds(awsLayer.getBounds());
    });