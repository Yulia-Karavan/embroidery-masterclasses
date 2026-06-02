const mysql = require('mysql2'); // беремо бібліотеку, яка в тебе вже є

// Підключаємося до головного сервера AWS
const db = mysql.createConnection({
    host: "database-1.cxuuegkooq5c.eu-north-1.rds.amazonaws.com", // Встав сюди скопійований Endpoint з RDS
    user: "admin",               // Твій логін від RDS
    password: "Fz4WnztwURzeSpg"  // Твій пароль від RDS
});

db.connect((err) => {
    if (err) {
        console.error("Помилка підключення:", err);
        return;
    }
    console.log("Успішно підключилися до AWS RDS!");

    // 1. Створюємо твою "кавову" базу
    db.query("CREATE DATABASE IF NOT EXISTS coffee_shop", (err) => {
        if (err) throw err;
        console.log("База coffee_shop готова.");

        // 2. Заходимо в неї
        db.query("USE coffee_shop", (err) => {
            if (err) throw err;

            // 3. Створюємо таблицю з майстер-класами
            const createTable = `
                CREATE TABLE IF NOT EXISTS master_classes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    teacher VARCHAR(255) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    image_url VARCHAR(255),
                    teacher_photo VARCHAR(255)
                )
            `;
            db.query(createTable, (err) => {
                if (err) throw err;
                console.log("Таблиця master_classes створена.");

                // 4. Закидаємо твої три курси з фотографій
                const insertData = `
                    INSERT INTO master_classes (title, teacher, price, image_url, teacher_photo) VALUES
                    ('Однобічна штапівка, протяганка', 'Антонюк Маргарита', 110.00, '/img/master-class/01.jpg', '/img/master-class/p_01.jpg'),
                    ('Мережка ляхівка', 'Яценюк Валерія', 300.00, '/img/master-class/02.jpg', '/img/master-class/p_02.jpg'),
                    ('Візерунок з Мурованокуриловецьк...', 'Кирилюк Сніжана', 150.00, '/img/master-class/03.jpg', '/img/master-class/p_03.jpg')
                `;
                db.query(insertData, (err) => {
                    if (err) console.log("Дані вже є, або помилка:", err.message);
                    else console.log("✅ Усі дані успішно завантажено в хмару!");
                    
                    process.exit(); // Вимикаємо скрипт
                });
            });
        });
    });
});