package main

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/routes"
	"cuadralo-backend/websockets"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// 1. Conectar a Base de Datos
	database.Connect()

	// 2. Ejecutar Migraciones Automáticas
	database.DB.AutoMigrate(
		&models.User{},
		&models.Like{},
		&models.Match{},
		&models.Message{},
		&models.Post{},
		&models.Comment{},
		&models.Story{},
		&models.StoryView{},
		&models.Notification{},
		&models.PostLike{},
		&models.CommentLike{},
		&models.Transaction{}, // Historial de Pagos
		&models.Report{},      // Reportes de usuarios, posts y comentarios
		&models.PasswordReset{}, // Recuperación de contraseña
		&models.Flash{},      // Destellos para boost de apariciones
	)

	// 3. Iniciar Hub de WebSockets (en segundo plano)
	go websockets.MainHub.Run()

	// 4. Cron Job: Limpieza de mensajes efímeros (cada hora)
	go func() {
		for {
			time.Sleep(1 * time.Hour)

			// Borrar mensajes con > 24h de antigüedad que NO estén guardados
			expirationTime := time.Now().Add(-24 * time.Hour)
			result := database.DB.Where("created_at < ? AND is_saved = ?", expirationTime, false).Delete(&models.Message{})

			if result.RowsAffected > 0 {
				log.Printf("🧹 Limpieza automática: %d mensajes efímeros eliminados.", result.RowsAffected)
			}
		}
	}()

	// 5. Cron Job: Verificar destellos próximos a expirar (cada minuto)
	go func() {
		for {
			time.Sleep(1 * time.Minute)

			// Notificar a usuarios whose flash expires in 5 minutes
			expiringIn5Min := time.Now().Add(5 * time.Minute)
			notExpiringYet := time.Now().Add(6 * time.Minute)
			var flashesExpiring []models.Flash
			database.DB.Preload("User").Preload("User.SentNotifications").
				Where("ends_at BETWEEN ? AND ?", notExpiringYet, expiringIn5Min).
				Find(&flashesExpiring)

			for _, flash := range flashesExpiring {
				// Verificar que no haya enviado ya la notificación de 5 min
				alreadySent := false
				for _, n := range flash.User.SentNotifications {
					if n.Type == "flash_expiring" && n.FlashID != nil && *n.FlashID == flash.ID {
						alreadySent = true
						break
					}
				}
				if !alreadySent {
					notification := models.Notification{
						UserID: flash.UserID,
						Type:   "flash_expiring",
						FlashID: &flash.ID,
						Title:  "Tu Destello está por finalizar",
						Body:   "Te quedan 5 minutos de Destello. ¡Rápido, sigue cuadrando!",
					}
					database.DB.Create(&notification)
					websockets.SendToUser(fmt.Sprintf("%d", flash.UserID), "notification", notification.ToMap())
					log.Printf("⚡ Destello de usuario %d expirando en 5 min, notificación enviada.", flash.UserID)
				}
			}
		}
	}()

	// 6. Cron Job: Procesar destellos expirados (cada minuto)
	go func() {
		for {
			time.Sleep(1 * time.Minute)

			var expiredFlashes []models.Flash
			database.DB.Preload("User").Preload("User.SentNotifications").
				Where("ends_at < ?", time.Now()).
				Find(&expiredFlashes)

			for _, flash := range expiredFlashes {
				// Verificar que no haya enviado ya la notificación de fin
				alreadySent := false
				for _, n := range flash.User.SentNotifications {
					if n.Type == "flash_ended" && n.FlashID != nil && *n.FlashID == flash.ID {
						alreadySent = true
						break
					}
				}
				if !alreadySent {
					notification := models.Notification{
						UserID: flash.UserID,
						Type:   "flash_ended",
						FlashID: &flash.ID,
						Title:  "Tu Destello ha finalizado",
						Body:   "Tu Destello " + flash.Type.GetName() + " ha terminado. Volviste a la normalidad.",
					}
					database.DB.Create(&notification)
					websockets.SendToUser(fmt.Sprintf("%d", flash.UserID), "notification", notification.ToMap())
					log.Printf("⚡ Destello de usuario %d finalizado. Alcanzó a %d personas.", flash.UserID, flash.ReachedCount)
				}
			}
		}
	}()

	// 5. Configurar Servidor Fiber
	app := fiber.New(fiber.Config{
		BodyLimit: 15 * 1024 * 1024, // 15 MB
	})

	// Configuración CORS - MODIFICADO SOLO PARA LOCALHOST
	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Upgrade, Connection",
	}))

	// Servir archivos estáticos (imágenes subidas)
	app.Static("/uploads", "./uploads")

	// Middleware para WebSocket Upgrade
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// Ruta WebSocket
	app.Get("/ws/:id", websocket.New(controllers.HandleWebSocket))

	// Configurar Rutas de la API
	routes.Setup(app)

	// Iniciar servidor en puerto 8080
	log.Fatal(app.Listen(":8080"))
}
