import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../components/providers/SocketProvider';
import { Button } from '../../../components/ui/Button';
import { Upload, File, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../../services/axios';
import toast from 'react-hot-toast';

export const AdminDocumentsPage: React.FC = () => {
  const { adminSocket } = useSocket();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Fetch initial documents
    const fetchDocuments = async () => {
      try {
        const res = await apiClient.get('/documents');
        if (res.data.success) {
          setDocuments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch documents', err);
      }
    };
    fetchDocuments();
    
    if (adminSocket) {
      adminSocket.on('document_progress', (data: { id: string, progress: number, status: string, filename: string }) => {
        setUploadProgress(prev => ({
          ...prev,
          [data.id]: data.progress
        }));
        
        if (data.progress === 100 && data.status === 'completed') {
          toast.success(`Processing complete for ${data.filename}`);
        } else if (data.status === 'failed') {
          toast.error(`Processing failed for ${data.filename}`);
        }
      });
    }

    return () => {
      if (adminSocket) {
        adminSocket.off('document_progress');
      }
    };
  }, [adminSocket]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      if (data.success) {
        toast.success('Document uploaded successfully. Processing started.');
        // Add to our list with 0 progress
        setDocuments(prev => [{
          _id: data.data._id,
          title: data.data.title,
          originalName: file.name,
          status: 'processing',
          createdAt: new Date().toISOString()
        }, ...prev]);
        setUploadProgress(prev => ({ ...prev, [data.data._id]: 0 }));
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Network error during upload');
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage and monitor document ingestion and AI indexing.</p>
        </div>
        
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.txt,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button variant="default" className="gap-2" disabled={isUploading} type="button" onClick={() => document.getElementById('file-upload')?.click()}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Document
            </Button>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Document Name</th>
                <th className="px-6 py-3 font-medium">Status / Progress</th>
                <th className="px-6 py-3 font-medium">Uploaded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : documents.map(doc => {
                const progress = uploadProgress[doc._id] ?? (doc.status === 'completed' ? 100 : 0);
                
                return (
                  <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{doc.title || doc.originalName}</p>
                          <p className="text-xs text-gray-500">{doc._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {progress === 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : doc.status === 'failed' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                          )}
                          <span className="text-xs font-medium capitalize">
                            {progress === 100 ? 'Completed' : doc.status === 'failed' ? 'Failed' : 'Processing'}
                          </span>
                        </div>
                        {progress < 100 && doc.status !== 'failed' && (
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full bg-primary-600 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
