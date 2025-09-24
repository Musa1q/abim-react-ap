const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/courses/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG ve WEBP formatları desteklenir.'));
    }
  }
});

// Static dosya servisi
app.use('/uploads', express.static('uploads'));

// Veritabanı bağlantısı
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP'te genellikle boş
  database: 'abim_react_db',
  port: 3306,
  charset: 'utf8mb4'
};

// Bağlantı havuzu
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Bağlantı testi
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Veritabanı bağlantısı başarılı!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
    return false;
  }
};

// API Routes

// Resim yükleme endpoint'i
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resim dosyası bulunamadı' 
      });
    }

    const imageUrl = `http://localhost:${PORT}/uploads/courses/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Resim yüklenirken bir hata oluştu' 
    });
  }
});

// Giriş endpoint'i
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Veritabanından kullanıcıyı bul
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'E-posta veya şifre hatalı' 
      });
    }

    const user = rows[0];

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'E-posta veya şifre hatalı' 
      });
    }

    // Son giriş tarihini güncelle
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        uid: user.id.toString(),
        displayName: user.name
      }
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
});

// Kurslar endpoint'i
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM courses WHERE is_active = 1 AND egitim_baslangic <= CURDATE() AND egitim_bitis >= CURDATE() ORDER BY created_at DESC');
    
    // JSON alanlarını parse et
    const courses = rows.map(course => ({
      ...course,
      dersGunleri: JSON.parse(course.ders_gunleri),
      mufredat: course.mufredat ? JSON.parse(course.mufredat) : [],
      // Time formatını düzelt (HH:MM:SS -> HH:MM)
      dersSaati: course.ders_saati ? course.ders_saati.substring(0, 5) : '',
      // Frontend ile uyumlu hale getir
      mainTitle: course.main_title,
      subtitle: course.subtitle,
      imageUrl: course.image_url,
      content: {
        egitimSuresi: [
          { "Başlangıç": course.egitim_baslangic },
          { "Bitiş": course.egitim_bitis }
        ],
        mufredat: course.mufredat ? JSON.parse(course.mufredat) : []
      }
    }));

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Kurslar hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Tek kurs endpoint'i
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM courses WHERE id = ? AND is_active = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Kurs bulunamadı" });
    }

    const course = {
      ...rows[0],
      dersGunleri: JSON.parse(rows[0].ders_gunleri),
      mufredat: rows[0].mufredat ? JSON.parse(rows[0].mufredat) : [],
      // Time formatını düzelt (HH:MM:SS -> HH:MM)
      dersSaati: rows[0].ders_saati ? rows[0].ders_saati.substring(0, 5) : '',
      // Frontend ile uyumlu hale getir
      mainTitle: rows[0].main_title,
      subtitle: rows[0].subtitle,
      imageUrl: rows[0].image_url,
      content: {
        egitimSuresi: [
          { "Başlangıç": rows[0].egitim_baslangic },
          { "Bitiş": rows[0].egitim_bitis }
        ],
        mufredat: rows[0].mufredat ? JSON.parse(rows[0].mufredat) : []
      }
    };

    res.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Kurs getirme hatası:', error);
    res.status(500).json({ success: false, message: "Kurs yüklenirken bir hata oluştu" });
  }
});

// Kurs ekleme endpoint'i
app.post('/api/courses', async (req, res) => {
  try {
    const { mainTitle, subtitle, imageUrl, dersGunleri, dersSaati, content } = req.body;
    
    // Veritabanına kaydet
    const [result] = await pool.execute(
      `INSERT INTO courses (main_title, subtitle, image_url, ders_gunleri, ders_saati, egitim_baslangic, egitim_bitis, mufredat) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mainTitle,
        subtitle,
        imageUrl,
        JSON.stringify(dersGunleri),
        dersSaati + ':00', // HH:MM -> HH:MM:SS
        content.egitimSuresi[0]["Başlangıç"],
        content.egitimSuresi[1]["Bitiş"],
        JSON.stringify(content.mufredat)
      ]
    );

    res.json({
      success: true,
      course: { id: result.insertId }
    });

  } catch (error) {
    console.error('Kurs ekleme hatası:', error);
    res.status(500).json({ success: false, message: "Kurs eklenirken bir hata oluştu" });
  }
});

       // Kurs güncelleme endpoint'i
       app.put('/api/courses/:id', async (req, res) => {
         try {
           const { id } = req.params;
           const { mainTitle, subtitle, imageUrl, dersGunleri, dersSaati, content, isActive } = req.body;
           
           // Eğer sadece isActive güncelleniyorsa
           if (isActive !== undefined && mainTitle === undefined && subtitle === undefined && imageUrl === undefined && dersGunleri === undefined && dersSaati === undefined && content === undefined) {
             await pool.execute(
               'UPDATE courses SET is_active = ?, updated_at = NOW() WHERE id = ?',
               [isActive, id]
             );
           } else {
             // Normal güncelleme - mevcut verileri koru
             const [existing] = await pool.execute('SELECT * FROM courses WHERE id = ?', [id]);
             const current = existing[0];
             
             await pool.execute(
               `UPDATE courses SET 
                main_title = ?, subtitle = ?, image_url = ?, ders_gunleri = ?, ders_saati = ?, 
                egitim_baslangic = ?, egitim_bitis = ?, mufredat = ?, is_active = ?, updated_at = NOW()
                WHERE id = ?`,
               [
                 mainTitle || current.main_title,
                 subtitle || current.subtitle,
                 imageUrl || current.image_url,
                 dersGunleri ? JSON.stringify(dersGunleri) : current.ders_gunleri,
                 dersSaati ? dersSaati + ':00' : current.ders_saati,
                 content?.egitimSuresi?.[0]?.["Başlangıç"] || current.egitim_baslangic,
                 content?.egitimSuresi?.[1]?.["Bitiş"] || current.egitim_bitis,
                 content?.mufredat ? JSON.stringify(content.mufredat) : current.mufredat,
                 isActive !== undefined ? isActive : current.is_active,
                 id
               ]
             );
           }

    res.json({
      success: true,
      message: "Kurs başarıyla güncellendi"
    });

  } catch (error) {
    console.error('Kurs güncelleme hatası:', error);
    res.status(500).json({ success: false, message: "Kurs güncellenirken bir hata oluştu" });
  }
});

// Kurs silme endpoint'i
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE courses SET is_active = 0 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: "Kurs başarıyla silindi"
    });

  } catch (error) {
    console.error('Kurs silme hatası:', error);
    res.status(500).json({ success: false, message: "Kurs silinirken bir hata oluştu" });
  }
});

// Blog yazıları endpoint'i
app.get('/api/blogs', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Blog hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Tüm kurslar endpoint'i (admin için)
app.get('/api/admin/courses', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM courses WHERE is_active = 1 ORDER BY created_at DESC');
    
    // JSON alanlarını parse et
    const courses = rows.map(course => ({
      ...course,
      dersGunleri: JSON.parse(course.ders_gunleri),
      mufredat: course.mufredat ? JSON.parse(course.mufredat) : [],
      // Time formatını düzelt (HH:MM:SS -> HH:MM)
      dersSaati: course.ders_saati ? course.ders_saati.substring(0, 5) : '',
      // Frontend ile uyumlu hale getir
      mainTitle: course.main_title,
      subtitle: course.subtitle,
      imageUrl: course.image_url,
      content: {
        egitimSuresi: [
          { "Başlangıç": course.egitim_baslangic },
          { "Bitiş": course.egitim_bitis }
        ],
        mufredat: course.mufredat ? JSON.parse(course.mufredat) : []
      }
    }));

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Admin kurslar hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Kurs başvuru endpoint'i
app.post('/api/course-applications', async (req, res) => {
  try {
    const { courseId, name, email, phone, notes } = req.body;
    
    // Aynı kurs için aynı email veya telefon ile kayıt var mı kontrol et
    const [existingEmail] = await pool.execute(
      'SELECT id FROM course_applications WHERE course_id = ? AND email = ?',
      [courseId, email]
    );
    
    const [existingPhone] = await pool.execute(
      'SELECT id FROM course_applications WHERE course_id = ? AND phone = ?',
      [courseId, phone]
    );
    
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kurs için aynı email adresi ile zaten başvuru yapılmış.'
      });
    }
    
    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kurs için aynı telefon numarası ile zaten başvuru yapılmış.'
      });
    }
    
    // Başvuruyu kaydet
    const [result] = await pool.execute(
      'INSERT INTO course_applications (course_id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?)',
      [courseId, name, email, phone, notes || '']
    );
    
    res.json({
      success: true,
      message: 'Başvurunuz başarıyla alındı!',
      applicationId: result.insertId
    });
    
  } catch (error) {
    console.error('Kurs başvuru hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Başvuru kaydedilirken bir hata oluştu' 
    });
  }
});

// Banner'lar endpoint'i
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM banners ORDER BY `order` ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Banner hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Admin - Tüm kurslar (aktif/pasif fark etmez)
app.get('/api/admin/courses', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, main_title, is_active, created_at, updated_at FROM courses ORDER BY created_at DESC');
    res.json({ success: true, courses: rows });
  } catch (error) {
    console.error('Admin kurslar hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Sunucuyu başlat
app.listen(PORT, async () => {
  console.log(`🚀 Backend server çalışıyor: http://localhost:${PORT}`);
  await testConnection();
});
