package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// FileUploadResponse represents the response from a file upload
type FileUploadResponse struct {
	ID       string `json:"id"`
	FileName string `json:"fileName"`
	FileSize int64  `json:"fileSize"`
	FileType string `json:"fileType"`
	Status   string `json:"status"`
}

// HandleFileUpload handles the upload of a file
func (s *Server) HandleFileUpload(c *gin.Context) {
	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse multipart form with 50MB max memory
	if err := c.Request.ParseMultipartForm(50 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse form: %v", err)})
		return
	}

	// Get the file from the request
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to get file: %v", err)})
		return
	}
	defer file.Close()

	// Upload the file using the file service
	fileInfo, err := s.fileService.UploadFile(c, file, header, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload file: %v", err)})
		return
	}

	// Process the log file asynchronously
	go func() {
		// Create a new context for processing since the request context will be canceled
		if err := s.fileService.ProcessLogFile(c.Request.Context(), fileInfo.ID, userID.(string)); err != nil {
			fmt.Printf("Error processing log file: %v\n", err)
		}
	}()

	// Return the file information
	c.JSON(http.StatusOK, FileUploadResponse{
		ID:       fileInfo.ID,
		FileName: fileInfo.FileName,
		FileSize: fileInfo.FileSize,
		FileType: fileInfo.FileType,
		Status:   fileInfo.Status,
	})
}

// HandleGetFile handles retrieving a file by ID
func (s *Server) HandleGetFile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get file ID from route params
	fileID := c.Param("id")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File ID is required"})
		return
	}

	// Get the file using the file service
	file, fileInfo, err := s.fileService.GetFile(c, fileID, userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Failed to get file: %v", err)})
		return
	}
	defer file.Close()

	// Set content type and attachment headers
	c.Header("Content-Type", fileInfo.FileType)
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileInfo.FileName))

	// Stream the file to the response
	http.ServeContent(c.Writer, c.Request, fileInfo.FileName, fileInfo.UploadedAt, file)
}

// HandleDeleteFile handles deleting a file by ID
func (s *Server) HandleDeleteFile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get file ID from route params
	fileID := c.Param("id")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File ID is required"})
		return
	}

	// Delete the file using the file service
	if err := s.fileService.DeleteFile(c, fileID, userID.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete file: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}

// HandleListFiles handles listing all files for a user
func (s *Server) HandleListFiles(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// List files using the file service
	files, err := s.fileService.ListUserFiles(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to list files: %v", err)})
		return
	}

	// Convert to response format
	response := make([]FileUploadResponse, len(files))
	for i, file := range files {
		response[i] = FileUploadResponse{
			ID:       file.ID,
			FileName: file.FileName,
			FileSize: file.FileSize,
			FileType: file.FileType,
			Status:   file.Status,
		}
	}

	c.JSON(http.StatusOK, response)
}

// HandleProcessFile handles the manual processing of a file
func (s *Server) HandleProcessFile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get file ID from route params
	fileID := c.Param("id")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File ID is required"})
		return
	}

	// Process the file using the file service
	if err := s.fileService.ProcessLogFile(c, fileID, userID.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process file: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File processing started"})
}

// HandleAnalyzeFile handles the analysis of a processed file
func (s *Server) HandleAnalyzeFile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get file ID from route params
	fileID := c.Param("id")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File ID is required"})
		return
	}

	// Analyze the file using the file service
	if err := s.fileService.AnalyzeLogFile(c, fileID, userID.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to analyze file: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File analysis started"})
}
