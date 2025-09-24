import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getBlogs } from '../../services/blogService';
import BlogCard from '../../components/BlogCard';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const blogsData = await getBlogs();
      setBlogs(blogsData);
    } catch (error) {
      console.error('Bloglar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog - ABİM Adana Anadolu Gençlik Derneği</title>
        <meta name="description" content="ABİM blog yazıları, teknoloji ve yazılım dünyasından güncel haberler." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Teknoloji ve yazılım dünyasından güncel yazılar, haberler ve ipuçları.
              Uzman ekibimizin hazırladığı içeriklerle bilgi dağarcığınızı genişletin.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Bloglar yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
