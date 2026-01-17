import express from "express";
import mysql from "mysql2";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Завантаження змінних оточення
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // щоб читати JSON у POST-запитах

// Роздаємо фронтенд (HTML, CSS, JS, картинки)
app.use(express.static(path.join(__dirname, "../frontend")));

// Підключення до MySQL 
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,   
  database: process.env.DB_NAME || "coffee_shop" 
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL");
});

/*
  ROUTES
*/

// Повернути всі майстер-класи
app.get("/api/master-classes", (req, res) => {
  db.query("SELECT * FROM master_classes ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Повернути конкретний майстер-клас (опціонально)
app.get("/api/master-classes/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM master_classes WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: "Not found" });
    res.json(results[0]);
  });
});

// Додати новий майстер-клас (POST) — очікує JSON у тілі
// {
//   "title": "Назва",
//   "teacher": "Ім'я викладача",
//   "price": 250.00,
//   "image_url": "/img/master-class/01.jpg",
//   "teacher_photo": "/img/master-class/p_01.jpg"
// }
app.post("/api/master-classes", (req, res) => {
  const { title, teacher, price, image_url, teacher_photo } = req.body;
  if (!title || !teacher || price == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `INSERT INTO master_classes (title, teacher, price, image_url, teacher_photo)
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [title, teacher, price, image_url || "", teacher_photo || ""], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, message: "Master class created" });
  });
});

// оновити майстер-клас
app.put("/api/master-classes/:id", (req, res) => {
  const id = req.params.id;
  const { title, teacher, price, image_url, teacher_photo } = req.body;
  const sql = `UPDATE master_classes SET title=?, teacher=?, price=?, image_url=?, teacher_photo=? WHERE id=?`;
  db.query(sql, [title, teacher, price, image_url, teacher_photo, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated" });
  });
});

// видалити майстер-клас
app.delete("/api/master-classes/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM master_classes WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

/*
  CART ROUTES (API для кошика)
*/

// Отримати всі товари з кошика
app.get("/api/cart", (req, res) => {
  const sql = `
    SELECT cart.id, cart.master_class_id, cart.quantity, cart.added_at,
           mc.title, mc.teacher, mc.price, mc.image_url, mc.teacher_photo
    FROM cart
    JOIN master_classes mc ON cart.master_class_id = mc.id
    ORDER BY cart.added_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Додати товар в кошик
app.post("/api/cart", (req, res) => {
  const { master_class_id, quantity = 1 } = req.body;
  
  if (!master_class_id) {
    return res.status(400).json({ error: "master_class_id is required" });
  }

  // Перевіряємо, чи товар вже є в кошику
  db.query("SELECT * FROM cart WHERE master_class_id = ?", [master_class_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      // Якщо товар вже є — збільшуємо кількість
      const newQuantity = results[0].quantity + quantity;
      db.query("UPDATE cart SET quantity = ? WHERE master_class_id = ?", [newQuantity, master_class_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cart updated", quantity: newQuantity });
      });
    } else {
      // Якщо товару немає — додаємо новий
      db.query("INSERT INTO cart (master_class_id, quantity) VALUES (?, ?)", [master_class_id, quantity], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: "Added to cart" });
      });
    }
  });
});

// Видалити товар з кошика
app.delete("/api/cart/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM cart WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Removed from cart" });
  });
});

// Очистити весь кошик
app.delete("/api/cart", (req, res) => {
  db.query("DELETE FROM cart", (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Cart cleared" });
  });
});

// Головна сторінка роздається з frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
