// OGD-Wien Beispiel

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
    busLines: L.featureGroup(),
    busStops: L.markerClusterGroup(),
    pedAreas: L.featureGroup(),
    touristPoints: L.featureGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true,
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        baselayers.grau
    ]
});

// Minimap einbauen
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
        toggleDisplay: true,
        minimized: false
    }
).addTo(map);

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas,
    "Sehenswürdigkeiten": overlays.touristPoints
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);
overlays.touristPoints.addTo(map);

let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station: ${feature.properties.STAT_NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/busstop.png',
                    iconSize: [35, 35]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>, <a href= "https://mapicons.mapsmarker.com">Maps Icons Collection</a>'
    }).addTo(overlays.busStops);
}

let drawBusLines = (geojsonData) => {
    L.geoJson(geojsonData, {
        style: (feature) => {
            let col = "green";
            col = COLORS.buslines[feature.properties.LINE_NAME]
            return {
                color: col
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von ${feature.properties.FROM_NAME}<br>
            nach ${feature.properties.TO_NAME}`)
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>'
    }).addTo(overlays.busLines);
}


let drawPedAreas = (geojsonData) => {
    console.log('Zone: ', geojsonData);
    L.geoJson(geojsonData, {
        style: (feature) => {
            return {
                stroke: true,
                color: "silver",
                fillColor: "yellow",
                fillOpacity: 0.3
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Fußgängerzone ${feature.properties.ADRESSE}</strong>
            <hr>
            ${feature.properties.ZEITRAUM || "?"} <br>
            ${feature.properties.AUSN_TEXT || "?"}
            `);
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>'
    }).addTo(overlays.pedAreas);
}

let drawTouristPoints = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.NAME}</strong>
            <hr>
            Adresse: ${feature.properties.ADRESSE} <br>
            <a href="${feature.properties.WEITERE_INF}">Weitere Informationen</a>
            `);
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/sehenswuerdigogd.png',
                    iconSize: [27, 27]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>'
    }).addTo(overlays.touristPoints);
}

for (let config of OGDWIEN) {
    console.log("Config: ", config.data);
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            console.log("Data: ", geojsonData);
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geojsonData);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLines(geojsonData);
            } else if (config.title == "Fußgängerzonen") {
                drawPedAreas(geojsonData);
            } else if (config.title == "Sehenswürdigkeiten") {
                drawTouristPoints(geojsonData);
            }
        })
}

// Hash - Koordinaten in URL
var hash = new L.Hash(map);

//Reachability-Plugin
// Function to style the reachability polygons
function styleIntervals(feature) {
    let color = "";
    let range = feature.properties.Range;
    if (feature.properties.Measure === "time") {
        color = (COLORS.minutes[range]);
    } else if (feature.properties.Measure === "distance") {
        color = (COLORS.kilometers[range]);
    } else {
        color = "black"
    }
    return {
        color: color,
        opacity: 0.5,
        fillOpacity: 0.2
    };
};

// Initialise the reachability plugin
L.control.reachability({
    apiKey: '5b3ce3597851110001cf62484633093d081b45a49bed3aed34fbb10b',
    drawButtonContent: '',
    drawButtonStyleClass: 'fa fa-pencil-alt fa-2x',
    deleteButtonContent: '',
    deleteButtonStyleClass: 'fa fa-trash fa-2x',
    distanceButtonContent: '',
    distanceButtonStyleClass: 'fa fa-road fa-2x',
    timeButtonContent: '',
    timeButtonStyleClass: 'fa fa-clock fa-2x',
    travelModeButton1Content: '',
    travelModeButton1StyleClass: 'fa fa-car fa-2x',
    travelModeButton2Content: '',
    travelModeButton2StyleClass: 'fa fa-bicycle fa-2x',
    travelModeButton3Content: '',
    travelModeButton3StyleClass: 'fa fa-male fa-2x',
    travelModeButton4Content: '',
    travelModeButton4StyleClass: 'fa fa-wheelchair fa-2x',
    styleFn: styleIntervals
}).addTo(map);