package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

var r2Client *s3.Client
var bucketName string

func init() {
	godotenv.Load(".env")

	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKeyID := os.Getenv("R2_ACCESS_KEY_ID")
	secretAccessKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucketName = os.Getenv("R2_BUCKET_NAME")

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
}

func main() {
	fmt.Println("Deleting all objects with prefix 'misc/'...")
	
	var continuationToken *string
	deletedCount := 0
	
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
			fmt.Printf("Deleting: %s\n", key)
			
			_, err := r2Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
				Bucket: aws.String(bucketName),
				Key:    aws.String(key),
			})
			if err != nil {
				log.Printf("Failed to delete %s: %v", key, err)
			} else {
				deletedCount++
			}
		}

		if output.NextContinuationToken == nil {
			break
		}
		continuationToken = output.NextContinuationToken
	}

	fmt.Printf("\nDeleted %d objects from misc/\n", deletedCount)
	fmt.Println("Cleanup completed!")
}
