'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { fileAPI, FileUploadResponse } from '@/lib/api';

// File type definitions for DSP logs
const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.csv', '.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt', '.log'],
  'application/json': ['.json'],
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [processingFiles, setProcessingFiles] = useState<Record<string, string>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Add to existing files
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newUploadedFiles: FileUploadResponse[] = [];

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await fileAPI.uploadFile(file, (progressEvent) => {
          // Calculate overall progress across all files
          const currentFileProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          const overallProgress = Math.round(
            ((i * 100) + currentFileProgress) / files.length
          );
          setUploadProgress(overallProgress);
        });

        // Add the uploaded file to our state
        newUploadedFiles.push(response.data);
        
        // Save last upload date to localStorage (for dashboard notification)
        localStorage.setItem('lastUploadDate', new Date().toISOString());
      }
      
      // Add to existing uploaded files
      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
      
      // Start processing the uploaded files
      for (const file of newUploadedFiles) {
        setProcessingFiles(prev => ({
          ...prev,
          [file.id]: 'processing'
        }));
        
        processFile(file.id);
      }
      
      // Clear the file selection
      setFiles([]);
      
      toast.success(`Successfully uploaded ${newUploadedFiles.length} file${newUploadedFiles.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Process a file after it's been uploaded
  const processFile = async (fileId: string) => {
    try {
      // Call the process endpoint
      const result = await fileAPI.processFile(fileId);
      
      // Update the processing status
      setProcessingFiles(prev => ({
        ...prev,
        [fileId]: result.data.status
      }));
      
      if (result.data.status === 'completed') {
        toast.success(`File processing completed successfully`);
      } else if (result.data.status === 'error') {
        toast.error(`File processing failed: ${result.data.errorMessage}`);
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingFiles(prev => ({
        ...prev,
        [fileId]: 'error'
      }));
      toast.error('Failed to process file. Please try again.');
    }
  };

  // View analysis for a processed file
  const viewAnalysis = (fileId: string) => {
    window.location.href = `/dashboard/analytics?fileId=${fileId}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // The root props from dropzone
  const dropzoneProps = getRootProps();

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Upload DSP Logs
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload your bid request and win logs to analyze performance and generate insights.
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <div 
                onClick={dropzoneProps.onClick} 
                onKeyDown={dropzoneProps.onKeyDown} 
                onFocus={dropzoneProps.onFocus} 
                onBlur={dropzoneProps.onBlur} 
                tabIndex={0} 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                } cursor-pointer`}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <input {...getInputProps()} />
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                      <span>Upload files</span>
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV, Excel, TXT, JSON up to 50MB</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Files to Upload</h3>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <motion.li
                      key={`${file.name}-${index}`}
                      className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-0 flex-1 flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 truncate">{file.name}</span>
                        <span className="ml-2 flex-shrink-0 text-gray-400">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {uploading && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Uploading Files...</h3>
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <motion.div 
                    className="h-2 rounded-full bg-primary-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {uploadProgress < 100 
                    ? `Processing files (${uploadProgress}%)` 
                    : 'Processing complete. Finalizing...'}
                </p>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 ${
                  files.length === 0 || uploading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recently Uploaded Files</h3>
          </div>
          <div className="px-6 py-5">
            <ul className="divide-y divide-gray-200">
              {uploadedFiles.map((file) => (
                <motion.li
                  key={file.id}
                  className="py-4 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.fileSize)} • 
                        {processingFiles[file.id] ? (
                          <span className={`ml-1 ${
                            processingFiles[file.id] === 'completed' 
                              ? 'text-green-600' 
                              : processingFiles[file.id] === 'error' 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                          }`}>
                            {processingFiles[file.id] === 'processing' ? 'Processing...' : 
                             processingFiles[file.id] === 'completed' ? 'Processed' : 
                             'Processing failed'}
                          </span>
                        ) : (
                          <span className="ml-1">{file.status}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => window.open(`/api/v1/files/${file.id}`, '_blank')}
                    >
                      Download
                    </button>
                    
                    {processingFiles[file.id] === 'completed' && (
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => viewAnalysis(file.id)}
                      >
                        View Analysis
                      </button>
                    )}
                    
                    {processingFiles[file.id] === 'error' && (
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        onClick={() => processFile(file.id)}
                      >
                        Retry Processing
                      </button>
                    )}
                    
                    {!processingFiles[file.id] && (
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => processFile(file.id)}
                      >
                        Process
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Log Format Guidelines */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">DSP Log Format Guidelines</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-600 mb-4">
            To ensure proper analysis, please make sure your log files follow these guidelines:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc pl-5">
            <li>CSV files should include headers in the first row</li>
            <li>Bid log files should include: timestamp, request ID, bid price, auction type, etc.</li>
            <li>Win log files should include: timestamp, request ID, winning price, creative ID, etc.</li>
            <li>Files should not exceed 50MB per upload</li>
            <li>Date format should be ISO 8601 (YYYY-MM-DD or YYYY-MM-DDThh:mm:ss)</li>
          </ul>
          <p className="text-gray-600 mt-4">
            For more information, refer to the
            <a href="#" className="text-primary-600 hover:text-primary-500 ml-1">
              DSP Log Format Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 