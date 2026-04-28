package routes

import (
	"cuadralo-backend/controllers"
	"cuadralo-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	// ======================================
	// 📗 RUTAS PÚBLICAS - GRUPO COMPLETAMENTE SEPARADO
	// ======================================
	public := app.Group("/api")
	public.Post("/register", controllers.Register)
	public.Post("/login", controllers.Login)
	public.Post("/login/google", controllers.GoogleLogin)
	public.Post("/check-availability", controllers.CheckAvailability)
	public.Post("/forgot-password", controllers.ForgotPassword)
	public.Post("/reset-password", controllers.ResetPassword)
	public.Post("/validate-reset-token", controllers.ValidateResetToken)
	public.Get("/interests", controllers.GetAllInterests)
	public.Post("/upload", controllers.UploadFile)

	// ======================================
	// 🔒 RUTAS PROTEGIDAS - GRUPO SEPARADO CON MIDDLEWARE
	// ======================================
	protected := app.Group("/api")
	protected.Use(middleware.IsAuthenticated)

	protected.Post("/user/admin-request", controllers.RequestAdminRole)
	protected.Post("/user/verify-face", controllers.VerifyFace)

	// --- FUNCIONES DE USUARIO ---
	protected.Get("/search", controllers.SearchUsers)
	protected.Get("/notifications", controllers.GetNotifications)
	protected.Post("/notifications/read-all", controllers.MarkAllNotificationsRead)
	protected.Post("/notifications/:id/read", controllers.MarkNotificationRead)
	protected.Delete("/notifications/:id", controllers.DeleteNotification)

	// --- FEED Y SOCIAL ---
	protected.Get("/social/feed", controllers.GetSocialFeed)
	protected.Post("/social/posts", controllers.CreatePost)
	protected.Delete("/social/posts/:id", controllers.DeletePost)

	// ✅ FIX: Aquí estaba el error. Ahora usa la función correcta: ReportPost
	protected.Post("/social/posts/:id/report", controllers.ReportPost)
	protected.Post("/social/comments/:id/report", controllers.ReportComment)
	protected.Post("/social/users/:id/report", controllers.ReportUser)

	protected.Post("/social/posts/:id/like", controllers.TogglePostLike)
	protected.Get("/social/posts/:id", controllers.GetSinglePost)
	protected.Get("/users/:id/posts", controllers.GetUserPosts)

	protected.Get("/social/posts/:id/comments", controllers.GetPostComments)
	protected.Post("/social/posts/:id/comments", controllers.CreateComment)
	protected.Delete("/social/comments/:id", controllers.DeleteComment)
	protected.Post("/social/comments/:id/like", controllers.ToggleCommentLike)

	protected.Get("/social/stories", controllers.GetActiveStories)
	protected.Get("/social/user-stories/:id", controllers.GetUserStories)
	protected.Post("/social/stories", controllers.CreateStory)
	protected.Delete("/social/stories/:id", controllers.DeleteStory)
	protected.Post("/social/stories/:id/view", controllers.ViewStory)
	protected.Get("/social/stories/:id/viewers", controllers.GetStoryViewers)

	protected.Get("/u/:username", controllers.GetProfileByUsername)
	protected.Post("/users/:id/follow", controllers.FollowUser)
	protected.Get("/users/:id", controllers.GetUser)

	protected.Get("/me", controllers.GetMe)
	protected.Put("/me", controllers.UpdateMe)
	protected.Delete("/me", controllers.DeleteAccount)
	protected.Put("/change-password", controllers.ChangePassword)

	// --- SWIPE (Citas) ---
	protected.Get("/feed", controllers.GetSwipeFeed)
	protected.Post("/swipe", controllers.Swipe)
	protected.Delete("/swipe/undo", controllers.UndoSwipe)
	protected.Get("/likes-received", controllers.GetReceivedLikes)
	protected.Get("/rompehielos/requests", controllers.GetRompehielosRequests)
	protected.Get("/matches", controllers.GetMatches)
	protected.Delete("/matches/:id", controllers.DeleteMatch)

	// --- ROMPEHIELOS (Icebreakers) ---
	protected.Get("/icebreaker/info", controllers.GetIcebreakerInfo)
	protected.Post("/icebreaker/activate-free", controllers.ActivateFreeIcebreakers)
	protected.Get("/likes/pending", controllers.GetPendingLikes)

	// --- MENSAJERIA ---
	protected.Get("/messages/:id", controllers.GetMessages)
	protected.Post("/messages", controllers.SendMessage)
	protected.Post("/messages/:id/save", controllers.SaveMessage)
	protected.Post("/messages/:id/toggle-save", controllers.ToggleMessageSave)
	protected.Delete("/messages/:id", controllers.DeleteMessage)
	protected.Post("/messages/:id/view", controllers.MarkMessageViewed)

	// --- PREMIUM Y TIENDA ---
	protected.Get("/premium/status", controllers.GetMyPlan)
	protected.Get("/premium/rate", controllers.GetExchangeRate)
	protected.Post("/premium/buy", controllers.BuyPrime)
	protected.Post("/premium/boost/buy", controllers.BuyBoost)
	protected.Post("/premium/boost/activate", controllers.ActivateBoost)
	protected.Post("/premium/rompehielos/buy", controllers.BuyRompehielos)
	protected.Post("/premium/report-payment", controllers.ReportPayment)

	// --- DESTELLOS (Flash) ---
	protected.Get("/flash/info", controllers.GetFlashInfo)
	protected.Get("/flash/options", controllers.GetFlashOptions)
	protected.Post("/flash/activate", controllers.ActivateFlash)
	protected.Get("/flash/stats", controllers.GetFlashStats)
	protected.Post("/flash/reach", controllers.IncrementReach)
	protected.Get("/flash/refresh", controllers.RefreshFlash)

	// ==========================================
	// 🛡️ PANEL ADMINISTRATIVO (Staff General)
	// ==========================================
	admin := protected.Group("/admin", middleware.IsAdmin)

	admin.Get("/stats", controllers.GetDashboardStats)

	// Destellos
	admin.Get("/flash/list", controllers.AdminListFlashes)
	admin.Delete("/flash/delete", controllers.AdminDeleteFlash)

	// Rompehielos
	admin.Get("/rompehielos/list", controllers.AdminListRompehielos)
	admin.Post("/rompehielos/approve", controllers.AdminApproveRompehielo)
	admin.Post("/rompehielos/reject", controllers.AdminRejectRompehielo)
	admin.Delete("/rompehielos/:id", controllers.AdminDeleteRompehielo)

	// Likes
	admin.Get("/likes/list", controllers.AdminListLikes)
	admin.Delete("/likes/:id", controllers.AdminDeleteLike)
	admin.Post("/rompehielos/update-inventory", controllers.AdminUpdateInventory)

	// Usuarios
	admin.Get("/users/suspended", controllers.GetSuspendedUsersAdmin)
	admin.Get("/users/deleted", controllers.GetDeletedUsersAdmin)
	admin.Get("/users", controllers.GetAllUsersAdmin)
	admin.Put("/users/:id/suspend", controllers.SuspendUser)
	admin.Put("/users/:id/restore", controllers.RestoreDeletedUser)

	// Verificaciones
	admin.Get("/verifications", controllers.AdminListVerifications)
	admin.Put("/verifications/:id/approve", controllers.AdminApproveVerification)
	admin.Put("/verifications/:id/reject", controllers.AdminRejectVerification)
	admin.Put("/verifications/user/:id/reset-lock", controllers.AdminResetVerificationLock)

	// Pagos y VIP
	admin.Get("/payments", controllers.GetAllPaymentsAdmin)
	admin.Put("/payments/:id/verify", controllers.VerifyPayment)
	admin.Get("/vip-users", controllers.GetVipUsersAdmin)
	admin.Put("/users/:id/vip/revoke", controllers.RevokeVIP)
	admin.Put("/users/:id/vip/extend", controllers.ExtendVIP)
	admin.Put("/users/:id/vip/grant", controllers.GrantVIPManual)

	// Moderación
	admin.Get("/moderation/conversations", controllers.GetAllConversationsAdmin)
	admin.Get("/moderation/conversations/history", controllers.GetFullConversationAdmin)
	admin.Delete("/moderation/conversations", controllers.DeleteConversationAdmin)

	admin.Get("/moderation/messages", controllers.GetAllMessagesAdmin)
	admin.Delete("/moderation/messages/:id", controllers.DeleteMessageAdmin)

	admin.Get("/moderation/matches", controllers.GetAllMatchesAdmin)
	admin.Delete("/moderation/matches/:id", controllers.DeleteMatchAdmin)

	admin.Get("/moderation/posts", controllers.GetAllPostsAdmin)
	admin.Delete("/moderation/posts/:id", controllers.DeletePostAdmin)

	admin.Get("/moderation/comments", controllers.GetAllCommentsAdmin)
	admin.Delete("/moderation/comments/:id", controllers.DeleteCommentAdmin)

	admin.Get("/moderation/media", controllers.GetAllMediaAdmin)
	admin.Delete("/moderation/media", controllers.DeleteMediaAdmin)

	admin.Get("/moderation/flagged", controllers.GetFlaggedContentAdmin)

	// Reportes
	admin.Get("/reports/posts", controllers.GetPostReportsAdmin)
	admin.Get("/reports/comments", controllers.GetCommentReportsAdmin)
	admin.Get("/reports/users", controllers.GetUserReportsAdmin)
	admin.Get("/reports/users/resolved", controllers.GetUserReportsResolved)
	admin.Get("/reports/posts/resolved", controllers.GetPostReportsResolved)
	admin.Get("/reports/comments/resolved", controllers.GetCommentReportsResolved)
	admin.Put("/reports/:id/resolve", controllers.ResolveReportAdmin)

	admin.Get("/logs", controllers.GetAdminLogs)
	admin.Get("/settings", controllers.GetSystemSettings)
	admin.Post("/inventory/migrate", controllers.MigrateInventory)

	// Gestión de Inventario
	admin.Get("/inventory", controllers.AdminGetInventoryPage)
	admin.Get("/inventory/:id", controllers.AdminGetUserInventory)
	admin.Post("/inventory/add", controllers.AdminAddInventoryItem)
	admin.Post("/inventory/remove", controllers.AdminRemoveInventoryItem)
	admin.Post("/inventory/vip", controllers.AdminSetVIPStatus)

	// ==========================================
	// 🔴 PANEL DE ALTO RIESGO (Solo SuperAdmin)
	// ==========================================
	superAdmin := protected.Group("/admin", middleware.IsSuperAdmin)

	superAdmin.Delete("/users/:id/force", controllers.ForceDeleteUser)
	superAdmin.Delete("/users/:id", controllers.DeleteUserAdmin)

	superAdmin.Put("/settings", controllers.UpdateSystemSettings)
	superAdmin.Get("/requests", controllers.GetAdminRequests)
	superAdmin.Put("/requests/:id", controllers.ProcessAdminRequest)
	superAdmin.Get("/staff", controllers.GetAdminStaff)
	superAdmin.Put("/staff/:id/revoke", controllers.RevokeAdminRole)
}
