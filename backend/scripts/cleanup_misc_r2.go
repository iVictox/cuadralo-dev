package main

import (
	"context"
	"fmt"
	"log"
	"os"
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
		log.Fatalf("Unable to load SDK config: %v", err)
	}

	r2Client = s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID))
	})

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("R2_BUCKET_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
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

func main() {
	// List all objects with prefix "misc/"
	fmt.Println("Listing objects in misc/...")
	
	var continuationToken *string
	chatImagesMoved := 0
	filesDeleted := 0
	
	for {
		output, err := r2Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
			Bucket:            aws.String(bucketName),
			Prefix:            aws.String("misc/"),
			ContinuationToken: continuationToken,
		})
		if err != nil {
			log.Fatalf("Failed to list objects: %v", err)
		}

		for _, obj := range output.Contents {
			key := *obj.Key
			filename := key[len("misc/"):]
			
			// Check if this is a chat image
			url := fmt.Sprintf("%s/%s", publicURL, key)
			var message Message
			result := db.Where("content = ? AND type IN ?", url, []string{"image", "image_once"}).First(&message)
			
			if result.Error == nil {
				// This is a chat image, move it to chats/
				newKey := fmt.Sprintf("chats/%s", filename)
				fmt.Printf("Moving chat image: %s -> %s\n", key, newKey)
				if err := moveFileInR2(key, newKey); err != nil {
					log.Printf("Failed to move %s: %v", key, err)
				} else {
					newURL := fmt.Sprintf("%s/%s", publicURL, newKey)
					db.Model(&Message{}).Where("id = ?", message.ID).Update("content", newURL)
					chatImagesMoved++
				}
			} else {
				// Not referenced, delete it
				fmt.Printf("Deleting orphaned file: %s\n", key)
				_, err := r2Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
					Bucket: aws.String(bucketName),
					Key:    aws.String(key),
				})
				if err != nil {
					log.Printf("Failed to delete %s: %v", key, err)
				} else {
					filesDeleted++
				}
			}
		}

		if output.NextContinuationToken == nil {
			break
		}
		continuationToken = output.NextContinuationToken
	}

	fmt.Printf("\nCleanup completed!\n")
	fmt.Printf("Chat images moved to chats/: %d\n", chatImagesMoved)
	fmt.Printf("Orphaned files deleted: %d\n", filesDeleted)
}
