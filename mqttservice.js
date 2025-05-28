const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();

// Koneksi MQTT ke broker 192.168.1.15
const client = mqtt.connect('mqtt://192.168.1.15'); // Ganti dengan IP broker yang sesuai

// Koneksi ke SQLite3
const db = new sqlite3.Database('./tasmarthome.db', (err) => {
  if (err) {
    console.error('Error membuka database:', err.message);
  } else {
    console.log('Database tasmarthome.db terhubung');
  }
});

// Fungsi untuk menyimpan data ke SQLite
function saveDataToDB(data) {
  const { voltage, current, power, energy ,mac_address} = data;
  const currentDate = new Date();
  const tanggal = currentDate.toISOString().split('T')[0]; // Tanggal (YYYY-MM-DD)
  const waktu = currentDate.toISOString().split('T')[1].split('.')[0]; // Waktu (HH:MM:SS)

  const query = `
    INSERT INTO konsumsi_energi (tanggal, waktu, tegangan, arus, daya, kwh, mac_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Menyimpan data ke database
  db.run(query, [tanggal, waktu, voltage, current, power, energy, mac_address], function (err) {
    if (err) {
      console.error('Error menyimpan data ke database:', err.message);
    } else {
      console.log('Data berhasil disimpan dengan ID: ${this.lastID}');
    }
  });
}

// Terhubung ke broker MQTT dan subscribe ke topik
client.on('connect', () => {
  console.log('Terhubung ke broker MQTT');
  client.subscribe('tes/topic/sensor', (err) => {
    if (err) {
      console.error('Gagal subscribe ke topik', err);
    } else {
      console.log('Berhasil subscribe ke topik tes/topic/sensor');
    }
  });
});

// Menerima pesan dari broker MQTT
client.on('message', (topic, message) => {
  if (topic === 'tes/topic/sensor') {
    try {
      const data = JSON.parse(message.toString());
      saveDataToDB(data); // Simpan data ke database
    } catch (error) {
      console.error('Error memproses pesan MQTT:', error);
    }
  }
});

client.on('error', (err) => {
  console.log('MQTT Error:', err);
});