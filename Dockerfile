# Використовуємо офіційний образ Node.js (версія 18)
FROM node:18-alpine

# Створюємо робочу директорію всередині контейнера
WORKDIR /app

# Копіюємо package.json та встановлюємо залежності
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Копіюємо весь інший код (і backend, і frontend)
COPY . .

# Відкриваємо порт 3000 (той, що в тебе в налаштуваннях)
EXPOSE 3000

# Команда для запуску сервера
CMD ["node", "backend/server.js"]