package services

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var r2Client *s3.Client
var bucketName string
var publicURL string

func init() {
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
}

// UploadFile sube un archivo a R2 y devuelve la URL pública
func UploadFile(file io.Reader, filename string, contentType string, fileType string, id string) (string, error) {
	ext := filepath.Ext(filename)
	uniqueID := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(filename))
	
	var key string
	switch fileType {
	case "profile":
		key = fmt.Sprintf("profiles/%s/%s%s", id, uniqueID, ext)
	case "post":
		key = fmt.Sprintf("posts/%s/%s%s", id, uniqueID, ext)
	case "story":
		key = fmt.Sprintf("stories/%s/%s%s", id, uniqueID, ext)
	case "chat":
		key = fmt.Sprintf("chats/%s/%s%s", id, uniqueID, ext)
	default:
		key = fmt.Sprintf("misc/%s%s", uniqueID, ext)
	}

	_, err := r2Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}

	return GetPublicURL(key), nil
}

func GetPublicURL(key string) string {
	return fmt.Sprintf("%s/%s", publicURL, key)
}

func DeleteFile(key string) error {
	_, err := r2Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	})
	return err
}

func ExtractKeyFromURL(url string) string {
	if len(url) == 0 {
		return ""
	}
	prefix := publicURL + "/"
	if idx := strings.Index(url, prefix); idx != -1 {
		return url[idx+len(prefix):]
	}
	return ""
}
