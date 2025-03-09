package ingestion

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// LogAnalysisResult represents the result of log analysis
type LogAnalysisResult struct {
	FileID       string      `json:"fileId"`
	UserID       string      `json:"userId"`
	FileName     string      `json:"fileName"`
	ProcessedAt  time.Time   `json:"processedAt"`
	Summary      interface{} `json:"summary"`
	Status       string      `json:"status"`
	ErrorMessage string      `json:"errorMessage,omitempty"`
}

// LogProcessorService handles the processing and analysis of DSP log files
type LogProcessorService struct {
	basePath string
}

// NewLogProcessorService creates a new log processor service
func NewLogProcessorService(basePath string) *LogProcessorService {
	if basePath == "" {
		basePath = "uploads"
	}

	return &LogProcessorService{
		basePath: basePath,
	}
}

// ProcessLogFile processes a DSP log file and returns analysis results
func (s *LogProcessorService) ProcessLogFile(ctx context.Context, filePath, fileID, fileName, userID string) (*LogAnalysisResult, error) {
	// Create result structure
	result := &LogAnalysisResult{
		FileID:      fileID,
		UserID:      userID,
		FileName:    fileName,
		ProcessedAt: time.Now(),
		Status:      "processing",
	}

	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = fmt.Sprintf("Failed to open file: %v", err)
		return result, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Determine the type of log file based on extension
	ext := filepath.Ext(fileName)
	if ext != ".csv" {
		result.Status = "error"
		result.ErrorMessage = "Unsupported file format. Only CSV files are supported."
		return result, fmt.Errorf("unsupported file format: %s", ext)
	}

	// Process the file based on its content
	var summary interface{}

	// Attempt to parse as Beeswax log
	beeswaxSummary, err := ParseBeeswaxLog(file)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = fmt.Sprintf("Failed to parse file: %v", err)
		return result, fmt.Errorf("failed to parse file: %w", err)
	}

	summary = beeswaxSummary
	result.Status = "completed"
	result.Summary = summary

	// Store the analysis results
	if err := s.storeAnalysisResult(result, userID, fileID); err != nil {
		return result, fmt.Errorf("failed to store analysis result: %w", err)
	}

	return result, nil
}

// GetAnalysisResult retrieves a previously processed analysis result
func (s *LogProcessorService) GetAnalysisResult(ctx context.Context, fileID, userID string) (*LogAnalysisResult, error) {
	// Get the path to the results file
	resultsPath := filepath.Join(s.basePath, "reports", userID, fmt.Sprintf("%s_analysis.json", fileID))

	// Check if the file exists
	if _, err := os.Stat(resultsPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("analysis result not found for file ID: %s", fileID)
	}

	// Read the results file
	data, err := os.ReadFile(resultsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read analysis result: %w", err)
	}

	// Parse the results
	var result LogAnalysisResult
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to parse analysis result: %w", err)
	}

	return &result, nil
}

// storeAnalysisResult saves the analysis result to disk
func (s *LogProcessorService) storeAnalysisResult(result *LogAnalysisResult, userID, fileID string) error {
	// Create the results directory if it doesn't exist
	resultsDir := filepath.Join(s.basePath, "reports", userID)
	if err := os.MkdirAll(resultsDir, 0755); err != nil {
		return fmt.Errorf("failed to create results directory: %w", err)
	}

	// Serialize the result to JSON
	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize analysis result: %w", err)
	}

	// Write the result to disk
	resultsPath := filepath.Join(resultsDir, fmt.Sprintf("%s_analysis.json", fileID))
	if err := os.WriteFile(resultsPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write analysis result: %w", err)
	}

	return nil
}

// IsLogFileProcessed checks if a log file has been processed
func (s *LogProcessorService) IsLogFileProcessed(ctx context.Context, fileID, userID string) (bool, error) {
	// Get the path to the results file
	resultsPath := filepath.Join(s.basePath, "reports", userID, fmt.Sprintf("%s_analysis.json", fileID))

	// Check if the file exists
	if _, err := os.Stat(resultsPath); os.IsNotExist(err) {
		return false, nil
	} else if err != nil {
		return false, err
	}

	return true, nil
}
