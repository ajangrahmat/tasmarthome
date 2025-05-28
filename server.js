const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Koneksi ke database SQLite3
const db = new sqlite3.Database('./tasmarthome.db', (err) => {
  if (err) {
    console.error('Error membuka database:', err.message);
  } else {
    console.log('Database tasmarthome.db terhubung');
  }
});

// Endpoint ambil data berdasarkan mac_address jika ada
app.get('/api/data', (req, res) => {
  const mac = req.query.mac;

  let sql = 'SELECT * FROM konsumsi_energi';
  const params = [];

  if (mac) {
    sql += ' WHERE mac_address = ?';
    params.push(mac);
  }

  sql += ' ORDER BY id DESC LIMIT 10';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error mengambil data:', err.message);
      res.status(500).send('Error mengambil data');
    } else {
      res.json(rows);
    }
  });
});

// Endpoint ambil list mac_address unik
app.get('/api/mac-list', (req, res) => {
  db.all('SELECT DISTINCT mac_address FROM konsumsi_energi', (err, rows) => {
    if (err) {
      console.error('Error mengambil daftar mac:', err.message);
      res.status(500).send('Error mengambil daftar mac');
    } else {
      res.json(rows);
    }
  });
});

// Endpoint reset data
app.get('/api/reset-data', (req, res) => {
  const sql = `
    DELETE FROM konsumsi_energi;
    DELETE FROM sqlite_sequence WHERE name = 'konsumsi_energi';
  `;

  db.exec(sql, (err) => {
    if (err) {
      console.error('Error reset data dan autoincrement:', err.message);
      return res.status(500).send('Error saat reset data');
    }
    res.redirect('/');
  });
});

// Serve static files di folder public
app.use(express.static('public'));

app.listen(port, '0.0.0.0', () => {
  console.log('Server berjalan di http://localhost:${port}');
});