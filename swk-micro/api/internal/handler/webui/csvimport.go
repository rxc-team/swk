package webui

import (
	"context"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/micro/go-micro/v2/client"
	"github.com/spf13/cast"
	"rxcsoft.cn/pit3/api/internal/common/loggerx"
	"rxcsoft.cn/pit3/api/internal/system/sessionx"
	"rxcsoft.cn/pit3/srv/import/proto/upload"
)

func csvUpload(c *gin.Context, filePath, zipFilePath, payFilePath string) error {

	base := upload.Params{
		JobId:       c.PostForm("job_id"),
		Action:      c.PostForm("action"),
		Encoding:    c.PostForm("encoding"),
		ZipCharset:  c.PostForm("zip-charset"),
		UserId:      sessionx.GetAuthUserID(c),
		AppId:       sessionx.GetCurrentApp(c),
		Lang:        sessionx.GetCurrentLanguage(c),
		Domain:      sessionx.GetUserDomain(c),
		DatastoreId: c.Param("d_id"),
		GroupId:     sessionx.GetUserGroup(c),
		AccessKeys:  sessionx.GetUserAccessKeys(c, c.Param("d_id"), "W"),
		Owners:      sessionx.GetUserOwner(c),
		Roles:       sessionx.GetUserRoles(c),
		WfId:        c.Query("wf_id"),
		EmptyChange: cast.ToBool(c.PostForm("empty_change")),
		Database:    sessionx.GetUserCustomer(c),
	}

	file := upload.FileParams{
		FilePath:    filePath,
		ZipFilePath: zipFilePath,
		PayFilePath: payFilePath,
	}

	uploadService := upload.NewUploadService("import", client.DefaultClient)

	var req upload.CSVRequest
	// 从query获取
	req.BaseParams = &base
	req.FileParams = &file

	_, err := uploadService.CSVUpload(context.TODO(), &req)
	if err != nil {
		loggerx.ErrorLog("csvUpload", err.Error())
		return err
	}

	return nil
}

func inventoryUpload(c *gin.Context, filePath string) error {

	keys := c.PostForm("main_keys")
	kparam := strings.Split(keys, ",")

	//棚卸時間添加时区
	timezone := c.PostForm("timezone")
	loc, _ := time.LoadLocation(timezone)
	datetimezone, _ := time.ParseInLocation("2006-01-02 15:04:05", c.PostForm("checked_at"), loc)
	utc := datetimezone.UTC()
	checked_at_utc := utc.Format("2006-01-02 15:04:05")

	base := upload.CheckParams{
		JobId:       c.PostForm("job_id"),
		Encoding:    c.PostForm("encoding"),
		UserId:      sessionx.GetAuthUserID(c),
		AppId:       sessionx.GetCurrentApp(c),
		Lang:        sessionx.GetCurrentLanguage(c),
		Domain:      sessionx.GetUserDomain(c),
		DatastoreId: c.Param("d_id"),
		GroupId:     sessionx.GetUserGroup(c),
		AccessKeys:  sessionx.GetUserAccessKeys(c, c.Param("d_id"), "W"),
		Owners:      sessionx.GetUserOwner(c),
		Roles:       sessionx.GetUserRoles(c),
		Database:    sessionx.GetUserCustomer(c),
		MainKeys:    kparam,
		CheckType:   c.PostForm("check_type"),
		CheckedAt:   checked_at_utc,
		CheckedBy:   c.PostForm("checked_by"),
	}

	uploadService := upload.NewUploadService("import", client.DefaultClient)

	var req upload.InventoryRequest
	// 从query获取
	req.BaseParams = &base
	req.FilePath = filePath

	_, err := uploadService.InventoryUpload(context.TODO(), &req)
	if err != nil {
		loggerx.ErrorLog("inventoryUpload", err.Error())
		return err
	}

	return nil
}
