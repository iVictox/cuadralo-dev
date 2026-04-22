package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"time"
)

type InventoryHelper struct{}

func (ih *InventoryHelper) GetItem(userID uint, itemType models.ItemType) *models.InventoryItem {
	var item models.InventoryItem
	if err := database.DB.Where("user_id = ? AND item_type = ?", userID, itemType).First(&item).Error; err != nil {
		return nil
	}
	return &item
}

func (ih *InventoryHelper) AddItem(userID uint, itemType models.ItemType, count int) error {
	var item models.InventoryItem
	err := database.DB.Where("user_id = ? AND item_type = ?", userID, itemType).First(&item).Error
	
	if err != nil {
		newItem := models.InventoryItem{
			UserID:    userID,
			ItemType: itemType,
			Count:    count,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		return database.DB.Create(&newItem).Error
	}
	
	item.Count += count
	item.UpdatedAt = time.Now()
	
	return database.DB.Save(&item).Error
}

func (ih *InventoryHelper) RemoveItem(userID uint, itemType models.ItemType, count int) error {
	var item models.InventoryItem
	err := database.DB.Where("user_id = ? AND item_type = ?", userID, itemType).First(&item).Error
	if err != nil {
		return err
	}
	
	if item.Count < count {
		return nil
	}
	
	item.Count -= count
	item.UpdatedAt = time.Now()
	
	return database.DB.Save(&item).Error
}

func (ih *InventoryHelper) HasItem(userID uint, itemType models.ItemType) bool {
	var item models.InventoryItem
	err := database.DB.Where("user_id = ? AND item_type = ?", userID, itemType).First(&item).Error
	if err != nil {
		return false
	}
	return item.Count > 0
}

func (ih *InventoryHelper) GetCount(userID uint, itemType models.ItemType) int {
	var item models.InventoryItem
	err := database.DB.Where("user_id = ? AND item_type = ?", userID, itemType).First(&item).Error
	if err != nil {
		return 0
	}
	return item.Count
}

func (ih *InventoryHelper) GetUserInventory(userID uint) map[string]int {
	items := []models.InventoryItem{}
	database.DB.Where("user_id = ?", userID).Find(&items)
	
	inventory := make(map[string]int)
	for _, item := range items {
		inventory[string(item.ItemType)] = item.Count
	}
	return inventory
}

var Inventory InventoryHelper