import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import {
  getBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
} from '../../services/blogService';
const BlogManagement = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      console.log('BlogManagement: Starting to fetch blogs...');
      const blogsData = await getBlogs();
      console.log('BlogManagement: Blogs fetched successfully:', blogsData.length);
      setBlogs(blogsData);
    } catch (error) {
      console.error('BlogManagement: Error fetching blogs:', error);
      console.error('BlogManagement: Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError('Blog yazıları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      setIsLoading(true);
      try {
        console.log('BlogManagement: Starting to delete blog:', id);
        await deleteBlog(id);
        console.log('BlogManagement: Blog deleted successfully');
        await fetchBlogs();
      } catch (error) {
        console.error('BlogManagement: Error deleting blog:', error);
        console.error('BlogManagement: Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        setError('Blog yazısı silinirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (blog) => {
    navigate(`/admin/blog/edit/${blog.id}`);
  };

  const handleNewBlog = () => {
    navigate('/admin/blog/new');
  };

  if (isLoading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchBlogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Yazıları</h1>
        <button
          onClick={handleNewBlog}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Yeni Blog Yazısı
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                  Başlık
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Yazar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Tarih
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Henüz blog yazısı bulunmuyor.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img
                          src={blog.image_url || blog.imageUrl}
                          alt={blog.title}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {blog.summary}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.author}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.created_at || blog.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={isLoading}
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isLoading}
                      >
                        {isLoading ? <FaSpinner className="inline animate-spin" /> : <FaTrash className="inline" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default BlogManagement; 