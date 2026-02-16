const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_ROOT = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOAD_ROOT);

// 🌐 SUBDOMENNI TEKSHIRISH VA YO'NALTIRISH
app.use((req, res, next) => {
    const host = req.headers.host; 
    const parts = host.split('.');

    // Agar subdomain bo'lsa (masalan: portfolio.runcloud.uz)
    if (parts.length > 2 && parts[0] !== 'www') {
        const subdomain = parts[0];
        const sitePath = path.join(UPLOAD_ROOT, subdomain);

        if (fs.existsSync(sitePath)) {
            // Index.html faylini qidirish
            return express.static(sitePath)(req, res, next);
        }
    }
    next();
});

// Asosiy Deployer sahifasi (public ichidagi index.html)
app.use(express.static('public'));

// 📁 MULTER SOZLAMALARI
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const deployId = req.headers['x-deploy-id'];
        const relativePath = path.dirname(file.originalname);
        const targetDir = path.join(UPLOAD_ROOT, deployId, relativePath);
        fs.ensureDirSync(targetDir);
        cb(null, targetDir);
    },
    filename: (req, file, cb) => cb(null, path.basename(file.originalname))
});

const upload = multer({ storage });

// API: Yuklash va Subdomen havolasini qaytarish
app.post('/deploy', upload.array('files'), (req, res) => {
    const deployId = req.headers['x-deploy-id'];
    // Havolani subdomen ko'rinishida yuboramiz
    res.json({ success: true, url: `https://${deployId}.runcloud.uz` });
});

app.listen(PORT, () => console.log(`🚀 RunCloud Engine: http://localhost:${PORT}`));