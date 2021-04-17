// https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

// https://leafletjs.com/reference-1.7.1.html#map-example
let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

// https://leafletjs.com/reference-1.7.1.html#control
let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    // https://leafletjs.com/reference-1.7.1.html#tilelayer
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    // https://leafletjs.com/reference-1.7.1.html#layergroup
    "BasemapAT.overlay+ortho": L.layerGroup([
        // https://leafletjs.com/reference-1.7.1.html#tilelayer
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}).addTo(map);


let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

// Durch diesen Code wird die Auswahl im Layer Control eingefügt

// https://leafletjs.com/reference-1.7.1.html#featuregroup
let awsLayer = L.featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
//awsLayer.addTo(map);

// https://leafletjs.com/reference-1.7.1.html#featuregroup
let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhen");
//snowLayer.addTo(map);

// https://leafletjs.com/reference-1.7.1.html#featuregroup
let windLayer = L.featureGroup();
layerControl.addOverlay(windLayer, "Windgeschwindigkeit");
//windLayer.addTo(map);

// https://leafletjs.com/reference-1.7.1.html#featuregroup
let tempLayer = L.featureGroup();
layerControl.addOverlay(tempLayer, "Lufttemperatur");
tempLayer.addTo(map);


fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            // console.log('Station: ', station);
            // https://leafletjs.com/reference-1.7.1.html#marker
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);
            let formattedDate = new Date(station.properties.date);
            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
              <li>Datum: ${formattedDate.toLocaleString("de")}</li>
              <li>Seehöhe: ${station.geometry.coordinates[2]} m</li>
              <li>Temperatur: ${station.properties.LT || '?'} C</li>
              <li>Schneehöhe: ${station.properties.HS || '?'} cm</li>
              <li>Windgeschwindigkeit: ${station.properties.WG || '?'} m/s</li>
              <li>Windrichtung: ${station.properties.WR || '?'} °</li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(awsLayer);

            //snow
            if (station.properties.HS) {
                let highlightClass = '';
                if (station.properties.HS > 100) {
                    highlightClass = 'snow-100';
                }
                if (station.properties.HS > 200) {
                    highlightClass = 'snow-200';
                }
                // https://leafletjs.com/reference-1.7.1.html#divicon
                let snowIcon = L.divIcon({
                    html: `<div class="snow-label ${highlightClass}">${station.properties.HS}</div>`
                })
                // https://leafletjs.com/reference-1.7.1.html#marker
                let snowMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowMarker.addTo(snowLayer);
            }

            //wind
            if (station.properties.WG) {
                let highlightClass = '';
                if (station.properties.WG > 10) {
                    highlightClass = 'wind-10';
                }
                if (station.properties.WG > 20) {
                    highlightClass = 'wind-20';
                }
                // https://leafletjs.com/reference-1.7.1.html#divicon
                let windIcon = L.divIcon({
                    html: `<div class="wind-label ${highlightClass}">${station.properties.WG}</div>`
                })
                // https://leafletjs.com/reference-1.7.1.html#marker
                let windMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windMarker.addTo(windLayer);
            }

            //Temperatur
            if (station.properties.LT) {
                let highlightClass = '';
                if (station.properties.LT < 0) {
                    highlightClass = 'temp-0';
                }
                if (station.properties.LT > 0) {
                    highlightClass = 'temp-1';
                }
                // https://leafletjs.com/reference-1.7.1.html#divicon
                let tempIcon = L.divIcon({
                    html: `<div class="temp-label ${highlightClass}">${station.properties.LT}</div>`
                })
                // https://leafletjs.com/reference-1.7.1.html#marker
                let tempMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: tempIcon
                });
                tempMarker.addTo(tempLayer);
            }
        }

        // Setzt map view auf alle Stationen
        map.fitBounds(awsLayer.getBounds());
    });