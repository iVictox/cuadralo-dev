package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

// DTO para la petición desde el frontend
type VerifyFaceRequest struct {
	Success bool    `json:"success"`
	Score   float64 `json:"score"`
	Image   string  `json:"image"` // Base64 o URL de la foto capturada (para el admin)
}

// VerifyFace procesa el resultado del reconocimiento facial ejecutado en el cliente
func VerifyFace(c *fiber.Ctx) error {
	userID := uint(c.Locals("userId").(float64))

	var req VerifyFaceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Verificar bloqueo de 24 horas
	if user.LastVerificationAttempt != nil {
		nextAttempt := user.LastVerificationAttempt.Add(24 * time.Hour)
		if time.Now().Before(nextAttempt) {
			hoursLeft := int(time.Until(nextAttempt).Hours())
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": fmt.Sprintf("Verificación bloqueada. Inténtalo de nuevo en %d horas.", hoursLeft),
			})
		}
	}

	// Si ya está verificado, no hacer nada
	if user.IsVerified {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "El usuario ya está verificado."})
	}

	// Crear registro de historial
	history := models.VerificationHistory{
		UserID:    userID,
		Success:   req.Success,
		Score:     req.Score,
		PhotoURL:  req.Image, // En producción se recomienda guardar la imagen y poner la URL real
		CreatedAt: time.Now(),
	}

	if req.Success {
		// Aprobar
		history.Reason = "Aprobado automáticamente por Face-API"
		user.IsVerified = true
		user.VerificationBadge = "blue"
		
		database.DB.Create(&history)
		database.DB.Save(&user)

		return c.JSON(fiber.Map{"message": "¡Cuenta verificada exitosamente!", "is_verified": true})
	} else {
		// Rechazar y bloquear
		history.Reason = "Rostro no coincide con fotos de perfil"
		now := time.Now()
		user.LastVerificationAttempt = &now

		database.DB.Create(&history)
		database.DB.Save(&user)

		return c.Status(fiber.StatusNotAcceptable).JSON(fiber.Map{
			"error": "No se ha podido comprobar su rostro. Verificación denegada. Debe volver a intentarlo en 24 horas.",
		})
	}
}

// ===============================
// CONTROLADORES DE ADMINISTRADOR
// ===============================

// AdminListVerifications devuelve lista de verificaciones con sus usuarios
func AdminListVerifications(c *fiber.Ctx) error {
	var histories []models.VerificationHistory
	// Preload del usuario para mostrar datos en panel
	database.DB.Preload("User").Order("created_at desc").Find(&histories)
	return c.JSON(histories)
}

// AdminApproveVerification aprueba manualmente a un usuario
func AdminApproveVerification(c *fiber.Ctx) error {
	userID := c.Params("id")
	
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	user.IsVerified = true
	user.VerificationBadge = "blue"
	user.LastVerificationAttempt = nil // Reset lock just in case
	database.DB.Save(&user)

	// Agregar al historial la acción manual
	database.DB.Create(&models.VerificationHistory{
		UserID:    user.ID,
		Success:   true,
		Reason:    "Aprobado manualmente por Admin",
		CreatedAt: time.Now(),
	})

	return c.JSON(fiber.Map{"message": "Usuario verificado manualmente"})
}

// AdminRejectVerification rechaza manualmente a un usuario
func AdminRejectVerification(c *fiber.Ctx) error {
	userID := c.Params("id")
	
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	user.IsVerified = false
	user.VerificationBadge = "none"
	database.DB.Save(&user)

	database.DB.Create(&models.VerificationHistory{
		UserID:    user.ID,
		Success:   false,
		Reason:    "Rechazado manualmente por Admin",
		CreatedAt: time.Now(),
	})

	return c.JSON(fiber.Map{"message": "Verificación removida"})
}

// AdminResetVerificationLock resetea el bloqueo de 24h
func AdminResetVerificationLock(c *fiber.Ctx) error {
	userID := c.Params("id")
	
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	user.LastVerificationAttempt = nil
	database.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Bloqueo de 24 horas reseteado para este usuario"})
}
