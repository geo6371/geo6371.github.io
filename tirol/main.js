/* global L */
// Bike Trail Tirol Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    tracks: L.featureGroup(),
    wikipedia: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.grau
    ]
})

//Wikipedia-Artikel zeichnen
let articleDrawn = {};
const drawWikipedia = (bounds) => {
    //console.log(bounds);
    let url = `https://secure.geonames.org/wikipediaBoundingBoxJSON?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}&username=geo6371&lang=de&maxRows=30`;
    //console.log(url);

    let icons = {
        adm1st: "wikipedia_administration.png",
        adm2nd: "wikipedia_administration.png",
        adm3rd: "wikipedia_administration.png",
        airport: "wikipedia_helicopter.png",
        city: "wikipedia_smallcity.png",
        glacier: "wikipedia_glacier-2.png",
        landmark: "wikipedia_landmark.png",
        railwaystation: "wikipedia_train.png",
        river: "wikipedia_river-2.png",
        mountain: "wikipedia_mountains.png",
        waterbody: "wikipedia_lake.png",
        default: "wikipedia_information.png",
    };

    fetch(url).then(
        response => response.json()
    ).then(jsonData => {
        //console.log(jsonData)

        //Artikel Marker erzeugen
        for (let article of jsonData.geonames) {
            //hab ich Artikel schon gezeichnet?
            if (articleDrawn[article.wikipediaUrl]) {
                // Ja, nicht noch einmal
                //console.log("schon gesehen", article.wikipediaUrl);
                continue;
            } else {
                articleDrawn[article.wikipediaUrl] = true;
            }
            // welches icon soll verwendet werden?
            if (icons[article.feature]) {
                //ein bekanntes
            } else {
                article.feature = "default";
            }

            let mrk = L.marker([article.lat, article.lng], {
                icon: L.icon({
                    iconUrl: `icons/${icons[article.feature]}`,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
            mrk.addTo(overlays.wikipedia);

            //Bild definieren
            let img = "";
            if (article.thumbnailImg) {
                img = `<img src="${article.thumbnailImg}" alt="thumbnail">`;
            }

            //PopUp definieren
            mrk.bindPopup(`
                <small>${article.feature}</small>
                <h3>${article.title} (${article.elevation}m)</h3>
                ${img}
                <p>${article.summary}</p>
                <a target="Wikipedia" href="https://${article.wikipediaUrl}">Wikipedia-Artikel</a>
            `);
        }
    });
};

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "GPX-Tracks": overlays.tracks,
    "Wikipedia-Artikel": overlays.wikipedia
}).addTo(map);

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);
overlays.wikipedia.addTo(map);

const elevationControl = L.control.elevation({
    elevationDiv: "#profile",
    followMarker: false,
    theme: 'lime-theme',
}).addTo(map);


const drawTrack = (nr) => {
    elevationControl.clear();
    overlays.tracks.clearLayers();
    //console.log('Track: ', nr);
    let gpxTrack = new L.GPX(`tracks/${nr}.gpx`, {
        async: true,
        marker_options: {
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: `icons/finish.png`,
            shadowUrl: null,
        },
        polyline_options: {
            color: 'black',
            dashArray: [2, 5],
        },
    }).addTo(overlays.tracks);
    gpxTrack.on("loaded", () => {
        //console.log('loaded gpx');
        map.fitBounds(gpxTrack.getBounds());
        //PopUp mit Name, max_height, min_height, total_dist
        gpxTrack.bindPopup(`
        <h3>${gpxTrack.get_name()}</h3>
            <ul>
            <li>Streckenlänge: ${gpxTrack.get_distance().toFixed(0)} m</li>  
            <li>maximale Höhe: ${gpxTrack.get_elevation_max().toFixed(0)} m</li>
            <li>minimale Höhe: ${gpxTrack.get_elevation_min().toFixed(0)} m</li>
            </ul>
            `);
    });
    elevationControl.load(`tracks/${nr}.gpx`);
};

const selectedTrack = 25;
drawTrack(selectedTrack);

const updateTexts = (nr) => {
    //console.log(nr);
    for (let etappe of BIKETIROL) {
        //console.log(etappe);
        //ist es die aktuelle Etappe?
        if (etappe.nr == nr) {
            etappe.homepage = `<a href="${etappe.weblink}">Homepage</a>`
            //console.log("unsere Etappe", etappe);
            for (let key in etappe) {
                //console.log("key:", key, "value:", etappe[key]);
                //gibt es ein Element in HTML mit der id von "key"?
                if (document.querySelector(`#text-${key}`)) {
                    //console.log("YAY!", key, etappe[key]);
                    document.querySelector(`#text-${key}`).innerHTML = etappe[key];
                }
            }
        }
        
    }
};

//console.log('biketirol json: ', BIKETIROL);
let pulldown = document.querySelector("#pulldown");
//console.log('Pulldown: ', pulldown);
for (let track of BIKETIROL) {
    if (selectedTrack == track.nr) {
        selected = 'selected';
    } else {
        selected = ' ';
    }
    pulldown.innerHTML += `<option ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>`;
}
//Metadaten der Etappe updaten
updateTexts(pulldown.value);


//Eventshandler fuer Anderungen des Dropdowns
pulldown.onchange = () => {
    // console.log('changed!', pulldown.value)
    drawTrack(pulldown.value);

    //Metadaten der Etappe updaten
    updateTexts(pulldown.value);
};


map.on("zoomend moveend", () => {
    //Wikipedia Artikel zeichnen
    drawWikipedia(map.getBounds());
})