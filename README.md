# ABİM Adana Anadolu Gençlik Derneği - Web Sitesi

Modern React teknolojileri kullanılarak geliştirilmiş, tam özellikli bir dernek web sitesi ve yönetim paneli.

## 🚀 Özellikler

### Frontend
- **React 19** - En güncel React sürümü
- **React Router DOM** - Sayfa yönlendirme
- **Tailwind CSS** - Modern ve responsive tasarım
- **React Helmet Async** - SEO optimizasyonu
- **React Icons** - Zengin ikon kütüphanesi

### Backend
- **Node.js** - Server-side JavaScript
- **Express.js** - Web framework
- **MySQL** - Veritabanı yönetimi
- **Multer** - Dosya yükleme
- **Nodemailer** - E-posta gönderimi
- **bcryptjs** - Şifre şifreleme

### Admin Paneli
- **Dashboard** - İstatistikler ve hızlı erişim
- **Blog Yönetimi** - İçerik oluşturma, düzenleme, silme
- **Kurs Yönetimi** - Eğitim programları yönetimi
- **Banner Yönetimi** - Ana sayfa banner'ları
- **Güvenli Giriş** - JWT token tabanlı kimlik doğrulama

## 📁 Proje Yapısı

```
abim-react/
├── src/
│   ├── components/          # React bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── AdminPage/      # Admin paneli sayfaları
│   │   └── Home/           # Ana sayfa bileşenleri
│   ├── services/           # API servisleri
│   ├── layouts/            # Layout bileşenleri
│   └── utils/              # Yardımcı fonksiyonlar
├── backend/                # Node.js backend
│   ├── server.js          # Ana server dosyası
│   ├── uploads/           # Yüklenen dosyalar
│   └── *.sql              # Veritabanı şemaları
└── public/                # Statik dosyalar
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v18+)
- MySQL (v8+)
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/kullaniciadi/abim-react.git
cd abim-react
```

2. **Frontend bağımlılıklarını yükleyin**
```bash
npm install
```

3. **Backend bağımlılıklarını yükleyin**
```bash
cd backend
npm install
```

4. **Veritabanını kurun**
```bash
# MySQL'de veritabanı oluşturun
mysql -u root -p < database_schema.sql
mysql -u root -p < courses_database.sql
```

5. **Environment değişkenlerini ayarlayın**
```bash
# backend/.env dosyası oluşturun
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=abim_database
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

6. **Uygulamayı çalıştırın**
```bash
# Backend'i başlatın (terminal 1)
cd backend
npm start

# Frontend'i başlatın (terminal 2)
npm run dev
```

## 🌐 Kullanım

- **Ana Site**: http://localhost:5173
- **Admin Paneli**: http://localhost:5173/admin/login
- **API Endpoints**: http://localhost:5000/api

### Admin Paneli Girişi
- E-posta: admin@abim.com
- Şifre: admin123

## 📱 Responsive Tasarım

- **Mobile First** yaklaşımı
- **Tablet** ve **Desktop** uyumlu
- **Modern UI/UX** tasarım prensipleri

## 🔧 Teknik Detaylar

### Frontend Teknolojileri
- React 19 ile modern hooks kullanımı
- Context API ile state yönetimi
- Custom hooks ile kod tekrarını önleme
- Lazy loading ile performans optimizasyonu

### Backend Teknolojileri
- RESTful API tasarımı
- Middleware ile güvenlik katmanları
- File upload sistemi
- Email notification sistemi

### Veritabanı
- Normalized database design
- Foreign key relationships
- Index optimizasyonları

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# dist/ klasörünü deploy edin
```

### Backend (Heroku/DigitalOcean)
```bash
# Environment variables'ları ayarlayın
# Database connection string'i güncelleyin
npm start
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Emrullah Çalışkan**
- GitHub: [@kullaniciadi](https://github.com/kullaniciadi)
- LinkedIn: [Emrullah Çalışkan](https://linkedin.com/in/emrullah-caliskan)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için:
- E-posta: emrullah@abim.com
- Website: [abim.com](https://abim.com)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!