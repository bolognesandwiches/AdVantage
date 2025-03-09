package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/bolognesandwiches/AdVantage/internal/config"
	"github.com/bolognesandwiches/AdVantage/internal/db"
	"github.com/bolognesandwiches/AdVantage/internal/ingestion"
	"github.com/bolognesandwiches/AdVantage/internal/services"
	"github.com/bolognesandwiches/AdVantage/internal/storage"
	"github.com/gin-gonic/gin"
)

// Server represents the HTTP server
type Server struct {
	router      *gin.Engine
	config      *config.Config
	db          *db.PostgresDB
	http        *http.Server
	userService *services.UserService
	fileService *services.FileService
}

// NewServer creates a new HTTP server
func NewServer(cfg *config.Config, database *db.PostgresDB) *Server {
	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.New()

	// Add middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Add CORS middleware
	router.Use(CORSMiddleware())

	// Create file storage
	fileStorage, err := storage.NewFileStorage("uploads")
	if err != nil {
		log.Fatalf("Failed to initialize file storage: %v", err)
	}

	// Initialize the log processor service
	logProcessor := ingestion.NewLogProcessorService("uploads")

	// Create services
	userService := services.NewUserService(database)
	fileService := services.NewFileService(fileStorage, logProcessor)

	// Create server
	server := &Server{
		router:      router,
		config:      cfg,
		db:          database,
		userService: userService,
		fileService: fileService,
	}

	// Setup routes
	server.setupRoutes()

	return server
}

// CORSMiddleware handles CORS preflight requests and sets appropriate headers
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// Start starts the HTTP server
func (s *Server) Start() error {
	s.http = &http.Server{
		Addr:         fmt.Sprintf(":%d", s.config.Port),
		Handler:      s.router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	return s.http.ListenAndServe()
}

// Shutdown gracefully shuts down the HTTP server
func (s *Server) Shutdown(ctx context.Context) error {
	if s.http != nil {
		return s.http.Shutdown(ctx)
	}
	return nil
}

// setupRoutes sets up all the routes for the server
func (s *Server) setupRoutes() {
	// API v1 group
	v1 := s.router.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", s.HandleRegister)
			auth.POST("/login", s.HandleLogin)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(s.AuthMiddleware())
		{
			// User routes
			user := protected.Group("/user")
			{
				user.GET("/me", s.HandleGetCurrentUser)
				user.PUT("/me", s.HandleUpdateCurrentUser)
			}

			// File upload routes
			files := protected.Group("/files")
			{
				files.POST("/upload", s.HandleFileUpload)
				files.GET("/:id", s.HandleGetFile)
				files.GET("/list", s.HandleListFiles)
				files.POST("/process/:id", s.ProcessFile)
				files.GET("/analysis/:id", s.GetFileAnalysis)
			}
		}
	}

	// Health check
	s.router.GET("/health", s.HandleHealthCheck)
}
