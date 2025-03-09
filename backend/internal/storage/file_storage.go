package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

// FileInfo represents metadata about a stored file
type FileInfo struct {
	ID         string    `json:"id"`
	FileName   string    `json:"fileName"`
	FileSize   int64     `json:"fileSize"`
	FileType   string    `json:"fileType"`
	UploadedAt time.Time `json:"uploadedAt"`
	UserID     string    `json:"userId"`
	FilePath   string    `json:"-"` // Internal use only
}

// FileStorage handles storing and retrieving files
type FileStorage struct {
	basePath string
}

// NewFileStorage creates a new file storage instance
func NewFileStorage(basePath string) (*FileStorage, error) {
	if basePath == "" {
		basePath = "uploads"
	}

	// Create base directory if it doesn't exist
	err := os.MkdirAll(basePath, 0755)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Create subdirectories for organization
	for _, dir := range []string{"dsp_logs", "reports", "temp"} {
		if err := os.MkdirAll(filepath.Join(basePath, dir), 0755); err != nil {
			return nil, fmt.Errorf("failed to create %s directory: %w", dir, err)
		}
	}

	return &FileStorage{
		basePath: basePath,
	}, nil
}

// StoreFile saves a file to disk and returns metadata about the stored file
func (fs *FileStorage) StoreFile(file io.Reader, fileName, fileType, userID string, fileSize int64) (*FileInfo, error) {
	// Generate a unique ID for the file
	id := uuid.New().String()

	// Determine the storage path based on file type
	subDir := "temp"
	if isLogFile(fileType, fileName) {
		subDir = "dsp_logs"
	} else if isReportFile(fileType, fileName) {
		subDir = "reports"
	}

	// Ensure file name is safe for storage
	safeFileName := sanitizeFileName(fileName)

	// Create a unique filename to avoid collisions
	uniqueFileName := fmt.Sprintf("%s_%s", id, safeFileName)

	// Create the full path for storage
	dirPath := filepath.Join(fs.basePath, subDir, userID)
	if err := os.MkdirAll(dirPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create user directory: %w", err)
	}

	filePath := filepath.Join(dirPath, uniqueFileName)

	// Create the file
	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy file data to the destination
	if _, err := io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	// Return file info
	return &FileInfo{
		ID:         id,
		FileName:   fileName,
		FileSize:   fileSize,
		FileType:   fileType,
		UploadedAt: time.Now(),
		UserID:     userID,
		FilePath:   filePath,
	}, nil
}

// GetFile retrieves a file by ID
func (fs *FileStorage) GetFile(id, userID string) (*os.File, *FileInfo, error) {
	// In a real implementation, we would query a database for the file info
	// For this example, we'll just search for the file in the user's directories

	// This is inefficient and should be replaced with a database lookup in production
	fileInfo, err := fs.findFileByID(id, userID)
	if err != nil {
		return nil, nil, err
	}

	// Open the file
	file, err := os.Open(fileInfo.FilePath)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open file: %w", err)
	}

	return file, fileInfo, nil
}

// DeleteFile removes a file from storage
func (fs *FileStorage) DeleteFile(id, userID string) error {
	// Find the file info
	fileInfo, err := fs.findFileByID(id, userID)
	if err != nil {
		return err
	}

	// Delete the file
	if err := os.Remove(fileInfo.FilePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// findFileByID is a helper function to find a file by ID
// In a real implementation, this would be replaced with a database query
func (fs *FileStorage) findFileByID(id, userID string) (*FileInfo, error) {
	// This is a placeholder implementation
	// In a real application, we would look up the file info in a database

	// Search all subdirectories for the file
	for _, subDir := range []string{"dsp_logs", "reports", "temp"} {
		dirPath := filepath.Join(fs.basePath, subDir, userID)

		// Skip if the directory doesn't exist
		if _, err := os.Stat(dirPath); os.IsNotExist(err) {
			continue
		}

		// Read directory entries
		entries, err := os.ReadDir(dirPath)
		if err != nil {
			continue
		}

		// Look for a file with the matching ID prefix
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}

			if filepath.HasPrefix(entry.Name(), id+"_") {
				// Found a match
				filePath := filepath.Join(dirPath, entry.Name())

				// Get file info
				fileInfo, err := entry.Info()
				if err != nil {
					return nil, fmt.Errorf("failed to get file info: %w", err)
				}

				// Remove the ID prefix to get the original filename
				originalName := entry.Name()[len(id)+1:]

				return &FileInfo{
					ID:         id,
					FileName:   originalName,
					FileSize:   fileInfo.Size(),
					FileType:   getFileTypeFromName(originalName),
					UploadedAt: fileInfo.ModTime(),
					UserID:     userID,
					FilePath:   filePath,
				}, nil
			}
		}
	}

	return nil, fmt.Errorf("file not found")
}

// Helper functions for file type detection and sanitization

// isLogFile determines if a file is a DSP log file based on type and name
func isLogFile(fileType, fileName string) bool {
	// Check based on file extension and type
	ext := filepath.Ext(fileName)
	return (fileType == "text/csv" || fileType == "application/vnd.ms-excel" ||
		fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
		fileType == "text/plain" ||
		ext == ".csv" || ext == ".xls" || ext == ".xlsx" || ext == ".log" || ext == ".txt")
}

// isReportFile determines if a file is a report file
func isReportFile(fileType, fileName string) bool {
	ext := filepath.Ext(fileName)
	return (fileType == "application/pdf" || ext == ".pdf" ||
		fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
		ext == ".docx" || ext == ".doc")
}

// sanitizeFileName ensures the filename is safe for storage
func sanitizeFileName(fileName string) string {
	// This is a simple implementation that removes path traversal attempts
	// A more comprehensive solution would be needed in production
	return filepath.Base(fileName)
}

// getFileTypeFromName guesses the file type based on the filename
func getFileTypeFromName(fileName string) string {
	ext := filepath.Ext(fileName)
	switch ext {
	case ".csv":
		return "text/csv"
	case ".xls":
		return "application/vnd.ms-excel"
	case ".xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case ".txt", ".log":
		return "text/plain"
	case ".pdf":
		return "application/pdf"
	case ".doc", ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".json":
		return "application/json"
	default:
		return "application/octet-stream"
	}
}
