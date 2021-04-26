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

let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    winddirection: L.featureGroup(),
    humidity: L.featureGroup(),
};

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
    },
    //Beschriftung Overlay-Menü
    {
        "Wetterstationen Tirol": overlays.stations,
        "Temperatur (°C)": overlays.temperature,
        "Schneehöhe (cm)": overlays.snowheight,
        "Windgeschwindigkeit (m/s)": overlays.windspeed,
        "Windrichtung (°)": overlays.winddirection,
        "Relative Luftfeuchtigkeit (%)": overlays.humidity,
    }, {
        collapsed: false
    }).addTo(map);
overlays.winddirection.addTo(map);

//Maßstab
L.control.scale({
    imperial: false
}).addTo(map);

// Change default options
let rainviewer = L.control.rainviewer({ 
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
});
rainviewer.addTo(map);

//getColor-Funktion
let getColor = (value, colorRamp) => {
    //console.log("Wert:", value, "Palette:", colorRamp);
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "silver";
};

//getDirection-Funktion
let getDirection = (value, directionRamp) => {
    //console.log("Wert:", value, "Richtung:", directionRamp);
    for (let rule of directionRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.dir;
        }
    }
    return "?";
};

let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors);
    let label = L.divIcon({
        html: `<div style="background-color:${color}">${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label,
        title: `${options.station} (${coords[2]}m)`
    });
    return marker;
};

let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

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

            //Angegebene Daten im Popup (nach Anklicken)
            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
              <li>Datum: ${formattedDate.toLocaleString("de")}</li>
              <li>Seehöhe: ${station.geometry.coordinates[2]} m</li>
              <li>Temperatur: ${station.properties.LT || '?'} °C</li>
              <li>Schneehöhe: ${station.properties.HS || '?'} cm</li>
              <li>Windgeschwindigkeit: ${station.properties.WG || '?'} m/s</li>
              <li>Windrichtung: ${station.properties.WR || '?'} °</li>
              <li>Relative Luftfeuchtigkeit: ${station.properties.RH || '?'} %</li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(overlays.stations);

            //Schneehöhe
            if (typeof station.properties.HS == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                marker.addTo(overlays.snowheight);
            }

            //windgeschwindigkeit
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);
            }

            //Temperatur
            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(1),
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                marker.addTo(overlays.temperature);
            }

            //Windrichtung
            if (typeof station.properties.WR == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: getDirection(station.properties.WR, DIRECTIONS),
                    //Hier müsste noch eine andere Farbe eingetragen werden. Bisher fällt es aus dem Raster, weil der Wert N, NW etc. entspricht. Deswegen benutzt er die sonstige Farbe, die als Workaround auf silver gestellt wurde.  
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.winddirection);
            }

            //relative Luftfeuchtigkeit
            if (typeof station.properties.RH == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.RH.toFixed(0),
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                marker.addTo(overlays.humidity);
            }
        }

        // Setzt map view auf alle Stationen
        map.fitBounds(overlays.stations.getBounds());
    });

        