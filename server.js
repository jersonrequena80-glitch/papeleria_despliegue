const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1193039777Jerson/',
  database: 'papeleria_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error crítico al conectar a MySQL:', err.message);
    return;
  }
  console.log('¡Conectado exitosamente a la base de datos MySQL!');
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM productos';

  db.query(query, (err, resultados) => {
    if (err) {
      console.error('Error al realizar la consulta SQL:', err);
      return res.status(500).json({ error: 'Error interno al consultar el inventario' });
    }
    res.json(resultados);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor del Backend corriendo en: http://localhost:${PORT}`);
});
