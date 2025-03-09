package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/bolognesandwiches/AdVantage/internal/config"
	"github.com/bolognesandwiches/AdVantage/internal/db"
)

func main() {
	// Setup logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		slog.Error("Failed to load configuration", "error", err)
		os.Exit(1)
	}

	// Connect to database
	database, err := db.NewPostgresDB(cfg.Database)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer database.Close()

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Run migrations
	if err := runMigrations(ctx, database); err != nil {
		slog.Error("Failed to run migrations", "error", err)
		os.Exit(1)
	}

	slog.Info("Migrations completed successfully")
}

func runMigrations(ctx context.Context, database *db.PostgresDB) error {
	// Create users table
	_, err := database.Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(255) PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			first_name VARCHAR(255) NOT NULL,
			last_name VARCHAR(255) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Create index on email
	_, err = database.Pool.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
	`)
	if err != nil {
		return err
	}

	return nil
}
