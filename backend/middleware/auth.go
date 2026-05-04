package middleware

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type userCacheEntry struct {
	role            string
	isSuspended     bool
	suspendedUntil  *time.Time
	suspensionReason string
	expiresAt       time.Time
}

var (
	userCache = make(map[uint]userCacheEntry)
	cacheMu   sync.RWMutex
	cacheTTL  = 5 * time.Minute
)

func getCachedUser(userId uint) (userCacheEntry, bool) {
	cacheMu.RLock()
	defer cacheMu.RUnlock()
	entry, ok := userCache[userId]
	if ok && time.Now().Before(entry.expiresAt) {
		return entry, true
	}
	return userCacheEntry{}, false
}

func setCachedUser(userId uint, entry userCacheEntry) {
	entry.expiresAt = time.Now().Add(cacheTTL)
	cacheMu.Lock()
	defer cacheMu.Unlock()
	userCache[userId] = entry
}

func InvalidateUserCache(userId uint) {
	cacheMu.Lock()
	defer cacheMu.Unlock()
	delete(userCache, userId)
}

// Función unificada para garantizar la misma firma en toda la app
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "secreto-super-seguro"
	}
	return secret
}

func IsAuthenticated(c *fiber.Ctx) error {
	tokenString := c.Cookies("jwt")

	if tokenString == "" {
		authHeader := c.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "No autenticado"})
	}

	// Parsing seguro con la misma firma del controlador
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado")
		}
		return []byte(getJWTSecret()), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token inválido o expirado"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Claims inválidos"})
	}

	var userIdFloat float64
	if id, ok := claims["id"].(float64); ok {
		userIdFloat = id
	} else if sub, ok := claims["sub"].(float64); ok {
		userIdFloat = sub
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "ID de usuario no encontrado en el token"})
	}

	userId := uint(userIdFloat)

	var user models.User

	if cached, ok := getCachedUser(userId); ok {
		user.ID = userId
		user.Role = cached.role
		user.IsSuspended = cached.isSuspended
		user.SuspendedUntil = cached.suspendedUntil
		user.SuspensionReason = cached.suspensionReason
	} else {
		if err := database.DB.Select("id, role, is_suspended, suspended_until, suspension_reason").First(&user, userId).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Usuario no encontrado o eliminado"})
		}
		setCachedUser(userId, userCacheEntry{
			role:            user.Role,
			isSuspended:     user.IsSuspended,
			suspendedUntil:  user.SuspendedUntil,
			suspensionReason: user.SuspensionReason,
		})
	}

	if user.IsSuspended {
		if user.SuspendedUntil != nil && user.SuspendedUntil.Before(time.Now()) {
			database.DB.Model(&user).Updates(map[string]interface{}{
				"is_suspended":      false,
				"suspended_until":   nil,
				"suspension_reason": "",
			})
			setCachedUser(userId, userCacheEntry{
				role:            user.Role,
				isSuspended:     false,
				suspendedUntil:  nil,
				suspensionReason: "",
			})
		} else {
			response := fiber.Map{
				"error":         "Tu cuenta ha sido suspendida. " + user.SuspensionReason,
				"is_suspended":  true,
				"suspension_reason": user.SuspensionReason,
			}
			if user.SuspendedUntil != nil {
				response["suspended_until"] = user.SuspendedUntil.Format(time.RFC3339)
			}
			return c.Status(fiber.StatusForbidden).JSON(response)
		}
	}

	var maintenance models.Setting
	// ✅ FIX: Se cambió First() por Find() para evitar el spam en consola si la tabla está vacía
	database.DB.Where("key = ?", "maintenance_mode").Find(&maintenance)

	if maintenance.Value == "true" {
		validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}
		if !validRoles[user.Role] {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"error":       "La plataforma se encuentra en mantenimiento programado. Intenta de nuevo más tarde.",
				"maintenance": true,
			})
		}
	}

	c.Locals("userId", userIdFloat)
	c.Locals("userRole", user.Role)

	return c.Next()
}

func IsAdmin(c *fiber.Ctx) error {
	role := c.Locals("userRole")
	if role == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado."})
	}

	roleStr := role.(string)
	validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}

	if !validRoles[roleStr] {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acceso denegado. Privilegios de administrador requeridos."})
	}

	return c.Next()
}

func IsSuperAdmin(c *fiber.Ctx) error {
	role := c.Locals("userRole")
	if role == nil || role.(string) != "superadmin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Zona de alto riesgo. Acceso restringido exclusivamente a SuperAdministradores."})
	}
	return c.Next()
}
