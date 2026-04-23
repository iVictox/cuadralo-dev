package models

import "time"

type Like struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	FromUserID uint      `json:"from_user_id"`             // Quién da el like
	ToUserID   uint      `json:"to_user_id"`               // A quién se lo da
	Action     string    `json:"action"`                   // "right" (like), "left" (dislike) o "rompehielo"
	Message   string    `json:"message" gorm:"type:text"` // El texto del rompehielos
	Status    string    `json:"status" gorm:"default:pending"` // pending, approved, rejected
	CreatedAt time.Time `json:"created_at"`
}
