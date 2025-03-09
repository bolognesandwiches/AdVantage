package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/bolognesandwiches/AdVantage/internal/config"
	"github.com/bolognesandwiches/AdVantage/internal/db"
	"github.com/bolognesandwiches/AdVantage/internal/models"
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

	// Run seed
	if err := seedUsers(ctx, database); err != nil {
		slog.Error("Failed to seed users", "error", err)
		os.Exit(1)
	}

	slog.Info("Seed completed successfully")
}

func seedUsers(ctx context.Context, database *db.PostgresDB) error {
	// Check if users table is empty
	var count int
	err := database.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return err
	}

	// If users already exist, skip seeding
	if count > 0 {
		slog.Info("Users already exist, skipping seed")
		return nil
	}

	// Create admin user
	admin := &models.User{
		ID:        "user_admin",
		Email:     "admin@advantage.com",
		FirstName: "Admin",
		LastName:  "User",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := admin.SetPassword("password123"); err != nil {
		return err
	}

	// Create demo user
	demo := &models.User{
		ID:        "user_demo",
		Email:     "demo@advantage.com",
		FirstName: "Demo",
		LastName:  "User",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := demo.SetPassword("password123"); err != nil {
		return err
	}

	// Insert users
	query := `
		INSERT INTO users (id, email, password, first_name, last_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	// Insert admin
	_, err = database.Pool.Exec(ctx, query,
		admin.ID,
		admin.Email,
		admin.Password,
		admin.FirstName,
		admin.LastName,
		admin.CreatedAt,
		admin.UpdatedAt,
	)
	if err != nil {
		return err
	}

	// Insert demo
	_, err = database.Pool.Exec(ctx, query,
		demo.ID,
		demo.Email,
		demo.Password,
		demo.FirstName,
		demo.LastName,
		demo.CreatedAt,
		demo.UpdatedAt,
	)
	if err != nil {
		return err
	}

	slog.Info("Created seed users", "count", 2)
	return nil
}
