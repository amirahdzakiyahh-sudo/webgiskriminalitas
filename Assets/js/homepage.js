// Assets/js/homepage.js

function openFullMap() {
    // Redirect ke halaman mapping lengkap
    window.location.href = 'mapping.html';
}

// Buat peta preview
var map = L.map('preview-map').setView([-3.45, 104.23], 11);

// Basemap Leaflet
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Layer polygon
var layerTinggi, layerSedang, layerRendah;

// Popup polygon
function onEachFeature(feature, layer){
    layer.on({
        mouseover: function(e){ e.target.setStyle({ weight:5, color:'#000', fillOpacity:1 }); },
        mouseout: function(e){ e.target.setStyle({ weight:2, color:'black', fillOpacity:0.85 }); }
    });

    layer.bindPopup(`
        <div style="width:320px;font-size:15px;line-height:28px;">
            <div style="background:#8b0000;color:white;padding:12px;border-radius:10px;text-align:center;font-size:24px;font-weight:bold;margin-bottom:15px;">
                ${feature.properties.Kecamatan}
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <tr><td><b>Anirat</b></td><td>: ${feature.properties.Anirat}</td></tr>
                <tr><td><b>Curat</b></td><td>: ${feature.properties.Curat}</td></tr>
                <tr><td><b>Curas</b></td><td>: ${feature.properties.Curas}</td></tr>
                <tr><td><b>Penggelapan</b></td><td>: ${feature.properties.Penggelapan}</td></tr>
                <tr><td><b>Pengroyokan</b></td><td>: ${feature.properties.Pengroyokan}</td></tr>
                <tr><td><b>Curi Biasa</b></td><td>: ${feature.properties["Curi Biasa"]}</td></tr>
            </table>
            <hr>
            <div style="text-align:center;font-size:20px;font-weight:bold;color:#8b0000;">
                Total Kasus : ${feature.properties.Jumlah}
            </div>
        </div>
    `);
}

// Load GeoJSON polygon
fetch('../Data/locprabu.geojson')
.then(res => res.ok ? res.json() : Promise.reject('GeoJSON locprabu.geojson not found'))
.then(data => {
    layerTinggi = L.geoJSON(data, {
        filter: f => f.properties.Jumlah > 200,
        style: { color:'black', weight:2, fillColor:'red', fillOpacity:0.85 },
        onEachFeature: onEachFeature
    }).addTo(map);

    layerSedang = L.geoJSON(data, {
        filter: f => f.properties.Jumlah > 100 && f.properties.Jumlah <= 200,
        style: { color:'black', weight:2, fillColor:'yellow', fillOpacity:0.85 },
        onEachFeature: onEachFeature
    }).addTo(map);

    layerRendah = L.geoJSON(data, {
        filter: f => f.properties.Jumlah <= 100,
        style: { color:'black', weight:2, fillColor:'green', fillOpacity:0.85 },
        onEachFeature: onEachFeature
    }).addTo(map);
})
.catch(err => console.error("GeoJSON Polygon Error:", err));

// Load titik Polsek
fetch('../Data/locpolsek.geojson')
.then(res => res.ok ? res.json() : Promise.reject('GeoJSON locpolsek.geojson not found'))
.then(dataTitik => {
    L.geoJSON(dataTitik, {
        pointToLayer: function(feature, latlng){
            var iconPolsek = L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
                iconSize: [40,40],
                iconAnchor: [20,40]
            });
            return L.marker(latlng, { icon: iconPolsek });
        },
        onEachFeature: function(feature, layer){
            var coords = feature.geometry.coordinates;
            var longitude = coords[0];
            var latitude = coords[1];
            var gambarPolsek = 'https://cdn-icons-png.flaticon.com/512/484/484167.png';

            if(feature.properties["Lokasi Polsek"]=="Polsek Prabumulih Timur"){ gambarPolsek="../Assets/img/Polsektimur.jpg"; }
            else if(feature.properties["Lokasi Polsek"]=="Polsek Cambai"){ gambarPolsek="../Assets/img/Polsekcambai.jpg"; }
            else if(feature.properties["Lokasi Polsek"]=="Polsek Prabumulih Barat"){ gambarPolsek="../Assets/img/PolsekBarat.jpg"; }
            else if(feature.properties["Lokasi Polsek"]=="Polsek Rambang Kapak Tengah"){ gambarPolsek="../Assets/img/PolsekRKT.jpeg"; }

            layer.bindPopup(`
                <div style="width:280px;text-align:center;font-size:15px;">
                    <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank">
                        <img src="${gambarPolsek}" class="gambar-polsek">
                    </a>
                    <div style="font-size:22px;font-weight:bold;color:#0b3d91;margin-bottom:12px;">
                        ${feature.properties["Lokasi Polsek"]}
                    </div>
                    <hr>
                    <div style="text-align:left;line-height:28px;">
                        <b>Latitude</b> : ${latitude.toFixed(5)} <br>
                        <b>Longitude</b> : ${longitude.toFixed(5)}
                    </div>
                </div>
            `);
        }
    }).addTo(map);
})
.catch(err => console.error("GeoJSON Titik Error:", err));

// Legenda
var legenda = L.control({position:'bottomright'});
legenda.onAdd = function(){
    var div = L.DomUtil.create('div','legend');

    // Styling untuk membuat rapih
    div.style.background = "white";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.fontSize = "14px";
    div.style.textAlign = "left";  // rata kiri semua
    div.style.lineHeight = "1.5";  // jarak antar baris
    div.style.marginBottom = "5px";

    // Konten legendanya
    div.innerHTML =
        '<h3 style="text-align:center; margin:0 0 10px 0;">Legenda</h3>'+
        '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;"><span style="display:inline-block;width:18px;height:18px;background:red;border:1px solid black;"></span>Kriminalitas Tinggi</div>'+
        '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;"><span style="display:inline-block;width:18px;height:18px;background:yellow;border:1px solid black;"></span>Kriminalitas Sedang</div>'+
        '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"><span style="display:inline-block;width:18px;height:18px;background:green;border:1px solid black;"></span>Kriminalitas Rendah</div>'+
        '<div style="margin-bottom:6px;"><img src="https://cdn-icons-png.flaticon.com/512/484/484167.png" width="18" style="vertical-align:middle;"> Lokasi Polsek</div>'+
        '<hr style="margin:6px 0;">'+
        '<div style="display:flex; flex-direction:column; gap:4px;">'+
        '<button onclick="toggleLayer(layerTinggi)" style="background:red;color:white; width:100%; border:none; border-radius:4px; padding:4px 0;">ON / OFF Tinggi</button>'+
        '<button onclick="toggleLayer(layerSedang)" style="background:gold; width:100%; border:none; border-radius:4px; padding:4px 0;">ON / OFF Sedang</button>'+
        '<button onclick="toggleLayer(layerRendah)" style="background:green;color:white; width:100%; border:none; border-radius:4px; padding:4px 0;">ON / OFF Rendah</button>'+
        '</div>';

    return div;
};
legenda.addTo(map);
function toggleLayer(layer){ 
    if(map.hasLayer(layer)){ map.removeLayer(layer); } 
    else{ map.addLayer(layer); }
}