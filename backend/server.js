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

// Bağlantı testi ve tablo oluşturma
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Veritabanı bağlantısı başarılı!');
    
    // Activities tablosunu oluştur
    await createActivitiesTable();
    
    // Mevcut tabloları kontrol et
    try {
      const [tables] = await connection.execute("SHOW TABLES");
      console.log('📋 Mevcut tablolar:', tables.map(t => Object.values(t)[0]));
      
      // course_applications tablosu var mı kontrol et
      const hasCourseApplications = tables.some(t => Object.values(t)[0] === 'course_applications');
      console.log('📋 course_applications tablosu var mı?', hasCourseApplications);
      
      if (!hasCourseApplications) {
        console.log('🔨 course_applications tablosu oluşturuluyor...');
        await connection.execute(`
          CREATE TABLE course_applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            student_name VARCHAR(255) NOT NULL,
            student_email VARCHAR(255) NOT NULL,
            student_phone VARCHAR(20),
            message TEXT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
          )
        `);
        console.log('✅ course_applications tablosu oluşturuldu!');
      } else {
        console.log('✅ course_applications tablosu zaten mevcut!');
        
        // Mevcut tablonun yapısını kontrol et
        try {
          const [columns] = await connection.execute("DESCRIBE course_applications");
          console.log('📋 course_applications tablo yapısı:', columns.map(col => col.Field));
          
          // Eksik sütunları kontrol et ve ekle
          const columnNames = columns.map(col => col.Field);
          const requiredColumns = ['student_name', 'student_email', 'student_phone', 'message', 'status', 'updated_at'];
          
          for (const col of requiredColumns) {
            if (!columnNames.includes(col)) {
              console.log(`🔨 Eksik sütun ekleniyor: ${col}`);
              let alterQuery = '';
              switch (col) {
                case 'student_name':
                  alterQuery = 'ALTER TABLE course_applications ADD COLUMN student_name VARCHAR(255) NOT NULL';
                  break;
                case 'student_email':
                  alterQuery = 'ALTER TABLE course_applications ADD COLUMN student_email VARCHAR(255) NOT NULL';
                  break;
                case 'student_phone':
                  alterQuery = 'ALTER TABLE course_applications ADD COLUMN student_phone VARCHAR(20)';
                  break;
                case 'message':
                  alterQuery = 'ALTER TABLE course_applications ADD COLUMN message TEXT';
                  break;
                case 'status':
                  alterQuery = "ALTER TABLE course_applications ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'";
                  break;
                case 'updated_at':
                  alterQuery = 'ALTER TABLE course_applications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
                  break;
              }
              if (alterQuery) {
                await connection.execute(alterQuery);
                console.log(`✅ ${col} sütunu eklendi!`);
              }
            }
          }
        } catch (error) {
          console.error('❌ Tablo yapısı kontrol hatası:', error);
        }
      }
    } catch (error) {
      console.error('❌ Tablo işlemleri hatası:', error);
    }
    
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
      'SELECT *, DATE_FORMAT(egitim_baslangic, "%Y-%m-%d") as egitim_baslangic_str, DATE_FORMAT(egitim_bitis, "%Y-%m-%d") as egitim_bitis_str FROM courses WHERE id = ? AND is_active = 1',
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
          { "Başlangıç": rows[0].egitim_baslangic_str || "" },
          { "Bitiş": rows[0].egitim_bitis_str || "" }
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

    // Aktivite kaydet
    await logCourseCreated(mainTitle);

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

           // Aktivite kaydet - güncellenen kurs adını al
           const [updatedCourse] = await pool.execute('SELECT main_title FROM courses WHERE id = ?', [id]);
           if (updatedCourse.length > 0) {
             await logCourseUpdated(updatedCourse[0].main_title);
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

// Tek blog endpoint'i
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM blogs WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog bulunamadı" });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Blog hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Blog ekleme endpoint'i
app.post('/api/blogs', async (req, res) => {
  try {
    const { title, content, summary, author, category, imageUrl, readTime } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO blogs (title, content, summary, author, category, image_url, read_time, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [title, content, summary, author, category, imageUrl, readTime, true]
    );
    
    // Aktivite kaydet
    await logBlogPublished(title);
    
    res.json({
      success: true,
      message: "Blog başarıyla eklendi",
      id: result.insertId
    });
  } catch (error) {
    console.error('Blog ekleme hatası:', error);
    res.status(500).json({ success: false, message: 'Blog eklenirken bir hata oluştu' });
  }
});

// Blog güncelleme endpoint'i
app.put('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, author, category, imageUrl, readTime } = req.body;
    
    await pool.execute(
      'UPDATE blogs SET title = ?, content = ?, summary = ?, author = ?, category = ?, image_url = ?, read_time = ?, updated_at = NOW() WHERE id = ?',
      [title, content, summary, author, category, imageUrl, readTime, id]
    );
    
    // Aktivite kaydet - güncelleme
    await logBlogUpdated(title);
    
    res.json({
      success: true,
      message: "Blog başarıyla güncellendi"
    });
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Blog güncellenirken bir hata oluştu' });
  }
});

// Blog silme endpoint'i
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: "Blog başarıyla silindi"
    });
  } catch (error) {
    console.error('Blog silme hatası:', error);
    res.status(500).json({ success: false, message: 'Blog silinirken bir hata oluştu' });
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
      'SELECT id FROM course_applications WHERE course_id = ? AND student_email = ?',
      [courseId, email]
    );
    
    const [existingPhone] = await pool.execute(
      'SELECT id FROM course_applications WHERE course_id = ? AND student_phone = ?',
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
      'INSERT INTO course_applications (course_id, name, email, phone, student_name, student_email, student_phone, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [courseId, name, email, phone, name, email, phone, notes || '']
    );
    
    // Kurs adını al ve aktivite kaydet
    const [courseData] = await pool.execute(
      'SELECT main_title FROM courses WHERE id = ?',
      [courseId]
    );
    
    if (courseData.length > 0) {
      await logStudentApplication(name, courseData[0].main_title);
    }
    
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

// Kurs başvuru durumu güncelleme endpoint'i
app.put('/api/course-applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Geçerli durum kontrolü
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum. Sadece pending, approved veya rejected kullanılabilir.'
      });
    }
    
    // Durumu güncelle
    const [result] = await pool.execute(
      'UPDATE course_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Başvuru bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Başvuru durumu başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Durum güncellenirken bir hata oluştu' 
    });
  }
});

// Kurs başvurularını getir endpoint'i
app.get('/api/course-applications', async (req, res) => {
  try {
    // Önce tablonun var olup olmadığını kontrol et
    const [tableCheck] = await pool.execute("SHOW TABLES LIKE 'course_applications'");
    
    if (tableCheck.length === 0) {
      return res.json({
        success: true,
        applications: [],
        message: 'course_applications tablosu bulunamadı'
      });
    }

    const [rows] = await pool.execute(`
      SELECT 
        ca.id,
        ca.course_id,
        ca.student_name as name,
        ca.student_email as email,
        ca.student_phone as phone,
        ca.message,
        ca.notes,
        ca.status,
        ca.created_at,
        ca.updated_at,
        c.main_title as course_name
      FROM course_applications ca
      INNER JOIN courses c ON ca.course_id = c.id
      WHERE c.is_active = 1
      ORDER BY ca.created_at DESC
    `);
    
    console.log('📋 İlk başvuru verisi:', rows[0]);
    
    res.json({
      success: true,
      applications: rows
    });
  } catch (error) {
    console.error('Kurs başvuruları hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kurs başvuruları yüklenirken bir hata oluştu',
      error: error.message
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

// İstatistikler endpoint'i
app.get('/api/stats', async (req, res) => {
  try {
    // Onaylanmış öğrenci sayısı (benzersiz email)
    const [studentCount] = await pool.execute(`
      SELECT COUNT(DISTINCT student_email) as count 
      FROM course_applications 
      WHERE status = 'approved'
    `);
    
    // Geçen ayki onaylanmış öğrenci sayısı
    const [lastMonthStudentCount] = await pool.execute(`
      SELECT COUNT(DISTINCT student_email) as count 
      FROM course_applications 
      WHERE status = 'approved' 
      AND created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `);
    
    // Öğrenci büyüme oranını hesapla
    const currentStudents = studentCount[0].count;
    const lastMonthStudents = lastMonthStudentCount[0].count;
    const studentGrowthRate = lastMonthStudents > 0 
      ? Math.round(((currentStudents - lastMonthStudents) / lastMonthStudents) * 100)
      : 0;
    
    // Toplam kurs sayısı (aktif)
    const [courseCount] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE is_active = 1
    `);
    
    // Toplam blog sayısı (yayınlanmış)
    const [blogCount] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM blogs 
      WHERE is_published = 1
    `);
    
    res.json({
      success: true,
      stats: {
        students: currentStudents,
        courses: courseCount[0].count,
        blogs: blogCount[0].count,
        studentGrowthRate: studentGrowthRate
      }
    });
    
  } catch (error) {
    console.error('İstatistikler hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'İstatistikler yüklenirken bir hata oluştu' 
    });
  }
});

// Aktiviteler tablosunu oluştur
async function createActivitiesTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('student', 'blog', 'blog_updated', 'course', 'course_created') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type_created (type, created_at)
      )
    `);
    console.log('✅ Activities tablosu hazır!');
  } catch (error) {
    console.error('Activities tablosu oluşturma hatası:', error);
  }
}

// Aktivite kaydetme fonksiyonları
async function logStudentApplication(studentName, courseName) {
  try {
    await pool.execute(
      'INSERT INTO activities (type, message) VALUES (?, ?)',
      ['student', `Yeni öğrenci başvurusu: <strong>${studentName}</strong> - <strong>${courseName}</strong>`]
    );
  } catch (error) {
    console.error('Öğrenci başvuru aktivitesi kaydetme hatası:', error);
  }
}

async function logBlogPublished(blogTitle) {
  try {
    await pool.execute(
      'INSERT INTO activities (type, message) VALUES (?, ?)',
      ['blog', `Yeni blog yazısı yayınlandı: <strong>"${blogTitle}"</strong>`]
    );
  } catch (error) {
    console.error('Blog aktivitesi kaydetme hatası:', error);
  }
}

async function logBlogUpdated(blogTitle) {
  try {
    await pool.execute(
      'INSERT INTO activities (type, message) VALUES (?, ?)',
      ['blog_updated', `Blog yazısı güncellendi: <strong>"${blogTitle}"</strong>`]
    );
  } catch (error) {
    console.error('Blog güncelleme aktivitesi kaydetme hatası:', error);
  }
}

async function logCourseUpdated(courseTitle) {
  try {
    await pool.execute(
      'INSERT INTO activities (type, message) VALUES (?, ?)',
      ['course', `Kurs güncellendi: <strong>"${courseTitle}"</strong>`]
    );
  } catch (error) {
    console.error('Kurs güncelleme aktivitesi kaydetme hatası:', error);
  }
}

async function logCourseCreated(courseTitle) {
  try {
    await pool.execute(
      'INSERT INTO activities (type, message) VALUES (?, ?)',
      ['course_created', `Yeni kurs oluşturuldu: <strong>"${courseTitle}"</strong>`]
    );
  } catch (error) {
    console.error('Kurs oluşturma aktivitesi kaydetme hatası:', error);
  }
}

async function logStudentStatusChange(studentEmail, status) {
  try {
    const statusText = status === 'approved' ? 'onaylandı' : 
                      status === 'rejected' ? 'reddedildi' : 'beklemede';
    
    await pool.execute(
      'INSERT INTO activities (type, message) VALUES (?, ?)',
      ['student', `Öğrenci durumu güncellendi: <strong>${studentEmail}</strong> - <strong>${statusText}</strong>`]
    );
  } catch (error) {
    console.error('Öğrenci durum değişikliği aktivitesi kaydetme hatası:', error);
  }
}

// Öğrenci yönetimi endpoint'leri
app.get('/api/students', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all', course_id = 'all' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE ca.status = "approved"';
    let params = [];
    
    // Arama filtresi
    if (search) {
      whereClause += ' AND (ca.student_name LIKE ? OR ca.student_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Durum filtresi
    if (status !== 'all') {
      whereClause += ' AND ca.status = ?';
      params.push(status);
    }
    
    // Kurs filtresi
    if (course_id !== 'all') {
      whereClause += ' AND ca.course_id = ?';
      params.push(course_id);
    }
    
    // Toplam sayı
    const [countResult] = await pool.execute(`
      SELECT COUNT(DISTINCT ca.student_email) as total
      FROM course_applications ca
      LEFT JOIN courses c ON ca.course_id = c.id
      ${whereClause}
    `, params);
    
    // Öğrenci listesi
    const [students] = await pool.execute(`
      SELECT 
        ca.student_name,
        ca.student_email,
        ca.student_phone,
        ca.created_at as first_application,
        ca.updated_at as last_updated,
        GROUP_CONCAT(DISTINCT c.main_title) as courses,
        GROUP_CONCAT(DISTINCT ca.status) as statuses,
        COUNT(DISTINCT ca.id) as total_applications
      FROM course_applications ca
      LEFT JOIN courses c ON ca.course_id = c.id
      ${whereClause}
      GROUP BY ca.student_email
      ORDER BY ca.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    res.json({
      success: true,
      students: students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / limit),
        totalStudents: countResult[0].total,
        hasNext: offset + students.length < countResult[0].total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Öğrenci listesi hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Öğrenci listesi yüklenirken bir hata oluştu' 
    });
  }
});

// Tek öğrenci detayları
app.get('/api/students/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [studentDetails] = await pool.execute(`
      SELECT 
        ca.*,
        c.main_title as course_name,
        c.subtitle as course_subtitle
      FROM course_applications ca
      LEFT JOIN courses c ON ca.course_id = c.id
      WHERE ca.student_email = ? AND ca.status = 'approved'
      ORDER BY ca.created_at DESC
    `, [email]);
    
    if (studentDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Öğrenci bulunamadı'
      });
    }
    
    // Öğrenci bilgilerini grupla
    const student = {
      name: studentDetails[0].student_name,
      email: studentDetails[0].student_email,
      phone: studentDetails[0].student_phone,
      firstApplication: studentDetails[0].created_at,
      lastUpdated: studentDetails[0].updated_at,
      applications: studentDetails.map(app => ({
        id: app.id,
        courseName: app.course_name,
        courseSubtitle: app.course_subtitle,
        status: app.status,
        message: app.message,
        appliedAt: app.created_at,
        updatedAt: app.updated_at
      }))
    };
    
    res.json({
      success: true,
      student: student
    });
    
  } catch (error) {
    console.error('Öğrenci detay hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Öğrenci detayları yüklenirken bir hata oluştu' 
    });
  }
});

// Öğrenci durumu güncelleme
app.put('/api/students/:email/status', async (req, res) => {
  try {
    const { email } = req.params;
    const { status, note } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum değeri'
      });
    }
    
    await pool.execute(
      'UPDATE course_applications SET status = ?, updated_at = NOW() WHERE student_email = ?',
      [status, email]
    );
    
    // Aktivite kaydet
    await logStudentStatusChange(email, status);
    
    res.json({
      success: true,
      message: 'Öğrenci durumu güncellendi'
    });
    
  } catch (error) {
    console.error('Öğrenci durum güncelleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Öğrenci durumu güncellenirken bir hata oluştu' 
    });
  }
});

// Son aktiviteler endpoint'i
app.get('/api/activities', async (req, res) => {
  try {
    // Aktiviteler tablosundan son 10 aktiviteyi çek
    const [activities] = await pool.execute(`
      SELECT 
        id,
        type,
        message,
        created_at
      FROM activities 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    const formattedActivities = activities.map(activity => {
      const timeAgo = getTimeAgo(activity.created_at);
      const iconMap = {
        'student': 'FaUsers',
        'blog': 'FaNewspaper',
        'blog_updated': 'FaNewspaper',
        'course': 'FaBook',
        'course_created': 'FaBook'
      };
      const colorMap = {
        'student': 'text-blue-500',
        'blog': 'text-green-500',
        'blog_updated': 'text-orange-500',
        'course': 'text-purple-500',
        'course_created': 'text-indigo-500'
      };
      const bgColorMap = {
        'student': 'bg-blue-50',
        'blog': 'bg-green-50',
        'blog_updated': 'bg-orange-50',
        'course': 'bg-purple-50',
        'course_created': 'bg-indigo-50'
      };
      
      return {
        id: activity.id,
        type: activity.type,
        message: activity.message,
        time: timeAgo,
        timestamp: new Date(activity.created_at),
        icon: iconMap[activity.type],
        color: colorMap[activity.type],
        bgColor: bgColorMap[activity.type]
      };
    });
    
    res.json({
      success: true,
      activities: formattedActivities
    });
    
  } catch (error) {
    console.error('Aktiviteler hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Aktiviteler yüklenirken bir hata oluştu' 
    });
  }
});

// Zaman hesaplama yardımcı fonksiyonu
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Az önce';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} dakika önce`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} saat önce`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} gün önce`;
  }
}

// Sunucuyu başlat
app.listen(PORT, async () => {
  console.log(`🚀 Backend server çalışıyor: http://localhost:${PORT}`);
  await testConnection();
});
