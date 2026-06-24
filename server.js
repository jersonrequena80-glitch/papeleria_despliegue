require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'papeleria_db'
});

function inicializarBaseDeDatos() {
  db.connect((err) => {
    if (err) {
      console.error('Error crítico al conectar a MySQL:', err.message);
      return;
    }

    console.log('¡Conectado exitosamente a la base de datos MySQL!');

    db.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        icono VARCHAR(100) NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error al crear la tabla productos:', err.message);
        return;
      }

      db.query('SELECT COUNT(*) AS total FROM productos', (err, resultados) => {
        if (err) {
          console.error('Error al verificar productos:', err.message);
          return;
        }

        if (resultados[0].total === 0) {
          const productosIniciales = [
            ['Cuaderno 100 hojas', 12000, 'fa-book'],
            ['Lápiz #2', 2500, 'fa-pencil-alt'],
            ['Borrador', 1800, 'fa-eraser'],
            ['Marcadores', 15000, 'fa-marker'],
            ['Carpeta', 8000, 'fa-folder']
          ];

          db.query(
            'INSERT INTO productos (nombre, precio, icono) VALUES ?',
            [productosIniciales],
            (err) => {
              if (err) {
                console.error('Error al insertar productos iniciales:', err.message);
              } else {
                console.log('Productos iniciales insertados correctamente.');
              }
            }
          );
        } else {
          console.log(`Se encontraron ${resultados[0].total} productos en la base de datos.`);
        }
      });
    });
  });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/productos', (req, res) => {
  const query = 'SELECT id, nombre, precio, icono FROM productos ORDER BY id ASC';

  db.query(query, (err, resultados) => {
    if (err) {
      console.error('Error al realizar la consulta SQL:', err);
      return res.status(500).json({ error: 'Error interno al consultar el inventario' });
    }

    res.json(resultados);
  });
});

app.post('/api/productos', (req, res) => {
  const { nombre, precio, icono } = req.body;

  if (!nombre || !precio || !icono) {
    return res.status(400).json({ error: 'Faltan datos: nombre, precio e icono son obligatorios' });
  }

  const query = 'INSERT INTO productos (nombre, precio, icono) VALUES (?, ?, ?)';

  db.query(query, [nombre, precio, icono], (err, resultado) => {
    if (err) {
      console.error('Error al insertar producto:', err);
      return res.status(500).json({ error: 'No se pudo crear el producto' });
    }

    res.status(201).json({ id: resultado.insertId, nombre, precio, icono });
  });
});

app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, icono } = req.body;

  if (!nombre || !precio || !icono) {
    return res.status(400).json({ error: 'Faltan datos: nombre, precio e icono son obligatorios' });
  }

  const query = 'UPDATE productos SET nombre = ?, precio = ?, icono = ? WHERE id = ?';

  db.query(query, [nombre, precio, icono, id], (err, resultado) => {
    if (err) {
      console.error('Error al actualizar producto:', err);
      return res.status(500).json({ error: 'No se pudo actualizar el producto' });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id, nombre, precio, icono });
  });
});

app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = ?';

  db.query(query, [id], (err, resultado) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ error: 'No se pudo eliminar el producto' });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  });
});

inicializarBaseDeDatos();

app.listen(PORT, () => {
  console.log(`Servidor del Backend corriendo en: http://localhost:${PORT}`);
});
