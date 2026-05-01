import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UploadCloud, FileText, Trash2, Loader2, Search } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post('http://localhost:5000/api/documents', formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      fetchDocuments(); // Refresh list to show 'processing' state
      
      // Poll for updates (simple implementation)
      const interval = setInterval(async () => {
        const { data } = await axios.get('http://localhost:5000/api/documents', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setDocuments(data);
        if (!data.some(d => d.status === 'processing')) {
          clearInterval(interval);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Upload error', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchDocuments();
    } catch (error) {
      console.error('Delete error', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage SOP documents and system index</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="text-indigo-400" /> Upload Document
            </h2>
            <form onSubmit={handleUpload} className="space-y-4 relative z-10">
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-500/5 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-300">
                  {file ? file.name : "Drag & drop or click to browse PDF"}
                </p>
              </div>
              <button 
                type="submit" 
                disabled={!file || uploading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload & Process'}
              </button>
            </form>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#111827]/50 backdrop-blur-md">
              <h2 className="text-lg font-semibold text-white">Indexed Documents</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p>No documents uploaded yet.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1a2333] sticky top-0 z-10 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-3 font-medium">Document Title</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Pages</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-200">{doc.title}</p>
                              <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            \${doc.status === 'indexed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              doc.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                              'bg-red-500/10 text-red-400 border border-red-500/20'}\`}
                          >
                            {doc.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {doc.status === 'indexed' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {doc.metadata?.totalPages || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(doc._id)}
                            className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
