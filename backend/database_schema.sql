-- ABİM React Projesi Veritabanı Şeması
-- Tarih: 2025-01-21
-- Collation: utf8mb4_unicode_ci

-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS abim_react_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE abim_react_db;

-- 1. USERS TABLOSU
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. COURSES TABLOSU
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(500),
    ders_gunleri JSON NOT NULL, -- ["Pazartesi", "Çarşamba", "Cuma"]
    ders_saati TIME NOT NULL,
    egitim_baslangic DATE NOT NULL,
    egitim_bitis DATE NOT NULL,
    mufredat JSON, -- ["HTML'e Giriş", "Başlık Etiketi", ...]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. BLOGS TABLOSU
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    author_id INT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. BANNERS TABLOSU
CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    position ENUM('hero', 'middle', 'footer') DEFAULT 'hero',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. COURSE_APPLICATIONS TABLOSU (Kurs Başvuruları)
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
);

-- 6. CONTACT_MESSAGES TABLOSU (İletişim Mesajları)
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÖRNEK VERİLER

-- Admin kullanıcı (şifre: password)
INSERT INTO users (email, password, name, role) VALUES 
('admin@abim.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');

-- Örnek kurslar
INSERT INTO courses (main_title, subtitle, image_url, ders_gunleri, ders_saati, egitim_baslangic, egitim_bitis, mufredat) VALUES 
('HTML&CSS EĞİTİMİ', 'HTML eğitimi ile web sitelerinin iskeletini kurmayı ve içerikleri düzenlemeyi öğren!', '/course/html.webp', '["Cumartesi"]', '14:00:00', '2025-05-10', '2025-07-10', '["HTML\'e Giriş", "Başlık Etiketi", "Paragraf", "Kalın, italik ve altı çizgili metinler", "A Etiketi", "İmg Etiketi", "Listeler", "Formlar", "Semantik Etiketler", "Eğitim Sonu Uygulama"]'),

('JAVASCRIPT EĞİTİMİ', 'JavaScript eğitimi ile web sitelerine hareket ve etkileşim katmayı öğren!', '/course/js.webp', '["Cumartesi", "Pazar"]', '12:00:00', '2025-05-10', '2025-07-10', '["JavaScript\'e Giriş", "Değişkenler ve Veri Türleri", "Operatörler ve Koşullar", "Döngüler", "Fonksiyonlar", "Diziler", "Nesneler", "Eğitim Sonu Uygulama"]'),

('PHOTOSHOP EĞİTİMİ', 'Grafik tasarım eğitimi ile hayal ettiğini tasarla!', '/course/photoshop.webp', '["Pazartesi", "Çarşamba", "Cuma"]', '20:00:00', '2025-06-01', '2025-12-01', '["Arayüzü Tanıyalım", "Araç Çubukları ve Paneller", "Menüler ve Kullanımı", "Layer Kavramı ve Katman Kullanımı", "Renk Bilgisi ve Kullanımı", "Shadow & Light", "Font Kullanımı", "Decupe ve Layer Mask", "Fotoğraf Düzenleme ve Rötüş Teknikleri", "Sosyal Medya Tasarımları", "Broşür & Afiş Tasarım"]');

-- Örnek banner
INSERT INTO banners (title, subtitle, image_url, position, is_active) VALUES 
('Ücretsiz Eğitim Fırsatı', 'Geleceğinize yatırım yapın, ücretsiz eğitimlerimize katılın!', '/banner/hero-banner.jpg', 'hero', TRUE);

-- Veritabanı oluşturuldu mesajı
SELECT 'Veritabanı başarıyla oluşturuldu!' as message;
