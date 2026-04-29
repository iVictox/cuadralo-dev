package controllers

import (
	"cuadralo-backend/database"
	"cuadralo-backend/models"
	"cuadralo-backend/websockets"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ==========================================
// 🚀 FEED Y POSTS
// ==========================================

func GetSocialFeed(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	offset := (page - 1) * limit
	tab := c.Query("tab", "all")

	var posts []models.Post

	query := database.DB.Model(&models.Post{}).Preload("User").Order("created_at desc")

	if tab == "following" {
		var followingIds []uint
		database.DB.Model(&models.Follow{}).Where("follower_id = ?", myId).Pluck("following_id", &followingIds)

		if len(followingIds) == 0 {
			return c.JSON([]models.Post{})
		}

		query = query.Where("user_id IN ?", followingIds)
	}

	query.Limit(limit).Offset(offset).Find(&posts)

	if len(posts) == 0 {
		return c.JSON([]models.Post{})
	}

	userIDs := make([]uint, 0)
	for _, p := range posts {
		userIDs = append(userIDs, p.UserID)
	}

	var activeStories []models.Story
	database.DB.Where("user_id IN ? AND expires_at > ?", userIDs, time.Now()).Find(&activeStories)

	var myViews []models.StoryView
	storyIDs := make([]uint, 0)
	for _, s := range activeStories {
		storyIDs = append(storyIDs, s.ID)
	}
	if len(storyIDs) > 0 {
		database.DB.Where("user_id = ? AND story_id IN ?", myId, storyIDs).Find(&myViews)
	}

	seenMap := make(map[uint]bool)
	for _, v := range myViews {
		seenMap[v.StoryID] = true
	}

	type UserStatus struct {
		HasStory       bool
		HasUnseenStory bool
	}
	userStatusMap := make(map[uint]*UserStatus)

	for _, s := range activeStories {
		if _, exists := userStatusMap[s.UserID]; !exists {
			userStatusMap[s.UserID] = &UserStatus{HasStory: true, HasUnseenStory: false}
		}
		if !seenMap[s.ID] {
			userStatusMap[s.UserID].HasUnseenStory = true
		}
	}

	for i := range posts {
		var count int64
		database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&count)
		posts[i].LikesCount = count

		var commentCount int64
		database.DB.Model(&models.Comment{}).Where("post_id = ?", posts[i].ID).Count(&commentCount)
		posts[i].CommentsCount = commentCount

		var like models.PostLike
		if database.DB.Where("user_id = ? AND post_id = ?", myId, posts[i].ID).Find(&like).RowsAffected > 0 {
			posts[i].IsLiked = true
		}

		if status, ok := userStatusMap[posts[i].UserID]; ok {
			posts[i].User.HasStory = true
			posts[i].User.HasUnseenStory = status.HasUnseenStory
		} else {
			posts[i].User.HasStory = false
			posts[i].User.HasUnseenStory = false
		}
	}

	return c.JSON(posts)
}

func GetSinglePost(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var post models.Post
	if err := database.DB.Preload("User").First(&post, postId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Publicación no encontrada"})
	}

	var count int64
	database.DB.Model(&models.PostLike{}).Where("post_id = ?", post.ID).Count(&count)
	post.LikesCount = count

	var commentCount int64
	database.DB.Model(&models.Comment{}).Where("post_id = ?", post.ID).Count(&commentCount)
	post.CommentsCount = commentCount

	var like models.PostLike
	if database.DB.Where("user_id = ? AND post_id = ?", myId, post.ID).Find(&like).RowsAffected > 0 {
		post.IsLiked = true
	}

	return c.JSON(post)
}

func CreatePost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	imageURL := data["image_url"]
	caption := data["caption"]

	if imageURL == "" && caption == "" {
		return c.Status(400).JSON(fiber.Map{"error": "El post debe tener texto o una imagen"})
	}

	post := models.Post{
		UserID:    userId,
		ImageURL:  imageURL,
		Caption:   caption,
		Location:  data["location"],
		CreatedAt: time.Now(),
	}

	database.DB.Create(&post)
	database.DB.Preload("User").First(&post, post.ID)

	return c.JSON(post)
}

func DeletePost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var post models.Post
	if err := database.DB.First(&post, postId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	if post.UserID != userId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}

	database.DB.Where("post_id = ?", post.ID).Delete(&models.Report{})
	database.DB.Where("post_id = ?", post.ID).Delete(&models.Notification{})
	database.DB.Where("post_id = ?", post.ID).Delete(&models.PostLike{})
	database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE post_id = ?)", post.ID)
	database.DB.Where("post_id = ? AND parent_id IS NOT NULL", post.ID).Delete(&models.Comment{})
	database.DB.Where("post_id = ?", post.ID).Delete(&models.Comment{})

	if err := database.DB.Delete(&post).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error interno: No se pudo eliminar la publicación."})
	}

	return c.JSON(fiber.Map{"message": "Post eliminado exitosamente"})
}

func TogglePostLike(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var post models.Post
	if err := database.DB.First(&post, postId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post no encontrado"})
	}

	var like models.PostLike
	result := database.DB.Where("user_id = ? AND post_id = ?", userId, post.ID).First(&like)

	if result.RowsAffected > 0 {
		database.DB.Delete(&like)
		return c.JSON(fiber.Map{"message": "Like removido", "is_liked": false})
	}

	newLike := models.PostLike{UserID: userId, PostID: post.ID}
	database.DB.Create(&newLike)

	CreateAndBroadcastNotification(
		post.UserID,
		userId,
		"post_like",
		&post.ID,
		"le dio me gusta a tu publicación.",
	)

	return c.JSON(fiber.Map{"message": "Like agregado", "is_liked": true})
}

func GetUserPosts(c *fiber.Ctx) error {
	userID := c.Params("id")
	myId := uint(c.Locals("userId").(float64))

	var posts []models.Post
	database.DB.Preload("User").Where("user_id = ?", userID).Order("created_at desc").Find(&posts)

	for i := range posts {
		var count int64
		database.DB.Model(&models.PostLike{}).Where("post_id = ?", posts[i].ID).Count(&count)
		posts[i].LikesCount = count

		var commentCount int64
		database.DB.Model(&models.Comment{}).Where("post_id = ?", posts[i].ID).Count(&commentCount)
		posts[i].CommentsCount = commentCount

		var like models.PostLike
		if database.DB.Where("user_id = ? AND post_id = ?", myId, posts[i].ID).Find(&like).RowsAffected > 0 {
			posts[i].IsLiked = true
		}
	}

	return c.JSON(posts)
}

func ReportPost(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var pId uint
	fmt.Sscanf(postId, "%d", &pId)

	report := models.Report{
		UserID:    userId,
		PostID:    &pId,
		Reason:    data["reason"],
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	database.DB.Create(&report)
	return c.JSON(fiber.Map{"message": "Reporte enviado. Un administrador lo revisará pronto."})
}

// ✅ NUEVO: Función para que los usuarios puedan denunciar comentarios
func ReportComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")

	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var cId uint
	fmt.Sscanf(commentId, "%d", &cId)

	report := models.Report{
		UserID:    userId,
		CommentID: &cId,
		Reason:    data["reason"],
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	database.DB.Create(&report)
	return c.JSON(fiber.Map{"message": "Comentario reportado. El equipo de moderación lo revisará."})
}

// ✅ NUEVO: Función para que los usuarios puedan denunciar otros usuarios
func ReportUser(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	reportedUserId := c.Params("id")

	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	var rId uint
	fmt.Sscanf(reportedUserId, "%d", &rId)

	if userId == rId {
		return c.Status(400).JSON(fiber.Map{"error": "No puedes reportarte a ti mismo"})
	}

	report := models.Report{
		UserID:          userId,
		ReportedUserID: &rId,
		Reason:         data["reason"],
		Status:         "pending",
		CreatedAt:      time.Now(),
	}

	database.DB.Create(&report)
	return c.JSON(fiber.Map{"message": "Usuario reportado. El equipo de moderación lo revisará."})
}

// ==========================================
// 🚀 COMENTARIOS
// ==========================================

func GetPostComments(c *fiber.Ctx) error {
	postId := c.Params("id")
	myId := uint(c.Locals("userId").(float64))

	var comments []models.Comment
	database.DB.Preload("User").Where("post_id = ?", postId).Order("created_at desc").Find(&comments)

	for i := range comments {
		var count int64
		database.DB.Model(&models.CommentLike{}).Where("comment_id = ?", comments[i].ID).Count(&count)
		comments[i].LikesCount = count

		var like models.CommentLike
		if database.DB.Where("user_id = ? AND comment_id = ?", myId, comments[i].ID).Find(&like).RowsAffected > 0 {
			comments[i].IsLiked = true
		}

		if comments[i].UserID > 0 {
			var storyCount int64
			database.DB.Model(&models.Story{}).Where("user_id = ? AND expires_at > ?", comments[i].UserID, time.Now()).Count(&storyCount)
			comments[i].User.HasStory = storyCount > 0
		}
	}

	return c.JSON(comments)
}

func CreateComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	postId := c.Params("id")

	var data map[string]interface{}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	content, ok := data["content"].(string)
	if !ok || content == "" {
		return c.Status(400).JSON(fiber.Map{"error": "El comentario no puede estar vacío"})
	}

	var parentId *uint
	if val, ok := data["parent_id"].(float64); ok {
		id := uint(val)
		parentId = &id
	}

	var pId uint
	fmt.Sscanf(postId, "%d", &pId)

	comment := models.Comment{
		PostID:    pId,
		UserID:    userId,
		Content:   content,
		ParentID:  parentId,
		CreatedAt: time.Now(),
	}

	database.DB.Create(&comment)
	database.DB.Preload("User").First(&comment, comment.ID)

	var post models.Post
	if err := database.DB.First(&post, pId).Error; err == nil {
		if post.UserID != userId {
			CreateAndBroadcastNotification(
				post.UserID,
				userId,
				"comment",
				&post.ID,
				"comentó: "+content,
			)
		}

		if parentId != nil {
			var parentComment models.Comment
			if err := database.DB.First(&parentComment, *parentId).Error; err == nil {
				if parentComment.UserID != userId {
					CreateAndBroadcastNotification(
						parentComment.UserID,
						userId,
						"comment_reply",
						&post.ID,
						"te respondió: "+content,
					)
				}
			}
		}
	}

	return c.JSON(comment)
}

func DeleteComment(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")

	var comment models.Comment
	if err := database.DB.First(&comment, commentId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Comentario no encontrado"})
	}

	if comment.UserID != userId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}

	database.DB.Where("comment_id = ?", comment.ID).Delete(&models.Report{}) // ✅ Limpiamos denuncias si el autor lo borra
	database.DB.Exec("DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE parent_id = ?)", comment.ID)
	database.DB.Where("parent_id = ?", comment.ID).Delete(&models.Comment{})
	database.DB.Where("comment_id = ?", comment.ID).Delete(&models.CommentLike{})

	if err := database.DB.Delete(&comment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error interno al eliminar comentario"})
	}

	return c.JSON(fiber.Map{"message": "Comentario eliminado exitosamente"})
}

func ToggleCommentLike(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	commentId := c.Params("id")

	var comment models.Comment
	if err := database.DB.First(&comment, commentId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Comentario no encontrado"})
	}

	var like models.CommentLike
	result := database.DB.Where("user_id = ? AND comment_id = ?", userId, comment.ID).First(&like)

	if result.RowsAffected > 0 {
		database.DB.Delete(&like)
		return c.JSON(fiber.Map{"message": "Like removido", "is_liked": false})
	}

	newLike := models.CommentLike{UserID: userId, CommentID: comment.ID}
	database.DB.Create(&newLike)
	return c.JSON(fiber.Map{"message": "Like agregado", "is_liked": true})
}

// ==========================================
// 🚀 HISTORIAS
// ==========================================

func GetActiveStories(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	// Seguidos + Matches
	var followingIds []uint
	database.DB.Model(&models.Follow{}).Where("follower_id = ?", myId).Pluck("following_id", &followingIds)

	var matches []models.Match
	database.DB.Where("user1_id = ? OR user2_id = ?", myId, myId).Find(&matches)
	matchSet := make(map[uint]bool)
	for _, m := range matches {
		if m.User1ID == myId { matchSet[m.User2ID] = true } else { matchSet[m.User1ID] = true }
	}
	for id := range matchSet {
		followingIds = append(followingIds, id)
	}

	var myStories []models.Story
	database.DB.Where("user_id = ? AND expires_at > ?", myId, time.Now()).Order("created_at asc").Find(&myStories)

	for i := range myStories {
		var views int64
		database.DB.Model(&models.StoryView{}).Where("story_id = ?", myStories[i].ID).Count(&views)
		myStories[i].ViewsCount = views
	}

	var feedStories []models.Story
	if len(followingIds) > 0 {
		database.DB.Preload("User").
			Where("user_id IN ? AND expires_at > ?", followingIds, time.Now()).
			Order("created_at asc").
			Find(&feedStories)
	}

	var myViews []models.StoryView
	storyIDs := make([]uint, 0)
	for _, s := range feedStories {
		storyIDs = append(storyIDs, s.ID)
	}

	seenMap := make(map[uint]bool)
	if len(storyIDs) > 0 {
		database.DB.Where("user_id = ? AND story_id IN ?", myId, storyIDs).Find(&myViews)
		for _, v := range myViews {
			seenMap[v.StoryID] = true
		}
	}

	type StoryGroup struct {
		User    models.User    `json:"user"`
		Stories []models.Story `json:"stories"`
		AllSeen bool           `json:"all_seen"`
	}

	groupsMap := make(map[uint]*StoryGroup)
	for _, s := range feedStories {
		s.Seen = seenMap[s.ID]

		if _, exists := groupsMap[s.UserID]; !exists {
			groupsMap[s.UserID] = &StoryGroup{
				User:    s.User,
				Stories: []models.Story{},
				AllSeen: true,
			}
		}

		groupsMap[s.UserID].Stories = append(groupsMap[s.UserID].Stories, s)
		if !s.Seen {
			groupsMap[s.UserID].AllSeen = false
		}
	}

	var result []StoryGroup
	for _, group := range groupsMap {
		result = append(result, *group)
	}

	return c.JSON(fiber.Map{
		"my_stories": myStories,
		"feed":       result,
	})
}

func GetUserStories(c *fiber.Ctx) error {
	fmt.Println("[STORY DEBUG] Entrando a GetUserStories")
	
	val := c.Locals("userId")
	if val == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Sesión no encontrada en locals"})
	}
	
	myId := uint(val.(float64))
	idParam := c.Params("id")

	fmt.Printf("[STORY DEBUG] ID Param: %s, Solicitado por: %d\n", idParam, myId)

	if idParam == "" || idParam == "undefined" || idParam == "null" {
		return c.Status(400).JSON(fiber.Map{"error": "ID de usuario inválido o vacío"})
	}

	uid, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		fmt.Printf("[STORY DEBUG] Error strconv: %v\n", err)
		return c.Status(400).JSON(fiber.Map{"error": "El ID debe ser un número válido"})
	}

	var stories []models.Story
	dbErr := database.DB.Preload("User").Where("user_id = ? AND expires_at > ?", uint(uid), time.Now()).Order("created_at asc").Find(&stories).Error
	if dbErr != nil {
		fmt.Printf("[STORY DEBUG] Error DB: %v\n", dbErr)
		return c.Status(500).JSON(fiber.Map{"error": "Error interno al buscar historias en DB"})
	}

	fmt.Printf("[STORY DEBUG] Historias encontradas para %d: %d\n", uid, len(stories))

	if len(stories) == 0 {
		return c.JSON(fiber.Map{"stories": []models.Story{}, "all_seen": true})
	}

	storyIDs := make([]uint, 0)
	for _, s := range stories {
		storyIDs = append(storyIDs, s.ID)
	}

	var myViews []models.StoryView
	database.DB.Where("user_id = ? AND story_id IN ?", myId, storyIDs).Find(&myViews)
	seenMap := make(map[uint]bool)
	for _, v := range myViews {
		seenMap[v.StoryID] = true
	}

	allSeen := true
	for i := range stories {
		stories[i].Seen = seenMap[stories[i].ID]
		if !stories[i].Seen {
			allSeen = false
		}
	}

	return c.JSON(fiber.Map{
		"user":     stories[0].User,
		"stories":  stories,
		"all_seen": allSeen,
	})
}

func CreateStory(c *fiber.Ctx) error {
	userId := uint(c.Locals("userId").(float64))
	var data struct {
		ImageURL string `json:"image_url"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Datos inválidos"})
	}

	if data.ImageURL == "" {
		return c.Status(400).JSON(fiber.Map{"error": "La imagen no puede estar vacía"})
	}

	story := models.Story{
		UserID:    userId,
		ImageURL:  data.ImageURL,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := database.DB.Create(&story).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Fallo al guardar en el servidor"})
	}

	database.DB.Preload("User").First(&story, story.ID)
	websockets.BroadcastEvent("new_story", story)

	return c.JSON(story)
}

func DeleteStory(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var story models.Story
	if err := database.DB.First(&story, storyId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "No encontrada"})
	}

	if story.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}

	database.DB.Where("story_id = ?", story.ID).Delete(&models.StoryView{})

	if err := database.DB.Delete(&story).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error interno al borrar la historia"})
	}

	websockets.BroadcastEvent("story_deleted", fiber.Map{
		"story_id": storyId,
		"user_id":  myId,
	})

	return c.JSON(fiber.Map{"message": "Historia eliminada"})
}

func ViewStory(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var sId uint
	fmt.Sscanf(storyId, "%d", &sId)

	var story models.Story
	if err := database.DB.First(&story, sId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Historia no encontrada"})
	}

	if story.UserID == myId {
		return c.JSON(fiber.Map{"success": true})
	}

	view := models.StoryView{
		StoryID:   sId,
		UserID:    myId,
		CreatedAt: time.Now(),
	}

	if database.DB.Where("story_id = ? AND user_id = ?", sId, myId).First(&models.StoryView{}).RowsAffected == 0 {
		database.DB.Create(&view)
		websockets.SendToUser(fmt.Sprintf("%d", story.UserID), "story_seen_by", fiber.Map{
			"story_id": sId,
			"user_id":  myId,
		})
	}

	websockets.SendToUser(fmt.Sprintf("%d", myId), "story_viewed", fiber.Map{
		"story_id": sId,
	})

	return c.JSON(fiber.Map{"success": true})
}

func GetStoryViewers(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	storyId := c.Params("id")

	var story models.Story
	if err := database.DB.First(&story, storyId).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Historia no encontrada"})
	}

	if story.UserID != myId {
		return c.Status(403).JSON(fiber.Map{"error": "No autorizado"})
	}

	var views []models.StoryView
	database.DB.Preload("User").Where("story_id = ?", storyId).Order("created_at desc").Find(&views)

	return c.JSON(views)
}

// ==========================================
// 🚀 NOTIFICACIONES
// ==========================================

func GetNotifications(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	var notifications []models.Notification

	database.DB.Preload("Sender").Preload("Post").Where("user_id = ?", myId).Order("created_at desc").Limit(50).Find(&notifications)
	return c.JSON(notifications)
}

func MarkNotificationRead(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	notifId := c.Params("id")

	database.DB.Model(&models.Notification{}).Where("id = ? AND user_id = ?", notifId, myId).Update("is_read", true)
	return c.JSON(fiber.Map{"success": true})
}

func MarkAllNotificationsRead(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))

	database.DB.Model(&models.Notification{}).Where("user_id = ?", myId).Update("is_read", true)
	return c.JSON(fiber.Map{"success": true})
}

func DeleteNotification(c *fiber.Ctx) error {
	myId := uint(c.Locals("userId").(float64))
	notifId := c.Params("id")

	database.DB.Where("id = ? AND user_id = ?", notifId, myId).Delete(&models.Notification{})
	return c.JSON(fiber.Map{"success": true})
}

func CreateAndBroadcastNotification(receiverID uint, senderID uint, notifType string, postID *uint, message string) {
	if receiverID == senderID {
		return
	}

	notif := models.Notification{
		UserID:    receiverID,
		SenderID:  senderID,
		Type:      notifType,
		PostID:    postID,
		Message:   message,
		IsRead:    false,
		CreatedAt: time.Now(),
	}

	database.DB.Create(&notif)

	var fullNotif models.Notification
	database.DB.Preload("Sender").Preload("Post").First(&fullNotif, notif.ID)

	websockets.SendToUser(fmt.Sprintf("%d", receiverID), "new_notification", fullNotif)
}
