// =========================
// MEMBUAT PETA
// =========================
var map = L.map('map').setView([-3.45, 104.23], 11);

// =========================
// BASEMAP
// =========================
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// =========================
// VARIABEL LAYER
// =========================
var layerTinggi, layerSedang, layerRendah;

// =========================
// FUNGSI CLOSE POPUP
// =========================
function closePopup(el){
    var popup = el.closest('.leaflet-popup');
    if(popup) {
        popup.style.display = 'none';
    }
}

// =========================
// FUNGSI POPUP POLYGON
// =========================
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: function(e) {
            e.target.setStyle({ weight: 5, color: '#000', fillOpacity: 1 });
        },
        mouseout: function(e) {
            e.target.setStyle({ weight: 2, color: 'black', fillOpacity: 0.85 });
        }
    });

    layer.bindPopup(`
    <div class="popup-wrapper">
        <div class="popup-header">
            ${feature.properties.Kecamatan}
            <span class="popup-close" onclick="closePopup(this)">×</span>
        </div>
        <div class="popup-body">
            <table>
                <tr><td>Anirat</td><td>: ${feature.properties.Anirat}</td></tr>
                <tr><td>Curat</td><td>: ${feature.properties.Curat}</td></tr>
                <tr><td>Curas</td><td>: ${feature.properties.Curas}</td></tr>
                <tr><td>Penggelapan</td><td>: ${feature.properties.Penggelapan}</td></tr>
                <tr><td>Pengroyokan</td><td>: ${feature.properties.Pengroyokan}</td></tr>
                <tr><td>Curi Biasa</td><td>: ${feature.properties["Curi Biasa"]}</td></tr>
            </table>
            <div class="popup-total">Total Kasus : ${feature.properties.Jumlah}</div>
        </div>
    </div>
`);
}

// =========================
// LOAD GEOJSON POLYGON
// =========================
fetch('../Data/locprabu.geojson')
.then(res => res.json())
.then(data => {
    layerTinggi = L.geoJSON(data, {
        filter: f => f.properties.Jumlah > 200,
        style: { color: 'black', weight: 2, fillColor: 'red', fillOpacity: 0.85 },
        onEachFeature: onEachFeature
    }).addTo(map);

    layerSedang = L.geoJSON(data, {
        filter: f => f.properties.Jumlah > 100 && f.properties.Jumlah <= 200,
        style: { color: 'black', weight: 2, fillColor: 'yellow', fillOpacity: 0.85 },
        onEachFeature: onEachFeature
    }).addTo(map);

    layerRendah = L.geoJSON(data, {
        filter: f => f.properties.Jumlah <= 100,
        style: { color: 'black', weight: 2, fillColor: 'green', fillOpacity: 0.85 },
        onEachFeature: onEachFeature
    }).addTo(map);
})
.catch(err => console.log("GeoJSON Polygon Error:", err));

// =========================
// LOAD TITIK POLSEK
// =========================
fetch('../Data/locpolsek.geojson')
.then(res => res.json())
.then(dataTitik => {
    L.geoJSON(dataTitik, {
        pointToLayer: function(feature, latlng) {
            var iconPolsek = L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            return L.marker(latlng, { icon: iconPolsek });
        },
        onEachFeature: function(feature, layer) {
            let coords = feature.geometry.coordinates;
            let lon = coords[0];
            let lat = coords[1];
            let gambar = "";
            switch(feature.properties["Lokasi Polsek"]){
                case "Polsek Prabumulih Timur": gambar = "../Assets/img/Polsektimur.jpg"; break;
                case "Polsek Cambai": gambar = "../Assets/img/Polsekcambai.jpg"; break;
                case "Polsek Prabumulih Barat": gambar = "../Assets/img/PolsekBarat.jpg"; break;
                case "Polsek Rambang Kapak Tengah": gambar = "../Assets/img/PolsekRKT.jpeg"; break;
                default: gambar = "https://cdn-icons-png.flaticon.com/512/484/484167.png";
            }

            // Popup marker dengan gambar klik ke Google Maps
            layer.bindPopup(`
                <div class="popup-wrapper">
                    <div class="popup-header" style="position:relative;">
                        ${feature.properties["Lokasi Polsek"]}
                        <span class="popup-close" onclick="closePopup(this)">×</span>
                    </div>
                    <div class="popup-body" style="text-align:center;font-size:15px;">
                        <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">
                            <img src="${gambar}" class="gambar-polsek">
                        </a>
                        <hr>
                        <div style="text-align:left;line-height:28px;">
                            <b>Latitude</b> : ${lat.toFixed(5)}<br>
                            <b>Longitude</b> : ${lon.toFixed(5)}
                        </div>
                    </div>
                </div>
            `);
        }
    }).addTo(map);
})
.catch(err => console.log("GeoJSON Titik Error:", err));

// =========================
// LEGENDA
// =========================
var legenda = L.control({ position: 'bottomright' });
legenda.onAdd = function() {
    var div = L.DomUtil.create('div','legend');
    div.innerHTML = `
        <h3>Legenda</h3>
        <div><span style="display:inline-block;width:25px;height:25px;background:red;border:1px solid black;margin-right:10px;"></span>Kriminalitas Tinggi</div>
        <div><span style="display:inline-block;width:25px;height:25px;background:yellow;border:1px solid black;margin-right:10px;"></span>Kriminalitas Sedang</div>
        <div><span style="display:inline-block;width:25px;height:25px;background:green;border:1px solid black;margin-right:10px;"></span>Kriminalitas Rendah</div>
        <div style="margin-top:12px;"><img src="https://cdn-icons-png.flaticon.com/512/484/484167.png" width="22"> Lokasi Polsek</div>
        <hr>
        <button onclick="toggleLayer(layerTinggi)" style="background:red;color:white;">ON / OFF Tinggi</button>
        <button onclick="toggleLayer(layerSedang)" style="background:gold;">ON / OFF Sedang</button>
        <button onclick="toggleLayer(layerRendah)" style="background:green;color:white;">ON / OFF Rendah</button>
    `;
    return div;
};
legenda.addTo(map);

// =========================
// TOGGLE LAYER
// =========================
function toggleLayer(layer){
    if(map.hasLayer(layer)){
        map.removeLayer(layer);
    } else {
        map.addLayer(layer);
    }
}