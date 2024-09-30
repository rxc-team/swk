package csv

import (
	"bytes"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/go-resty/resty/v2"

	"rxcsoft.cn/tool/utils"
)

func CSVImport(apiServer, jobId, datastoreId, action, file, encoding, payFile, zipFile, charset, emptyChange string) error {

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
	formData["action"] = action
	// csv文件文字编码
	formData["encoding"] = encoding
	// 压缩文件编码格式
	formData["zip-charset"] = charset
	// empty_change
	formData["empty_change"] = emptyChange

	req.SetFormData(formData)
	// 读取csv文件
	csvfile, err := ioutil.ReadFile(file)
	if err != nil {
		utils.ErrorLog("CSVImport", err.Error())
		return err
	}

	req.SetFileReader("file", filepath.Base(file), bytes.NewReader(csvfile))

	// 读取支付文件
	if len(payFile) > 0 {
		pay, err := ioutil.ReadFile(payFile)
		if err != nil {
			utils.ErrorLog("CSVImport", err.Error())
			return err
		}
		req.SetFileReader("payFile", filepath.Base(payFile), bytes.NewReader(pay))
	}

	// 读取压缩文件
	if len(zipFile) > 0 {
		zip, err := ioutil.ReadFile(zipFile)
		if err != nil {
			utils.ErrorLog("CSVImport", err.Error())
			return err
		}
		req.SetFileReader("zipFile", filepath.Base(zipFile), bytes.NewReader(zip))
	}

	_, err = req.Post(apiServer + "/outer/api/v1/item/import/csv/datastores/" + datastoreId + "/items")
	if err != nil {
		utils.ErrorLog("CSVImport", err.Error())
		return err
	}

	return nil
}
