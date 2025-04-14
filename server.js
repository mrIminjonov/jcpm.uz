const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware sozlamalari
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB ulanishi
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/registration_db')
  .then(() => console.log('MongoDB ga muvaffaqiyatli ulanildi'))
  .catch(err => console.error('MongoDB ulanishida xato:', err));

// User modeli
const User = mongoose.model('User', {
  givenName: String,
  familyName: String,
  affiliation: String,
  country: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  privacyAgreement: Boolean,
  newsletter: Boolean,
});

// Auth holatini tekshirish
app.get('/api/check-auth', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false });
    }

    // Token ni tekshirish (oddiy misol, aslida JWT verify qilish kerak)
    const user = await User.findOne({ _id: token }); // Bu misol, aslida token decode qilinadi
    
    if (!user) {
      return res.status(401).json({ success: false });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Chiqish endpointi
app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

// Registratsiya endpointi
app.post('/api/register', async (req, res) => {
  try {
    const { givenName, familyName, affiliation, country, email, username, password, privacyAgreement, newsletter } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      givenName,
      familyName,
      affiliation,
      country,
      email,
      username,
      password: hashedPassword,
      privacyAgreement,
      newsletter,
    });

    await user.save();
    res.status(201).json({ 
      success: true, 
      message: "Foydalanuvchi ro'yxatdan o'tdi!",
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message,
      errorDetails: err 
    });
  }
});

// Login endpointi
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email yoki username noto\'g\'ri' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Parol noto\'g\'ri' 
      });
    }

    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        givenName: user.givenName,
        familyName: user.familyName
      }
    });

  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      errorDetails: err 
    });
  }
});

// Static fayllarni public papkadan xizmatga qo‘shish
app.use(express.static(path.join(__dirname, 'public')));

// SPA router uchun barcha yo‘llarni index.html ga yo‘naltirish
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port sozlamasi
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
  console.log('Kirish uchun: http://localhost:' + PORT);
});
