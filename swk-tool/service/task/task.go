package task

import (
	"encoding/json"
	"os"

	"github.com/go-resty/resty/v2"
	"rxcsoft.cn/tool/utils"
)

// 添加数据
type Task struct {
	JobId        string   `json:"job_id"`
	JobName      string   `json:"job_name"`
	Origin       string   `json:"origin"`
	UserId       string   `json:"user_id"`
	ShowProgress bool     `json:"show_progress"`
	Progress     int64    `json:"progress"`
	StartTime    string   `json:"start_time"`
	Message      string   `json:"message"`
	TaskType     string   `json:"task_type"`
	Steps        []string `json:"steps"`
	CurrentStep  string   `json:"current_step"`
	Database     string   `json:"database"`
	ScheduleId   string   `json:"schedule_id"`
	AppId        string   `json:"app_id"`
}

func AddTask(apiServer string, task Task) error {

	token := os.Getenv("token")
	app := os.Getenv("app")

	client := resty.New()

	req := client.R()
	req.SetHeader("Authorization", "Bearer "+token)
	req.SetHeader("App", app)
	req.SetHeader("Content-Type", "application/json")

	json_data, err := json.Marshal(task)
	if err != nil {
		utils.ErrorLog("AddTask", err.Error())
		return err
	}

	req.SetBody(json_data)

	_, err = req.Post(apiServer + "/outer/api/v1/task/tasks")
	if err != nil {
		utils.ErrorLog("AddTask", err.Error())
		return err
	}

	return nil
}
