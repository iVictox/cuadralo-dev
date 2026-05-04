package models

import "time"

type Follow struct {
	FollowerID  uint      `gorm:"primaryKey;index" json:"follower_id"`
	FollowingID uint      `gorm:"primaryKey;index" json:"following_id"`
	CreatedAt   time.Time `json:"created_at" gorm:"index"`
}
