package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

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

func moveFileInR2(oldKey, newKey string) error {
	copySource := fmt.Sprintf("%s/%s", bucketName, oldKey)
	
	_, err := r2Client.CopyObject(context.TODO(), &s3.CopyObjectInput{
		Bucket:     aws.String(bucketName),
		CopySource: aws.String(copySource),
		Key:        aws.String(newKey),
	})
	if err != nil {
		return err
	}

	_, err = r2Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(oldKey),
	})
	return err
}

func extractKeyFromURL(url string) string {
	if url == "" {
		return ""
	}
	prefix := publicURL + "/"
	if idx := strings.Index(url, prefix); idx != -1 {
		return url[idx+len(prefix):]
	}
	return ""
}

func main() {
	// Process profile photos
	var users []User
	db.Find(&users)
	
	for _, user := range users {
		if user.Photo == "" {
			continue
		}
		
		oldKey := extractKeyFromURL(user.Photo)
		if oldKey == "" || !strings.Contains(oldKey, "misc/") {
			continue
		}
		
		filename := filepath.Base(oldKey)
		newKey := fmt.Sprintf("profiles/%s", filename)
		
		fmt.Printf("Moving profile photo: %s -> %s\n", oldKey, newKey)
		if err := moveFileInR2(oldKey, newKey); err != nil {
			log.Printf("Failed to move %s: %v", oldKey, err)
			continue
		}
		
		newURL := fmt.Sprintf("%s/%s", publicURL, newKey)
		db.Model(&User{}).Where("id = ?", user.ID).Update("photo", newURL)
	}

	// Process post images
	var posts []Post
	db.Find(&posts)
	
	for _, post := range posts {
		if post.ImageURL == "" {
			continue
		}
		
		oldKey := extractKeyFromURL(post.ImageURL)
		if oldKey == "" || !strings.Contains(oldKey, "misc/") {
			continue
		}
		
		filename := filepath.Base(oldKey)
		newKey := fmt.Sprintf("posts/%s", filename)
		
		fmt.Printf("Moving post image: %s -> %s\n", oldKey, newKey)
		if err := moveFileInR2(oldKey, newKey); err != nil {
			log.Printf("Failed to move %s: %v", oldKey, err)
			continue
		}
		
		newURL := fmt.Sprintf("%s/%s", publicURL, newKey)
		db.Model(&Post{}).Where("id = ?", post.ID).Update("image_url", newURL)
	}

	// Process story images
	var stories []Story
	db.Find(&stories)
	
	for _, story := range stories {
		if story.ImageURL == "" {
			continue
		}
		
		oldKey := extractKeyFromURL(story.ImageURL)
		if oldKey == "" || !strings.Contains(oldKey, "misc/") {
			continue
		}
		
		filename := filepath.Base(oldKey)
		newKey := fmt.Sprintf("stories/%s", filename)
		
		fmt.Printf("Moving story image: %s -> %s\n", oldKey, newKey)
		if err := moveFileInR2(oldKey, newKey); err != nil {
			log.Printf("Failed to move %s: %v", oldKey, err)
			continue
		}
		
		newURL := fmt.Sprintf("%s/%s", publicURL, newKey)
		db.Model(&Story{}).Where("id = ?", story.ID).Update("image_url", newURL)
	}

	fmt.Println("Reorganization completed successfully!")
}

