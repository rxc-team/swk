package auth

import (
	"encoding/json"
	"errors"
	"os"

	"github.com/go-resty/resty/v2"
	"rxcsoft.cn/tool/utils"
)

type LoginResponse struct {
	Status  int32     `json:"status"`
	Message string    `json:"message"`
	Data    LoginData `json:"data"`
}

type LoginData struct {
	AccessToken   string  `json:"access_token"`
	RefreshToken  string  `json:"refresh_token"`
	UserInfo      User    `json:"user"`
	UserFlg       float64 `json:"user_flg"`
	IsValidApp    bool    `json:"is_valid_app"`
	IsSecondCheck bool    `json:"is_second_check"`
}

// 用户
type User struct {
	UserId      string   `json:"user_id"`
	UserName    string   `json:"user_name"`
	Email       string   `json:"email"`
	NoticeEmail string   `json:"notice_email"`
	CurrentApp  string   `json:"current_app"`
	Group       string   `json:"group"`
	Language    string   `json:"language"`
	Roles       []string `json:"roles"`
	Apps        []string `json:"apps"`
	Domain      string   `json:"domain"`
	CustomerId  string   `json:"customer_id"`
	Timezone    string   `json:"timezone"`
}

func Login(apiServer, user, password string) error {
	values := map[string]string{"email": user, "password": password}
	json_data, err := json.Marshal(values)
	if err != nil {
		utils.ErrorLog("Login", err.Error())
		return err
	}

	var result LoginResponse

	client := resty.New()

	req := client.R()
	req.SetHeader("Content-Type", "application/json")

	req.SetBody(json_data)
	req.SetResult(&result)

	_, err = req.Post(apiServer + "/outer/api/v1/login")
	if err != nil {
		utils.ErrorLog("AddTask", err.Error())
		return err
	}

	if result.Status == 0 {
		data := result.Data

		accessToken := data.AccessToken
		userInfo := data.UserInfo
		app := userInfo.CurrentApp

		os.Setenv("token", accessToken)
		os.Setenv("app", app)

		return nil
	}

	return errors.New(result.Message)
}
