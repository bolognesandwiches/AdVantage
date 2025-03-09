package services

import (
	"context"
	"errors"
	"time"

	"github.com/bolognesandwiches/AdVantage/internal/db"
	"github.com/bolognesandwiches/AdVantage/internal/models"
	"github.com/jackc/pgx/v5"
)

// Common errors
var (
	ErrUserNotFound = errors.New("user not found")
)

// UserService handles user-related operations
type UserService struct {
	db *db.PostgresDB
}

// NewUserService creates a new UserService
func NewUserService(database *db.PostgresDB) *UserService {
	return &UserService{
		db: database,
	}
}

// Create creates a new user in the database
func (s *UserService) Create(ctx context.Context, user *models.User) error {
	// Generate UUID if not provided
	if user.ID == "" {
		user.ID = generateUUID()
	}

	// Set timestamps
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	query := `
		INSERT INTO users (id, email, password, first_name, last_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := s.db.Pool.Exec(ctx, query,
		user.ID,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}

// FindByID finds a user by ID
func (s *UserService) FindByID(ctx context.Context, id string) (*models.User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &models.User{}
	err := s.db.Pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return user, nil
}

// FindByEmail finds a user by email
func (s *UserService) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &models.User{}
	err := s.db.Pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return user, nil
}

// ExistsByEmail checks if a user with the given email exists
func (s *UserService) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `
		SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)
	`

	var exists bool
	err := s.db.Pool.QueryRow(ctx, query, email).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

// Update updates an existing user
func (s *UserService) Update(ctx context.Context, user *models.User) error {
	// Update timestamp
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET email = $2, password = $3, first_name = $4, last_name = $5, updated_at = $6
		WHERE id = $1
	`

	_, err := s.db.Pool.Exec(ctx, query,
		user.ID,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.UpdatedAt,
	)

	return err
}

// Helper function to generate a UUID
func generateUUID() string {
	// In a real implementation, use a proper UUID library
	// For simplicity, we'll return a placeholder
	return "user_" + time.Now().Format("20060102150405")
}
