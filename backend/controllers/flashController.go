package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/websockets"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type FlashInfo struct {
	ID            uint      `json:"id"`
	Type          string    `json:"type"`
	TypeName      string    `json:"type_name"`
	Duration      int      `json:"duration"` // en minutos
	StartsAt      time.Time `json:"starts_at"`
	EndsAt        time.Time `json:"ends_at"`
	TimeRemaining int      `json:"time_remaining"` // segundos restantes
	ReachedCount  int      `json:"reached_count"`
	IsActive      bool     `json:"is_active"`
	IsExpiring   bool     `json:"is_expiring"` // < 5 min restantes
}

type FlashOption struct {
	Type     string  `json:"type"`
	TypeName string  `json:"name"`
	Price   float64 `json:"price"`
	Minutes int     `json:"minutes"`
}

func GetFlashInfo(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))

	var flash models.Flash
	result := database.DB.Preload("User").
		Where("user_id = ? AND ends_at > ?", userID, time.Now()).
		Order("ends_at DESC").
		Find(&flash)

	inventory := Inventory.GetUserInventory(userID)
	if inventory == nil {
		inventory = map[string]int{}
	}

	if result.Error != nil {
		return c.JSON(map[string]interface{}{
			"has_flash": false,
			"flash":    nil,
			"inventory": inventory,
		})
	}

	flashInfo := FlashInfo{
		ID:            flash.ID,
		Type:          string(flash.Type),
		TypeName:      flash.Type.GetName(),
		Duration:      int(flash.Type.GetDuration().Minutes()),
		StartsAt:      flash.StartsAt,
		EndsAt:        flash.EndsAt,
		TimeRemaining: int(flash.TimeRemaining().Seconds()),
		ReachedCount:  flash.ReachedCount,
		IsActive:      flash.IsActive(),
		IsExpiring:   flash.IsExpiringSoon(),
	}

	return c.JSON(map[string]interface{}{
		"has_flash": true,
		"flash":     flashInfo,
		"inventory": inventory,
	})
}

func GetFlashOptions(c *fiber.Ctx) error {
	options := []FlashOption{
		{
			Type:     "flash",
			TypeName: "Flash ⚡",
			Price:   0.79,
			Minutes: 15,
		},
		{
			Type:     "clasico",
			TypeName: "Clásico ✨",
			Price:   1.49,
			Minutes: 30,
		},
		{
			Type:     "estelar",
			TypeName: "Estelar 🌟",
			Price:   2.49,
			Minutes: 60,
		},
	}

	packages := []map[string]interface{}{
		{
			"type":       "flash",
			"name":       "Paquete Clásico",
			"quantity":   5,
			"price":      2.99,
			"discount":   25,
		},
		{
			"type":       "clasico",
			"name":       "Paquete Fiestero",
			"quantity":   10,
			"price":      8.99,
			"discount":   40,
		},
		{
			"type":       "estelar",
			"name":       "Paquete Fin de Semana",
			"quantity":   3,
			"price":      5.99,
			"discount":   20,
		},
	}

	return c.JSON(map[string]interface{}{
		"options":  options,
		"packages": packages,
	})
}

type ActivateFlashInput struct {
	Type string `json:"type"`
}

func ActivateFlash(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))

	var input ActivateFlashInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(map[string]string{"error": "Datos inválidos"})
	}

	if input.Type != "flash" && input.Type != "clasico" && input.Type != "estelar" {
		return c.Status(400).JSON(map[string]string{"error": "Tipo de destello inválido"})
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(map[string]string{"error": "Usuario no encontrado"})
	}

	if input.Type == "" {
		return c.Status(400).JSON(map[string]string{"error": "Tipo requerido"})
	}

	itemType := models.ItemType(input.Type)
	if !Inventory.HasItem(userID, itemType) {
		return c.Status(400).JSON(map[string]string{"needs_purchase": "true", "error": "No tienes destellos disponibles. Compra primero."})
	}

	if err := Inventory.RemoveItem(userID, itemType, 1); err != nil {
		return c.Status(500).JSON(map[string]string{"error": "Error al consumir destello"})
	}

	now := time.Now()
	flashType := models.FlashType(input.Type)

	newFlash := models.Flash{
		UserID:   userID,
		Type:     flashType,
		StartsAt: now,
		EndsAt:   now.Add(flashType.GetDuration()),
	}

	if err := database.DB.Create(&newFlash).Error; err != nil {
		return c.Status(500).JSON(map[string]string{"error": "Error al crear el destello"})
	}

	flashInfo := FlashInfo{
		ID:            newFlash.ID,
		Type:          string(newFlash.Type),
		TypeName:      newFlash.Type.GetName(),
		Duration:      int(newFlash.Type.GetDuration().Minutes()),
		StartsAt:      newFlash.StartsAt,
		EndsAt:        newFlash.EndsAt,
		TimeRemaining: int(newFlash.TimeRemaining().Seconds()),
		ReachedCount:  0,
		IsActive:      true,
		IsExpiring:   false,
	}

	inventory := Inventory.GetUserInventory(userID)

	return c.JSON(map[string]interface{}{
		"success": true,
		"flash":   flashInfo,
		"inventory": inventory,
		"message": "¡Destello activado! La gente te verá más.",
	})
}

func GetFlashStats(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))

	var totalFlashes int64
	database.DB.Model(&models.Flash{}).Where("user_id = ?", userID).Count(&totalFlashes)

	var totalReached int
	database.DB.Model(&models.Flash{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(reached_count), 0)").
		Scan(&totalReached)

	var lastFlash models.Flash
	database.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		First(&lastFlash)

	return c.JSON(map[string]interface{}{
		"total_flashes":    totalFlashes,
		"total_reached":   totalReached,
		"last_flash_type": func() string {
			if lastFlash.ID == 0 {
				return ""
			}
			return lastFlash.Type.GetName()
		}(),
	})
}

func IncrementReach(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))

	var flash models.Flash
	result := database.DB.
		Where("user_id = ? AND ends_at > ?", userID, time.Now()).
		Find(&flash)

	if result.Error != nil {
		return c.Status(404).JSON(map[string]string{"error": "No tienes un destello activo"})
	}

	flash.ReachedCount++
	database.DB.Save(&flash)

	return c.JSON(map[string]interface{}{
		"success":       true,
		"reached_count": flash.ReachedCount,
	})
}

func HandleSwipeWithFlash(c *fiber.Ctx) error {
	viewerID := uint(c.Locals("userId").(float64))
	_ = viewerID

	var input struct {
		TargetID uint   `json:"target_id"`
		Action   string `json:"action"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(map[string]string{"error": "Datos inválidos"})
	}

	if input.Action == "right" || input.Action == "rompehielo" {
		var targetFlash models.Flash
		result := database.DB.
			Where("user_id = ? AND ends_at > ?", input.TargetID, time.Now()).
			First(&targetFlash)

		if result.Error == nil {
			targetFlash.ReachedCount++
			database.DB.Save(&targetFlash)

			websockets.SendToUser(fmt.Sprintf("%d", input.TargetID), "flash_reach", map[string]interface{}{
				"flash_id":      targetFlash.ID,
				"reached_count": targetFlash.ReachedCount,
			})
		}
	}

	return c.JSON(map[string]interface{}{
		"success": true,
	})
}

func RefreshFlash(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))
	flashIDStr := c.Query("id")

	if flashIDStr == "" {
		return c.Status(400).JSON(map[string]string{"error": "ID requerido"})
	}

	flashID, err := strconv.ParseUint(flashIDStr, 10, 32)
	if err != nil {
		return c.Status(400).JSON(map[string]string{"error": "ID inválido"})
	}

	var flash models.Flash
	result := database.DB.
		Where("id = ? AND user_id = ?", uint(flashID), userID).
		First(&flash)

	if result.Error != nil {
		return c.Status(404).JSON(map[string]string{"error": "Destello no encontrado"})
	}

	flashInfo := FlashInfo{
		ID:            flash.ID,
		Type:          string(flash.Type),
		TypeName:      flash.Type.GetName(),
		Duration:      int(flash.Type.GetDuration().Minutes()),
		StartsAt:      flash.StartsAt,
		EndsAt:        flash.EndsAt,
		TimeRemaining: int(flash.TimeRemaining().Seconds()),
		ReachedCount:  flash.ReachedCount,
		IsActive:      flash.IsActive(),
		IsExpiring:     flash.IsExpiringSoon(),
	}

	return c.JSON(map[string]interface{}{
		"flash": flashInfo,
	})
}

func AdminListFlashes(c *fiber.Ctx) error {
	filter := c.Query("filter", "active")
	search := c.Query("search", "")

	var flashes []models.Flash
	query := database.DB.Preload("User")

	switch filter {
	case "active":
		query = query.Where("ends_at > ?", time.Now())
	case "expired":
		query = query.Where("ends_at <= ?", time.Now())
	}

	if search != "" {
		subQuery := database.DB.Table("users").Select("id").Where("name LIKE ?", "%"+search+"%").Where("username LIKE ?", "%"+search+"%")
		query = query.Where("user_id IN (?)", subQuery)
	}

	result := query.Order("created_at DESC").Limit(100).Find(&flashes)
	if result.Error != nil {
		return c.Status(500).JSON(map[string]string{"error": "Error cargando destellos"})
	}

	var totalCount, activeCount, expiredCount, totalReach int64
	database.DB.Model(&models.Flash{}).Count(&totalCount)
	database.DB.Model(&models.Flash{}).Where("ends_at > ?", time.Now()).Count(&activeCount)
	database.DB.Model(&models.Flash{}).Where("ends_at <= ?", time.Now()).Count(&expiredCount)
	database.DB.Model(&models.Flash{}).Select("COALESCE(SUM(reached_count), 0)").Scan(&totalReach)

	flashesMap := []map[string]interface{}{}
	for _, f := range flashes {
		flashesMap = append(flashesMap, map[string]interface{}{
			"id":            f.ID,
			"user_id":       f.UserID,
			"type":          string(f.Type),
			"type_name":     f.Type.GetName(),
			"duration":      int(f.Type.GetDuration().Minutes()),
			"starts_at":      f.StartsAt,
			"ends_at":        f.EndsAt,
			"reached_count": f.ReachedCount,
			"is_active":     f.IsActive(),
			"is_expiring":   f.IsExpiringSoon(),
		})
	}

	return c.JSON(map[string]interface{}{
		"flashes": flashesMap,
		"stats": map[string]interface{}{
			"total":     totalCount,
			"active":    activeCount,
			"expired":   expiredCount,
			"totalReach": totalReach,
		},
	})
}

func AdminDeleteFlash(c *fiber.Ctx) error {
	idStr := c.Query("id")
	if idStr == "" {
		return c.Status(400).JSON(map[string]string{"error": "ID requerido"})
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.Status(400).JSON(map[string]string{"error": "ID inválido"})
	}

	result := database.DB.Delete(&models.Flash{}, uint(id))
	if result.Error != nil {
		return c.Status(500).JSON(map[string]string{"error": "Error al eliminar"})
	}

	return c.JSON(map[string]interface{}{
		"success": true,
		"message": "Destello eliminado",
	})
}