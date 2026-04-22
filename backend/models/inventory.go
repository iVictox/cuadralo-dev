package models

import (
	"time"
)

type ItemType string

const (
	ItemTypeFlash     ItemType = "flash"
	ItemTypeClasico   ItemType = "clasico"
	ItemTypeEstelar   ItemType = "estelar"
	ItemTypeVIP      ItemType = "vip"
	ItemTypeRompehielos ItemType = "rompehielos"
)

type InventoryItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID   uint     `gorm:"index" json:"user_id"`
	ItemType ItemType `gorm:"type:varchar(20);index" json:"item_type"`
	Count    int      `json:"count"`
	ExpiredAt *time.Time `json:"expired_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (InventoryItem) TableName() string {
	return "inventory_items"
}