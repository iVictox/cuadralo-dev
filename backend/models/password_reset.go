package models

import (
	"time"
)

type PasswordReset struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Email    string    `gorm:"index" json:"email"`
	Token    string    `gorm:"uniqueIndex" json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	Used     bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `json:"created_at"`
}