package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetMyPlan(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if user.IsPrime && time.Now().After(user.PrimeExpiresAt) {
		user.IsPrime = false
		database.DB.Save(&user)
	}

	if user.IsBoosted && time.Now().After(user.BoostExpiresAt) {
		user.IsBoosted = false
		database.DB.Save(&user)
	}

	inventory := Inventory.GetUserInventory(userId)

	rompehielosCount := inventory["flash"] + inventory["clasico"] + inventory["estelar"]

	return c.JSON(fiber.Map{
		"is_prime":           user.IsPrime,
		"prime_expires_at":  user.PrimeExpiresAt,
		"is_boosted":        user.IsBoosted,
		"boost_expires_at":  user.BoostExpiresAt,
		"boosts_count":      user.BoostsCount,
		"rompehielos_count": rompehielosCount,
		"inventory":        inventory,
	})
}

func BuyPrime(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	user.IsPrime = true
	if user.PrimeExpiresAt.After(time.Now()) {
		user.PrimeExpiresAt = user.PrimeExpiresAt.Add(30 * 24 * time.Hour)
	} else {
		user.PrimeExpiresAt = time.Now().Add(30 * 24 * time.Hour)
	}

	user.BoostsCount += 1
	database.DB.Save(&user)

	Inventory.AddItem(userId, models.ItemTypeFlash, 3)

	inventory := Inventory.GetUserInventory(userId)

	return c.JSON(fiber.Map{
		"message": "¡Bienvenido a Cuadralo VIP! Disfruta de tus bonos mensuales.",
		"user":    user,
		"inventory": inventory,
	})
}

func BuyBoost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		Amount int `json:"amount"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if data.Amount != 1 && data.Amount != 5 && data.Amount != 10 {
		return c.Status(400).JSON(fiber.Map{"error": "Paquete inválido"})
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	user.BoostsCount += data.Amount
	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message":      "¡Destellos comprados con éxito!",
		"boosts_count": user.BoostsCount,
	})
}

func BuyRompehielos(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		Type     string `json:"type"`
		Quantity int    `json:"quantity"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	validTypes := map[string]bool{"flash": true, "clasico": true, "estelar": true}
	if !validTypes[data.Type] {
		return c.Status(400).JSON(fiber.Map{"error": "Tipo inválido"})
	}

	if data.Quantity <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Cantidad inválida"})
	}

	Inventory.AddItem(userId, models.ItemType(data.Type), data.Quantity)

	inventory := Inventory.GetUserInventory(userId)

	return c.JSON(fiber.Map{
		"message":  "¡Destellos comprados!",
		"inventory": inventory,
	})
}

func ActivateBoost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if user.BoostsCount <= 0 {
		return c.Status(403).JSON(fiber.Map{"error": "No tienes destellos disponibles. Compra más en la tienda."})
	}

	if user.IsBoosted && user.BoostExpiresAt.After(time.Now()) {
		return c.Status(400).JSON(fiber.Map{"error": "Ya tienes un destello activo."})
	}

	user.BoostsCount -= 1
	user.IsBoosted = true
	user.BoostExpiresAt = time.Now().Add(30 * time.Minute)
	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message":      "¡Destello activado! Serás el perfil principal en tu zona por 30 minutos.",
		"expires_at":   user.BoostExpiresAt,
		"boosts_count": user.BoostsCount,
	})
}

type PaymentReportInput struct {
	ItemType   string  `json:"item_type"`
	ItemName  string  `json:"item_name,omitempty"`
	AmountUSD float64 `json:"amount_usd"`
	AmountVES float64 `json:"amount_ves"`
	Rate     float64 `json:"rate"`
	Reference string  `json:"reference"`
	Bank     string  `json:"bank"`
	Phone    string  `json:"phone"`
	Receipt  string  `json:"receipt"`
	FlashQty int     `json:"flash_qty,omitempty"`
	FlashType string  `json:"flash_type,omitempty"`
}

func ReportPayment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var input PaymentReportInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if input.Reference == "" || input.Receipt == "" {
		return c.Status(400).JSON(fiber.Map{"error": "La referencia y el comprobante son obligatorios"})
	}

	report := models.PaymentReport{
		UserID:    userId,
		ItemType:  input.ItemType,
		ItemName:  input.ItemName,
		AmountUSD: input.AmountUSD,
		AmountVES: input.AmountVES,
		Rate:     input.Rate,
		Reference: input.Reference,
		Bank:     input.Bank,
		Phone:    input.Phone,
		Receipt:  input.Receipt,
		FlashQty: input.FlashQty,
		FlashType: input.FlashType,
		Status:   "pending",
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&report).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo procesar el pago"})
	}

	return c.JSON(fiber.Map{
		"message": "Pago reportado exitosamente. Tu solicitud está en revisión.",
	})
}

// ✅ FIX: Ahora la App consume la configuración EXACTA guardada por el Admin
func GetExchangeRate(c *fiber.Ctx) error {
	var settings []models.Setting
	database.DB.Where("key IN ?", []string{"vip_price_usd", "vip_price_eur", "bs_exchange_rate"}).Find(&settings)

	var price float64 = 4.99 // Fallback
	var rate float64 = 45.00 // Fallback

	for _, s := range settings {
		// Prioridad: USD sobre EUR
		if s.Key == "vip_price_usd" {
			if val, err := strconv.ParseFloat(s.Value, 64); err == nil {
				price = val
			}
		}
		// Compatibilidad hacia atrás si solo tiene EUR
		if s.Key == "vip_price_eur" && price == 4.99 {
			if val, err := strconv.ParseFloat(s.Value, 64); err == nil {
				price = val
			}
		}
		if s.Key == "bs_exchange_rate" {
			if val, err := strconv.ParseFloat(s.Value, 64); err == nil {
				rate = val
			}
		}
	}

	return c.JSON(fiber.Map{
		"rate":  rate,
		"price": price,
	})
}
