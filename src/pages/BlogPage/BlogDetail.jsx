import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaClock, FaUser, FaCalendar, FaTag } from 'react-icons/fa';
import { getBlogById } from '../../services/blogService';
import DOMPurify from 'dompurify';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const blogData = await getBlogById(id);
      setBlog(blogData);
    } catch (error) {
      console.error('Blog yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Blog yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Blog Yazısı Bulunamadı</h2>
          <button
            onClick={() => navigate('/blog')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all"
          >
            Blog'a Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} - ABİM Blog</title>
        <meta name="description" content={blog.summary} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-[400px]">
          <img
            src={blog.imageUrl || blog.image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent">
            <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12">
              <button
                onClick={() => navigate('/blog')}
                className="flex items-center text-white/80 hover:text-white mb-6 w-fit transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Blog'a Dön
              </button>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{blog.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="mr-2" />
                  <span>{new Date(blog.published_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  <span>{blog.readTime}</span>
                </div>
                <div className="flex items-center">
                  <FaTag className="mr-2" />
                  <span>{blog.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-600 mb-8 font-medium">
                  {blog.summary}
                </p>
                <div 
                  className="text-gray-700 prose prose-lg max-w-none"
                  style={{
                    '--tw-prose-headings': '#1f2937',
                    '--tw-prose-h1': '2rem',
                    '--tw-prose-h2': '1.75rem',
                    '--tw-prose-h3': '1.5rem',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(`<p>${blog.content || ''}</p>`)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail; 