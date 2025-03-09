package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"time"

	"github.com/bolognesandwiches/AdVantage/internal/ingestion"
	"github.com/bolognesandwiches/AdVantage/internal/storage"
)

// FileUploadInfo contains information about an uploaded file
type FileUploadInfo struct {
	ID         string    `json:"id"`
	FileName   string    `json:"fileName"`
	FileSize   int64     `json:"fileSize"`
	FileType   string    `json:"fileType"`
	UploadedAt time.Time `json:"uploadedAt"`
	Status     string    `json:"status"`
}

// FileService handles file operations
type FileService struct {
	fileStorage  *storage.FileStorage
	logProcessor *ingestion.LogProcessorService
}

// NewFileService creates a new file service
func NewFileService(fileStorage *storage.FileStorage, logProcessor *ingestion.LogProcessorService) *FileService {
	return &FileService{
		fileStorage:  fileStorage,
		logProcessor: logProcessor,
	}
}

// UploadFile handles the uploading of a file
func (s *FileService) UploadFile(ctx context.Context, file multipart.File, header *multipart.FileHeader, userID string) (*FileUploadInfo, error) {
	// Validate file type
	if err := s.validateFileType(header); err != nil {
		return nil, err
	}

	// Validate file size
	if err := s.validateFileSize(header); err != nil {
		return nil, err
	}

	// Store the file
	fileInfo, err := s.fileStorage.StoreFile(file, header.Filename, header.Header.Get("Content-Type"), userID, header.Size)
	if err != nil {
		return nil, fmt.Errorf("failed to store file: %w", err)
	}

	// Return file upload info
	return &FileUploadInfo{
		ID:         fileInfo.ID,
		FileName:   fileInfo.FileName,
		FileSize:   fileInfo.FileSize,
		FileType:   fileInfo.FileType,
		UploadedAt: fileInfo.UploadedAt,
		Status:     "uploaded", // Initial status
	}, nil
}

// GetFile retrieves a file by ID
func (s *FileService) GetFile(ctx context.Context, fileID, userID string) (*os.File, *FileUploadInfo, error) {
	// Get the file
	file, fileInfo, err := s.fileStorage.GetFile(fileID, userID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get file: %w", err)
	}

	// Return file and info
	return file, &FileUploadInfo{
		ID:         fileInfo.ID,
		FileName:   fileInfo.FileName,
		FileSize:   fileInfo.FileSize,
		FileType:   fileInfo.FileType,
		UploadedAt: fileInfo.UploadedAt,
		Status:     "available", // Status when file is retrieved
	}, nil
}

// DeleteFile removes a file
func (s *FileService) DeleteFile(ctx context.Context, fileID, userID string) error {
	return s.fileStorage.DeleteFile(fileID, userID)
}

// ListUserFiles lists all files for a user
// In a real implementation, this would query a database
func (s *FileService) ListUserFiles(ctx context.Context, userID string) ([]*FileUploadInfo, error) {
	// This is a placeholder implementation
	// In a real application, we would query a database for the user's files
	return []*FileUploadInfo{}, nil
}

// validateFileType checks if the file's content type is allowed
func (s *FileService) validateFileType(header *multipart.FileHeader) error {
	contentType := header.Header.Get("Content-Type")

	allowedTypes := map[string]bool{
		"text/csv":                 true,
		"application/vnd.ms-excel": true,
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
		"text/plain":       true,
		"application/json": true,
	}

	if !allowedTypes[contentType] {
		return fmt.Errorf("file type not allowed: %s", contentType)
	}

	return nil
}

// validateFileSize checks if the file size is within limits
func (s *FileService) validateFileSize(header *multipart.FileHeader) error {
	// 50MB size limit
	const maxSize = 50 * 1024 * 1024

	if header.Size > maxSize {
		return fmt.Errorf("file size exceeds the maximum allowed size of 50MB")
	}

	return nil
}

// ProcessLogFile handles the processing of an uploaded DSP log file
func (s *FileService) ProcessLogFile(ctx context.Context, fileID, userID string) (*ingestion.LogAnalysisResult, error) {
	// Check if the file has already been processed
	processed, err := s.logProcessor.IsLogFileProcessed(ctx, fileID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check if file is processed: %w", err)
	}

	// If already processed, return the existing results
	if processed {
		return s.GetLogAnalysisResult(ctx, fileID, userID)
	}

	// Get the file
	file, fileInfo, err := s.fileStorage.GetFile(fileID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get file for processing: %w", err)
	}
	defer file.Close()

	// Process the file
	result, err := s.logProcessor.ProcessLogFile(ctx, fileInfo.FilePath, fileID, fileInfo.FileName, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to process log file: %w", err)
	}

	return result, nil
}

// GetLogAnalysisResult retrieves the analysis result for a log file
func (s *FileService) GetLogAnalysisResult(ctx context.Context, fileID, userID string) (*ingestion.LogAnalysisResult, error) {
	return s.logProcessor.GetAnalysisResult(ctx, fileID, userID)
}

// AnalyzeLogFile performs analysis on a processed log file
func (s *FileService) AnalyzeLogFile(ctx context.Context, fileID, userID string) error {
	// In a real implementation, this would run analytics on the processed data

	// For now, just log that we're analyzing the file
	fmt.Printf("Analyzing log file with ID: %s for user %s\n", fileID, userID)

	// Simulate analysis time
	time.Sleep(2 * time.Second)

	return nil
}
