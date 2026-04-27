package models

import "time"

type VerificationHistory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Success   bool      `json:"success"`
	Reason    string    `json:"reason"`
	PhotoURL  string    `json:"photo_url"`
	Score     float64   `json:"score"`
	CreatedAt time.Time `json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
