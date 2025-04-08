const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/auth-app', { useNewUrlParser: true, useUnifiedTopology: true });

// Создание схемы пользователя
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', UserSchema);

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();
    res.status(201).send('Пользователь зарегистрирован');
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Неверный логин или пароль');
    }
});

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
