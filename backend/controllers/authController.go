package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"crypto/rand"
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func generateSecureToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func SendEmail(smtpHost, smtpPort, smtpUser, smtpPass, from, to string, msg []byte) error {
	addr := smtpHost + ":" + smtpPort
	
	// Convertir el puerto a entero
	port := 587
	fmt.Sscanf(smtpPort, "%d", &port)
	
	// Configurar TLS
	tlsConfig := &tls.Config{
		ServerName: smtpHost,
		InsecureSkipVerify: false,
	}
	
	// Conectar con STARTTLS
	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		// Si falla la conexión TLS directa, intentar con el método normal
		return sendEmailNormal(smtpHost, smtpPort, smtpUser, smtpPass, from, to, msg)
	}
	
	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("client error: %v", err)
	}
	
	// Auth
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	err = client.Auth(auth)
	if err != nil {
		return fmt.Errorf("auth error: %v", err)
	}
	
	// From
	err = client.Mail(from)
	if err != nil {
		return fmt.Errorf("mail error: %v", err)
	}
	
	// To
	err = client.Rcpt(to)
	if err != nil {
		return fmt.Errorf("rcpt error: %v", err)
	}
	
	// Data
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("data error: %v", err)
	}
	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("write error: %v", err)
	}
	err = w.Close()
	if err != nil {
		return fmt.Errorf("close error: %v", err)
	}
	
	err = client.Quit()
	if err != nil {
		return fmt.Errorf("quit error: %v", err)
	}
	
	return nil
}

func sendEmailNormal(smtpHost, smtpPort, smtpUser, smtpPass, from, to string, msg []byte) error {
	addr := smtpHost + ":" + smtpPort
	
	// Intentar método estándar
	err := smtp.SendMail(addr, smtp.PlainAuth("", smtpUser, smtpPass, smtpHost), from, []string{to}, msg)
	if err != nil {
		return fmt.Errorf("error sending email: %v", err)
	}
	return nil
}

// ✅ FIX CRÍTICO: Misma función de firma que el middleware
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "secreto-super-seguro"
	}
	return secret
}

type RegisterDTO struct {
	Name        string   `json:"name"`
	Username    string   `json:"username"`
	Email       string   `json:"email"`
	Password    string   `json:"password"`
	BirthDate   string   `json:"birthDate"`
	Gender      string   `json:"gender"`
	Photo       string   `json:"photo"`
	Photos      []string `json:"photos"`
	Bio         string   `json:"bio"`
	Latitude    float64  `json:"latitude"`
	Longitude   float64  `json:"longitude"`
	Location    string   `json:"location"`
	Interests   []string `json:"interests"`
	Preferences struct {
		Distance int    `json:"distance"`
		Show     string `json:"show"`
		AgeRange []int  `json:"ageRange"`
	} `json:"preferences"`
}

func Register(c *fiber.Ctx) error {
	var maintenance models.Setting
	database.DB.Where("key = ?", "maintenance_mode").First(&maintenance)
	if maintenance.Value == "true" {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Los registros están deshabilitados temporalmente por mantenimiento general.",
		})
	}

	var data RegisterDTO
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(data.Password), 14)

	birthTime, err := time.Parse("2006-01-02", data.BirthDate)
	if err != nil {
		birthTime = time.Now().AddDate(-18, 0, 0)
	}

	username := strings.ToLower(strings.ReplaceAll(data.Username, " ", ""))
	if username == "" {
		cleanName := strings.ToLower(strings.ReplaceAll(data.Name, " ", ""))
		username = fmt.Sprintf("%s%d", cleanName, time.Now().Unix()%1000)
	}

	mainPhoto := data.Photo
	if len(data.Photos) > 0 && mainPhoto == "" {
		mainPhoto = data.Photos[0]
	}

	user := models.User{
		Name:      data.Name,
		Username:  username,
		Email:     data.Email,
		Password:  string(password),
		BirthDate: birthTime,
		Gender:    data.Gender,
		Photo:     mainPhoto,
		Photos:    data.Photos,
		Bio:       data.Bio,
		Latitude:  data.Latitude,
		Longitude: data.Longitude,
		Location:  data.Location,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		if strings.Contains(err.Error(), "username") {
			return c.Status(400).JSON(fiber.Map{"error": "Ese nombre de usuario ya está en uso."})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Error al crear cuenta. El email o usuario ya existe."})
	}

	if len(data.Interests) > 0 {
		var finalInterests []models.Interest
		for _, slug := range data.Interests {
			var interest models.Interest
			database.DB.Where(models.Interest{Slug: slug}).FirstOrCreate(&interest, models.Interest{
				Name:     slug,
				Slug:     slug,
				Category: "General",
			})
			finalInterests = append(finalInterests, interest)
		}
		database.DB.Model(&user).Association("Interests").Append(finalInterests)
	}

	return c.JSON(fiber.Map{
		"message":  "Usuario registrado",
		"username": username,
	})
}

func Login(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	email := strings.TrimSpace(data["email"])
	password := strings.TrimSpace(data["password"])

	var user models.User
	database.DB.Where("email = ?", email).First(&user)
	if user.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}

	if user.IsSuspended {
		if user.SuspendedUntil != nil && user.SuspendedUntil.Before(time.Now()) {
			database.DB.Model(&user).Updates(map[string]interface{}{
				"is_suspended":      false,
				"suspended_until":   nil,
				"suspension_reason": "",
			})
		} else {
			response := fiber.Map{
				"error":        "Tu cuenta ha sido suspendida y no puedes iniciar sesión. " + user.SuspensionReason,
				"is_suspended": true,
				"suspension_reason": user.SuspensionReason,
			}
			if user.SuspendedUntil != nil {
				response["suspended_until"] = user.SuspendedUntil.Format(time.RFC3339)
			}
			return c.Status(fiber.StatusForbidden).JSON(response)
		}
	}

	var maintenance models.Setting
	database.DB.Where("key = ?", "maintenance_mode").First(&maintenance)
	if maintenance.Value == "true" {
		validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}
		if !validRoles[user.Role] {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"error":       "La plataforma está en mantenimiento. No se permiten accesos en este momento.",
				"maintenance": true,
			})
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": float64(user.ID),
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	// Se usa getJWTSecret()
	t, err := token.SignedString([]byte(getJWTSecret()))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error generando token"})
	}

	cookie := new(fiber.Cookie)
	cookie.Name = "jwt"
	cookie.Value = t
	cookie.Expires = time.Now().Add(time.Hour * 24 * 30)
	cookie.HTTPOnly = true
	c.Cookie(cookie)

	return c.JSON(fiber.Map{
		"message": "Login exitoso",
		"token":   t,
		"user": fiber.Map{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"email":    user.Email,
			"photo":    user.Photo,
			"role":     user.Role,
			"is_prime": user.IsPrime,
		},
	})
}

func CheckAvailability(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	username := strings.TrimSpace(strings.ToLower(data["username"]))
	email := strings.TrimSpace(strings.ToLower(data["email"]))

	result := fiber.Map{
		"usernameAvailable": true,
		"emailAvailable":   true,
	}

	if username != "" {
		var existingUser models.User
		database.DB.Where("username = ?", username).First(&existingUser)
		if existingUser.ID != 0 {
			result["usernameAvailable"] = false
		}
	}

	if email != "" {
		var existingEmail models.User
		database.DB.Where("email = ?", email).First(&existingEmail)
		if existingEmail.ID != 0 {
			result["emailAvailable"] = false
		}
	}

	return c.JSON(result)
}

func ForgotPassword(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	email := strings.TrimSpace(strings.ToLower(data["email"]))
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "El correo electrónico es requerido"})
	}

	var user models.User
	database.DB.Where("email = ?", email).First(&user)
	if user.ID == 0 {
		return c.JSON(fiber.Map{"message": "Si el correo existe, recibirás un enlace para restaurar tu contraseña"})
	}

	// Verificar si ya hay un token activo reciente (24 horas)
	var existingReset models.PasswordReset
	database.DB.Where("user_id = ? AND used = ? AND expires_at > ?", user.ID, false, time.Now()).First(&existingReset)
	if existingReset.ID != 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Ya has solicitado un enlace recently. Espera 24 horas antes de pedir otro."})
	}

	// Generar token seguro
	secureToken := generateSecureToken()
	expiresAt := time.Now().Add(24 * time.Hour)

	// Guardar token en DB
	reset := models.PasswordReset{
		UserID:    user.ID,
		Email:    email,
		Token:    secureToken,
		ExpiresAt: expiresAt,
		Used:     false,
	}
	database.DB.Create(&reset)

	// URLs
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, secureToken)

	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASSWORD")
	fromEmail := os.Getenv("FROM_EMAIL")

	if smtpHost == "" || smtpUser == "" {
		return c.JSON(fiber.Map{
			"message":     "Si el correo existe, recibirás un enlace para restaurar tu contraseña",
			"debug_token": secureToken,
			"debug_url":  resetURL,
		})
	}

subject := "Restablece tu contraseña - Cuadralo"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - Cuadralo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table cellpadding="0" cellspacing="0" width="100%%" style="background-color: #f8f9fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Card -->
                <table cellpadding="0" cellspacing="0" width="100%%" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #F20B8E 0%%, #8B5CF6 100%%);">
                            <img src="https://cuadralo.club/logo.svg" alt="Cuadralo" style="width: 220px; height: auto; filter: brightness(0) invert(1);">
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0 0 16px; font-size: 26px; color: #1a1a2e; font-weight: 800; line-height: 1.2;">
                                ¿Olvidaste tu contraseña?
                            </h1>
                            <p style="margin: 0; font-size: 15px; color: #4a4a6a; line-height: 1.6;">
                                No te preocupes, nos pasa a todos. Te ayudamos a recuperar tu cuenta para que sigas conectando.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Botón -->
                    <tr>
                        <td style="padding: 0 40px 30px; text-align: center;">
                            <a href="%s" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F20B8E 0%%, #8B5CF6 100%%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 50px;">
                                Restablecer mi contraseña
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Instrucciones -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <div style="background: #f5f3ff; border-radius: 12px; padding: 20px;">
                                <p style="margin: 0 0 12px; font-size: 14px; color: #6b21a8; font-weight: 600;">
                                    ¿Qué hacer?
                                </p>
                                <ol style="margin: 0; padding-left: 18px; font-size: 14px; color: #4a4a6a; line-height: 1.8;">
                                    <li>Haz clic en el botón de arriba</li>
                                    <li>Ingresa una nueva contraseña</li>
                                    <li>¡Listo! Vuelve a entrar</li>
                                </ol>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Warning -->
                    <tr>
                        <td style="padding: 20px 40px 40px; text-align: center;">
                            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px;">
                                <p style="margin: 0; font-size: 12px; color: #b91c1c; line-height: 1.5;">
                                    <strong>Importante:</strong> Este enlace caduca en 24 horas. Si no solicitaste este cambio, puedes ignorarlo. Tu cuenta está segura.
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- Footer -->
                <table cellpadding="0" cellspacing="0" width="100%%" style="max-width: 480px; padding-top: 24px;">
                    <tr>
                        <td style="padding: 16px 0; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                                ¿Necesitas ayuda? <a href="mailto:soporte@cuadralo.club" style="color: #F20B8E; text-decoration: none;">Escríbenos</a>
                            </p>
                            <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">
                                Cuadralo - Conectando corazones
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`, resetURL)

	from := fmt.Sprintf("Cuadralo <%s>", fromEmail)
	headers := fmt.Sprintf("From: %s\r\nContent-Type: text/html; charset=utf-8\r\nMIME-Version: 1.0", from)

	msg := []byte("To: " + email + "\r\n" + headers + "\r\nSubject: " + subject + "\r\n\r\n" + body)

	err := SendEmail(smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, email, msg)
	if err != nil {
		return c.JSON(fiber.Map{
			"message":     "Si el correo existe, recibirás un enlace para restaurar tu contraseña",
			"send_error":  err.Error(),
			"debug_token": secureToken,
			"debug_url":  resetURL,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Si el correo existe, recibirás un enlace para restaurar tu contraseña",
		"debug":   true,
	})
}

func ResetPassword(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	token := strings.TrimSpace(data["token"])
	newPassword := strings.TrimSpace(data["newPassword"])

	if token == "" || newPassword == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Token y nueva contraseña son requeridos"})
	}

	// Buscar token en la DB - verificación EXACTA
	var reset models.PasswordReset
	result := database.DB.Where("token = ? AND used = ? AND expires_at > ?", token, false, time.Now()).First(&reset)
	
	if result.Error != nil || reset.ID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Token inválido, ya utilizado o expirado"})
	}

	// Verificar expiración
	if time.Now().After(reset.ExpiresAt) {
		return c.Status(400).JSON(fiber.Map{"error": "El enlace ha expirado. Solicita uno nuevo."})
	}

	// Obtener usuario
	var user models.User
	database.DB.First(&user, reset.UserID)
	if user.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Hashear nueva contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), 14)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al hashear la contraseña"})
	}

	// Actualizar contraseña
	database.DB.Model(&user).Update("password", string(hashedPassword))

	// Marcar token como usado
	database.DB.Model(&reset).Update("used", true)

	// Invalidar otros tokens activos del usuario
	database.DB.Model(&models.PasswordReset{}).Where("user_id = ? AND used = ?", user.ID, false).Update("used", true)

	return c.JSON(fiber.Map{"message": "Contraseña actualizada correctamente"})
}

func ValidateResetToken(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	token := strings.TrimSpace(data["token"])
	if token == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Token requerido"})
	}

	// Verificación exacta del token
	var reset models.PasswordReset
	result := database.DB.Where("token = ? AND used = ? AND expires_at > ?", token, false, time.Now()).First(&reset)
	
	if result.Error != nil || reset.ID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Token inválido o expirado"})
	}

	// Obtener email del usuario
	var user models.User
	database.DB.First(&user, reset.UserID)
	
	return c.JSON(fiber.Map{"valid": true, "email": user.Email})
}

func GoogleLogin(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	email := strings.TrimSpace(data["email"])

	var user models.User
	database.DB.Where("email = ?", email).First(&user)

	if user.ID == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado. Por favor, regístrate primero."})
	}

	if user.IsSuspended {
		if user.SuspendedUntil != nil && user.SuspendedUntil.Before(time.Now()) {
			database.DB.Model(&user).Updates(map[string]interface{}{
				"is_suspended":      false,
				"suspended_until":   nil,
				"suspension_reason": "",
			})
		} else {
			response := fiber.Map{
				"error":        "Tu cuenta ha sido suspendida.",
				"is_suspended": true,
				"suspension_reason": user.SuspensionReason,
			}
			if user.SuspendedUntil != nil {
				response["suspended_until"] = user.SuspendedUntil.Format(time.RFC3339)
			}
			return c.Status(fiber.StatusForbidden).JSON(response)
		}
	}

	var maintenance models.Setting
	database.DB.Where("key = ?", "maintenance_mode").First(&maintenance)
	if maintenance.Value == "true" {
		validRoles := map[string]bool{"superadmin": true, "admin": true, "moderator": true, "support": true}
		if !validRoles[user.Role] {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Plataforma en mantenimiento.", "maintenance": true})
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": float64(user.ID),
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	// Se usa getJWTSecret()
	t, err := token.SignedString([]byte(getJWTSecret()))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error generando token"})
	}

	cookie := new(fiber.Cookie)
	cookie.Name = "jwt"
	cookie.Value = t
	cookie.Expires = time.Now().Add(time.Hour * 24 * 30)
	cookie.HTTPOnly = true
	c.Cookie(cookie)

	return c.JSON(fiber.Map{
		"message": "Login exitoso con Google",
		"token":   t,
		"user": fiber.Map{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"email":    user.Email,
			"photo":    user.Photo,
			"role":     user.Role,
			"is_prime": user.IsPrime,
		},
	})
}
