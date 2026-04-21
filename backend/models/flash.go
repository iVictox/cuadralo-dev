package models

import (
	"time"
)

type FlashType string

const (
	FlashTypeFlash   FlashType = "flash"   // 15 min
	FlashTypeClasico FlashType = "clasico" // 30 min
	FlashTypeEstelar FlashType = "estelar" // 1 hora
)

func (f FlashType) GetDuration() time.Duration {
	switch f {
	case FlashTypeFlash:
		return 15 * time.Minute
	case FlashTypeClasico:
		return 30 * time.Minute
	case FlashTypeEstelar:
		return 1 * time.Hour
	default:
		return 15 * time.Minute
	}
}

func (f FlashType) GetName() string {
	switch f {
	case FlashTypeFlash:
		return "Flash"
	case FlashTypeClasico:
		return "Clásico"
	case FlashTypeEstelar:
		return "Estelar"
	default:
		return "Flash"
	}
}

type Flash struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	User      User     `gorm:"foreignKey:UserID" json:"-"`
	Type     FlashType `gorm:"type:varchar(20)" json:"type"`
	StartsAt  time.Time `json:"starts_at"`
	EndsAt    time.Time `gorm:"index" json:"ends_at"`
	ReachedCount int    `gorm:"default:0" json:"reached_count"`
	CreatedAt time.Time `json:"created_at"`
}

func (Flash) TableName() string {
	return "flashes"
}

func (f *Flash) IsActive() bool {
	return time.Now().Before(f.EndsAt)
}

func (f *Flash) TimeRemaining() time.Duration {
	if !f.IsActive() {
		return 0
	}
	return time.Until(f.EndsAt)
}

func (f *Flash) IsExpiringSoon() bool {
	return f.IsActive() && f.TimeRemaining() <= 5*time.Minute
}