package mapping

import (
	"bytes"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	"github.com/go-resty/resty/v2"
	"rxcsoft.cn/tool/service/task"
	"rxcsoft.cn/tool/utils"
)

func MappingImport(apiServer, jobId, datastoreId, mappingId, file, emptyChange string) error {

	token := os.Getenv("token")
	app := os.Getenv("app")

	client := resty.New()

	req := client.R()

	req.SetHeader("Authorization", "Bearer "+token)
	req.SetHeader("App", app)

	formData := make(map[string]string)
	// 任务 ID
	formData["job_id"] = jobId
	// 操作
	formData["mapping_id"] = mappingId
	// empty change
	formData["empty_change"] = emptyChange

	req.SetFormData(formData)
	// 读取csv文件
	csvfile, err := ioutil.ReadFile(file)
	if err != nil {
		utils.ErrorLog("CSVImport", err.Error())
		return err
	}

	req.SetFileReader("file", filepath.Base(file), bytes.NewReader(csvfile))

	tk := task.Task{
		JobId:        jobId,
		JobName:      "csv file import",
		ShowProgress: true,
		StartTime:    time.Now().Format("2006-01-02 15:04:05"),
		Message:      "create a job",
		TaskType:     "ds-csv-import",
		Steps:        []string{"start", "data-ready", "build-check-data", "upload", "end"},
		CurrentStep:  "start",
	}

	// 创建任务
	err = task.AddTask(apiServer, tk)
	if err != nil {
		utils.ErrorLog("MappingImport", err.Error())
		return err
	}

	_, err = req.Post(apiServer + "/outer/api/v1/mapping/datastores/" + datastoreId + "/upload")
	if err != nil {
		utils.ErrorLog("CSVImport", err.Error())
		return err
	}

	return nil
}
