package jwt

import (
	"context"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/micro/go-micro/v2/client"

	"rxcsoft.cn/pit3/lib/msg"
	"rxcsoft.cn/pit3/srv/manage/proto/user"
)

// APIJWTAuth token拦截器
func APIJWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Request.Header.Get("Authorization")
		if token == "" {
			c.JSON(401, gin.H{
				"message": msg.GetMsg("ja-JP", msg.Error, msg.E005),
			})
			c.Abort()
			return
		}

		if s := strings.Split(token, " "); len(s) == 2 {
			token = s[1]
		}
		j := NewJWT()
		claims, err := j.ParseToken(token)
		if err != nil {
			c.JSON(401, gin.H{
				"message": err.Error(),
			})
			c.Abort()
			return
		}

		// 获取用户信息，放入上下文中
		userInfo, err := getUserInfo(claims.CustomerID, claims.UserID)
		if err != nil {
			c.JSON(401, gin.H{
				"message": err.Error(),
			})
			c.Abort()
			return
		}

		// 将用户信息，放入上下文中
		c.Set("userInfo", userInfo)

		c.Next()
	}
}

// 获取用户信息
func getUserInfo(db, userID string) (userInfo *user.User, err error) {
	userService := user.NewUserService("manage", client.DefaultClient)
	ctx, cancel := context.WithTimeout(context.TODO(), time.Second*120)
	defer cancel()

	var req user.FindUserRequest
	req.Type = 0
	req.UserId = userID
	req.Database = db
	response, err := userService.FindUser(ctx, &req)
	if err != nil {
		return nil, err
	}

	return response.GetUser(), nil
}
