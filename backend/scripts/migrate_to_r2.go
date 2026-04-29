package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/joho/godotenv"
)

var r2Client *s3.Client
var bucketName string
var publicURL string
var db *gorm.DB

type User struct {
	ID    uint
	Photo string
}

type Post struct {
	ID       uint
	ImageURL string
}

type Story struct {
	ID       uint
	ImageURL string
}

type Message struct {
	ID      uint
	Content string
	Type    string
}

func init() {
	godotenv.Load(".env")

	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKeyID := os.Getenv("R2_ACCESS_KEY_ID")
	secretAccessKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucketName = os.Getenv("R2_BUCKET_NAME")
	publicURL = os.Getenv("R2_PUBLIC_URL")

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, ""),
		),
		config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatalf("Unable to load SDK config, %v", err)
	}

	r2Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID))
	})

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
}

func uploadFile(localPath string, key string) error {
	file, err := os.Open(localPath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = r2Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
		Body:   file,
	})
	return err
}

func getPublicURL(key string) string {
	return fmt.Sprintf("%s/%s", publicURL, key)
}

func main() {
	uploadsDir := "./uploads"
	
	err := filepath.Walk(uploadsDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		filename := info.Name()
		key := fmt.Sprintf("misc/%s", filename)
		
		fmt.Printf("Uploading %s to R2...\n", filename)
		if err := uploadFile(path, key); err != nil {
			log.Printf("Failed to upload %s: %v", filename, err)
			return nil
		}

		newURL := getPublicURL(key)
		
		// Update users.photo
		db.Model(&User{}).Where("photo LIKE ?", "%"+filename).Update("photo", newURL)
		
		// Update posts.image_url
		db.Model(&Post{}).Where("image_url LIKE ?", "%"+filename).Update("image_url", newURL)
		
		// Update stories.image_url
		db.Model(&Story{}).Where("image_url LIKE ?", "%"+filename).Update("image_url", newURL)
		
		// Update messages.content where type is image
		db.Model(&Message{}).Where("content LIKE ? AND type IN ?", "%"+filename, []string{"image", "image_once"}).Update("content", newURL)

		fmt.Printf("Updated %s -> %s\n", filename, newURL)
		return nil
	})

	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	fmt.Println("Migration completed successfully!")
}
