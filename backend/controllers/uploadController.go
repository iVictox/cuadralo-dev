package controllers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"cuadralo-backend/services"
)

func UploadFile(c *fiber.Ctx) error {
	// 1. Obtener tipo de archivo y ID del formulario
	fileType := c.FormValue("type")
	if fileType == "" {
		fileType = "profile" // valor por defecto si no se envía
	}
	id := c.FormValue("id")
	if id == "" {
		id = "0"
	}

	// 2. Obtener el archivo del formulario
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "No se subió ninguna imagen"})
	}

	// 3. Validar tamaño (Max 5MB)
	if fileHeader.Size > 5*1024*1024 {
		return c.Status(400).JSON(fiber.Map{"error": "La imagen es muy pesada (Max 5MB)"})
	}

	// 4. Abrir el archivo para obtener el reader
	src, err := fileHeader.Open()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error al abrir el archivo"})
	}
	defer src.Close()

	// 5. Obtener el tipo de contenido
	contentType := fileHeader.Header.Get("Content-Type")

	// 6. Subir a Cloudflare R2 usando el servicio
	url, err := services.UploadFile(src, fileHeader.Filename, contentType, fileType, id)
	if err != nil {
		fmt.Println("Error subiendo a R2:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error interno subiendo el archivo"})
	}

	// 7. Devolver la URL pública de R2
	return c.JSON(fiber.Map{
		"url": url,
	})
}
