// Mock blog servisi - Firebase olmadan çalışır
let mockBlogs = [
  {
    id: "1",
    title: "CRISPR Teknolojisi: Genetik Mucizeye Doğru",
    summary: "Günümüzde, genetik bilimindeki en heyecan verici gelişmelerden biri, CRISPR teknolojisi olarak adlandırılan bir keşiftir.",
    content: "CRISPR teknolojisi hakkında detaylı bilgi...",
    author: "Emrullah Çalışkan",
    date: "2025-05-08",
    imageUrl: "/blog/crispr.webp",
    category: "Teknoloji",
    readTime: "8 dakika",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2", 
    title: "Film Önerisi: Inception",
    summary: "Christopher Nolan'ın yönettiği Inception, rüyalar içinde rüya kavramını işleyen etkileyici bir bilim kurgu filmidir.",
    content: "Inception filmi hakkında detaylı analiz...",
    author: "Emrullah Çalışkan",
    date: "2025-05-10",
    imageUrl: "/blog/film-oneri.webp",
    category: "Film Önerisi",
    readTime: "9 dakika",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const getBlogs = async () => {
  // Simüle edilmiş network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...mockBlogs];
};

export const getBlogById = async (id) => {
  // Simüle edilmiş network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const blog = mockBlogs.find(b => b.id === id);
  if (!blog) {
    throw new Error('Blog bulunamadı');
  }
  return blog;
};

export const addBlog = async (blog) => {
  const newBlog = {
    ...blog,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockBlogs.push(newBlog);
  return newBlog;
};
  
export const updateBlog = async (id, blog) => {
  const index = mockBlogs.findIndex(b => b.id === id);
  if (index !== -1) {
    mockBlogs[index] = {
      ...mockBlogs[index],
      ...blog,
      updatedAt: new Date().toISOString(),
    };
  }
  return mockBlogs[index];
};

export const deleteBlog = async (id) => {
  mockBlogs = mockBlogs.filter(blog => blog.id !== id);
  return true;
};
  