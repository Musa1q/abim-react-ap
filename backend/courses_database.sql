-- ABİM React Projesi - Sadece Eğitimler Veritabanı
-- Tarih: 2025-01-21
-- Collation: utf8mb4_unicode_ci

-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS abim_react_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE abim_react_db;

-- COURSES TABLOSU
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

-- ÖRNEK KURS VERİLERİ
INSERT INTO courses (main_title, subtitle, image_url, ders_gunleri, ders_saati, egitim_baslangic, egitim_bitis, mufredat) VALUES 

('HTML&CSS EĞİTİMİ', 
'HTML eğitimi ile web sitelerinin iskeletini kurmayı ve içerikleri düzenlemeyi öğren!', 
'/course/html.webp', 
'["Cumartesi"]', 
'14:00:00', 
'2025-05-10', 
'2025-07-10', 
'["HTML\'e Giriş", "Başlık Etiketi", "Paragraf", "Kalın, italik ve altı çizgili metinler", "A Etiketi", "İmg Etiketi", "Listeler", "Formlar", "Semantik Etiketler", "Eğitim Sonu Uygulama"]'),

('JAVASCRIPT EĞİTİMİ', 
'JavaScript eğitimi ile web sitelerine hareket ve etkileşim katmayı öğren!', 
'/course/js.webp', 
'["Cumartesi", "Pazar"]', 
'12:00:00', 
'2025-05-10', 
'2025-07-10', 
'["JavaScript\'e Giriş", "Değişkenler ve Veri Türleri", "Operatörler ve Koşullar", "Döngüler", "Fonksiyonlar", "Diziler", "Nesneler", "Eğitim Sonu Uygulama"]'),

('PHOTOSHOP EĞİTİMİ', 
'Grafik tasarım eğitimi ile hayal ettiğini tasarla!', 
'/course/photoshop.webp', 
'["Pazartesi", "Çarşamba", "Cuma"]', 
'20:00:00', 
'2025-06-01', 
'2025-12-01', 
'["Arayüzü Tanıyalım", "Araç Çubukları ve Paneller", "Menüler ve Kullanımı", "Layer Kavramı ve Katman Kullanımı", "Renk Bilgisi ve Kullanımı", "Shadow & Light", "Font Kullanımı", "Decupe ve Layer Mask", "Fotoğraf Düzenleme ve Rötüş Teknikleri", "Sosyal Medya Tasarımları", "Broşür & Afiş Tasarım"]');

-- Veritabanı oluşturuldu mesajı
SELECT 'Courses veritabanı başarıyla oluşturuldu!' as message;
