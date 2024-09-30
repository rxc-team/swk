package dev

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kataras/i18n"
	"github.com/micro/go-micro/v2/client"

	"rxcsoft.cn/pit3/api/internal/common/filex"
	"rxcsoft.cn/pit3/api/internal/common/httpx"
	"rxcsoft.cn/pit3/api/internal/common/loggerx"
	"rxcsoft.cn/pit3/api/internal/common/logic/langx"
	"rxcsoft.cn/pit3/api/internal/common/logic/tplx"
	"rxcsoft.cn/pit3/api/internal/system/initx"
	"rxcsoft.cn/pit3/api/internal/system/jobx"
	"rxcsoft.cn/pit3/api/internal/system/sessionx"
	"rxcsoft.cn/pit3/lib/msg"
	"rxcsoft.cn/pit3/srv/global/proto/language"
	"rxcsoft.cn/pit3/srv/manage/proto/app"
	"rxcsoft.cn/pit3/srv/manage/proto/customer"
	"rxcsoft.cn/pit3/srv/manage/proto/role"
	"rxcsoft.cn/pit3/srv/task/proto/task"
	storagecli "rxcsoft.cn/utils/storage/client"
)

// App App
type App struct{}

// log出力
const (
	AppProcessName = "App"
	// Action
	ActionFindApps            = "FindApps"
	ActionFindApp             = "FindApp"
	ActionAddApp              = "AddApp"
	ActionModifyApp           = "ModifyApp"
	ActionDeleteSelectApps    = "DeleteSelectApps"
	ActionHardDeleteApps      = "HardDeleteApps"
	ActionRecoverSelectApps   = "RecoverSelectApps"
	ActionaddDefaultGroup     = "addDefaultGroup"
	ActionaddAppLangItem      = "addAppLangItem"
	ActionaddDefaultAdminUser = "addDefaultAdminUser"
	ActionaddDefaultAdminRole = "addDefaultAdminRole"
	ActionAddGroup            = "AddGroup"
	defaultPasswordEnv        = "DEFAULT_PASSWORD"
)

// FindApps 查找多个APP记录
// @Router /apps [get]
func (a *App) FindApps(c *gin.Context) {
	loggerx.InfoLog(c, ActionFindApps, loggerx.MsgProcessStarted)

	appService := app.NewAppService("manage", client.DefaultClient)

	db := c.Query("database")
	if db == "" {
		customers, err := findCustomers(c)
		if err != nil {
			httpx.GinHTTPError(c, ActionFindApps, err)
			return
		}
		var apps []*app.App
		for _, ct := range customers {
			var req app.FindAppsRequest
			req.Database = ct.CustomerId
			req.Domain = ct.Domain
			response, err := appService.FindApps(context.TODO(), &req)
			if err != nil {
				httpx.GinHTTPError(c, ActionFindApps, err)
				return
			}
			apps = append(apps, response.GetApps()...)
		}
		loggerx.InfoLog(c, ActionFindApps, loggerx.MsgProcessEnded)
		c.JSON(200, httpx.Response{
			Status:  0,
			Message: msg.GetMsg("ja-JP", msg.Info, msg.I003, fmt.Sprintf(httpx.Temp, AppProcessName, ActionFindApps)),
			Data:    apps,
		})
		return
	}

	var req app.FindAppsRequest
	req.Domain = c.Query("domain")
	req.AppName = c.Query("app_name")
	req.InvalidatedIn = c.Query("invalidated_in")
	req.IsTrial = c.Query("is_trial")
	req.StartTime = c.Query("start_time")
	req.EndTime = c.Query("end_tiem")
	req.CopyFrom = c.Query("copy_from")

	req.Database = c.Query("database")

	response, err := appService.FindApps(context.TODO(), &req)
	if err != nil {
		httpx.GinHTTPError(c, ActionFindApps, err)
		return
	}

	loggerx.InfoLog(c, ActionFindApps, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I003, fmt.Sprintf(httpx.Temp, AppProcessName, ActionFindApps)),
		Data:    response.GetApps(),
	})
}

func findCustomers(c *gin.Context) ([]*customer.Customer, error) {
	loggerx.InfoLog(c, ActionFindApps, fmt.Sprintf("Process FindCustomers:%s", loggerx.MsgProcessStarted))
	customerService := customer.NewCustomerService("manage", client.DefaultClient)
	var req customer.FindCustomersRequest
	response, err := customerService.FindCustomers(context.TODO(), &req)
	if err != nil {
		loggerx.FailureLog(c, ActionFindApps, fmt.Sprintf(loggerx.MsgProcessError, "FindCustomers", err))
		return nil, err
	}
	loggerx.InfoLog(c, ActionFindApps, fmt.Sprintf("Process FindCustomers:%s", loggerx.MsgProcessEnded))

	return response.GetCustomers(), nil
}

// FindApp 查找单个APP记录
// @Router /apps/{a_id} [get]
func (a *App) FindApp(c *gin.Context) {
	loggerx.InfoLog(c, ActionFindApp, loggerx.MsgProcessStarted)

	appService := app.NewAppService("manage", client.DefaultClient)

	var req app.FindAppRequest
	req.AppId = c.Param("a_id")
	req.Database = c.Query("database")
	response, err := appService.FindApp(context.TODO(), &req)
	if err != nil {
		httpx.GinHTTPError(c, ActionFindApp, err)
		return
	}
	loggerx.InfoLog(c, ActionFindApp, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I003, fmt.Sprintf(httpx.Temp, AppProcessName, ActionFindApp)),
		Data:    response.GetApp(),
	})
}

// AddApp 添加单个APP记录
// @Router /apps [post]
func (a *App) AddApp(c *gin.Context) {
	loggerx.InfoLog(c, ActionAddApp, loggerx.MsgProcessStarted)

	appService := app.NewAppService("manage", client.DefaultClient)

	var req app.AddAppRequest
	if err := c.BindJSON(&req); err != nil {
		httpx.GinHTTPError(c, ActionAddApp, err)
		return
	}
	req.Writer = sessionx.GetAuthUserID(c)
	lang := sessionx.GetCurrentLanguage(c)
	db := req.Database

	response, err := appService.AddApp(context.TODO(), &req)
	if err != nil {
		httpx.GinHTTPError(c, ActionAddApp, err)
		return
	}
	loggerx.SuccessLog(c, ActionAddApp, fmt.Sprintf(loggerx.MsgProcesSucceed, ActionAddApp))

	// 添加app默認配置信息
	if req.AppType == "rent" {
		initx.AddDefaultJournals(db, req.GetWriter(), response.GetAppId(), "assets/json/default_journals.json")
	}

	// 添加APP对应的语言
	if err := initx.AddAppLangItem(db, req.GetDomain(), sessionx.GetCurrentLanguage(c), response.GetAppId(), req.GetAppName(), req.GetWriter()); err != nil {
		httpx.GinHTTPError(c, ActionAddApp, err)
		return
	}

	// 通知刷新多语言数据
	// 获取当前用户的 domain
	domain := sessionx.GetUserDomain(c)
	langx.RefreshLanguage(req.GetWriter(), domain)

	// 添加默认用户组
	gid, err := initx.AddDefaultGroup(db, req.GetDomain(), req.GetWriter())
	if err != nil {
		httpx.GinHTTPError(c, ActionAddApp, err)
		return
	}

	// 管理员用户若尚不存在的场合：添加默认的管理员用户，管理员已经存在的场合：为管理员用户更新添加APP
	u, err := initx.AddDefaultAdminUser(db, response.GetAppId(), req.GetDomain(), req.GetWriter(), gid)
	if err != nil {
		httpx.GinHTTPError(c, ActionAddApp, err)
		return
	}

	if len(req.GetTemplateId()) > 0 {

		jobID := "job_" + time.Now().Format("20060102150405")
		jobx.CreateTask(task.AddRequest{
			JobId:        jobID,
			JobName:      "restore from template",
			Origin:       "-",
			UserId:       req.GetWriter(),
			ShowProgress: false,
			Message:      i18n.Tr(lang, "job.J_014"),
			TaskType:     "template-restore",
			Steps:        []string{"start", "get-template-file", "read-file", "save-file", "unzip-file", "restore", "end"},
			CurrentStep:  "start",
			Database:     db,
			AppId:        "system",
		})

		keys, err := initx.GetUserAccessKeys(u, db)
		if err != nil {
			httpx.GinHTTPError(c, ActionAddApp, err)
			return
		}

		// 查找所有角色
		var roleReq role.FindRolesRequest
		roleReq.Database = db
		roleReq.Domain = req.GetDomain()
		/* roleReq.RoleType = "1" */

		roleService := role.NewRoleService("manage", client.DefaultClient)
		roleRes, err := roleService.FindRoles(context.TODO(), &roleReq)
		if err != nil {
			httpx.GinHTTPError(c, ActionAddApp, err)
			return
		}

		err = tplx.Restore(db, u, jobID, roleRes.Roles, req.GetDomain(), gid, req.GetTemplateId(), response.GetAppId(), lang, keys)
		if err != nil {
			httpx.GinHTTPError(c, ActionAddApp, err)
			return
		}
	}

	loggerx.InfoLog(c, ActionAddApp, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I004, fmt.Sprintf(httpx.Temp, AppProcessName, ActionAddApp)),
		Data:    response,
	})
}

// ModifyApp 修改单个APP记录
// @Router /apps/{a_id} [put]
func (a *App) ModifyApp(c *gin.Context) {
	loggerx.InfoLog(c, ActionModifyApp, loggerx.MsgProcessStarted)

	appService := app.NewAppService("manage", client.DefaultClient)

	var req app.ModifyAppRequest
	if err := c.BindJSON(&req); err != nil {
		httpx.GinHTTPError(c, ActionModifyApp, err)
		return
	}
	req.AppId = c.Param("a_id")
	req.Writer = sessionx.GetAuthUserID(c)

	response, err := appService.ModifyApp(context.TODO(), &req)
	if err != nil {
		httpx.GinHTTPError(c, ActionModifyApp, err)
		return
	}
	loggerx.SuccessLog(c, ActionModifyApp, fmt.Sprintf(loggerx.MsgProcesSucceed, ActionModifyApp))

	if req.GetAppName() != "" {
		// 修改APP对应的语言
		if err := initx.AddAppLangItem(req.GetDatabase(), req.GetDomain(), sessionx.GetCurrentLanguage(c), req.GetAppId(), req.GetAppName(), req.GetWriter()); err != nil {
			httpx.GinHTTPError(c, ActionModifyApp, err)
			return
		}

		// 通知刷新多语言数据
		// 获取当前用户的 domain
		domain := sessionx.GetUserDomain(c)
		langx.RefreshLanguage(req.GetWriter(), domain)
	}

	loggerx.InfoLog(c, ActionModifyApp, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I005, fmt.Sprintf(httpx.Temp, AppProcessName, ActionModifyApp)),
		Data:    response,
	})
}

// DeleteSelectApps 删除选中的APP记录
// @Router /apps [delete]
func (a *App) DeleteSelectApps(c *gin.Context) {
	loggerx.InfoLog(c, ActionDeleteSelectApps, loggerx.MsgProcessStarted)

	var req app.DeleteSelectAppsRequest
	req.Writer = sessionx.GetAuthUserID(c)
	req.Database = c.Query("database")

	list := c.QueryArray("app_id_list")
	for _, item := range list {
		req.AppIdList = append(req.AppIdList, item[0:strings.Index(item, "_")])
	}

	appService := app.NewAppService("manage", client.DefaultClient)
	response, err := appService.DeleteSelectApps(context.TODO(), &req)
	if err != nil {
		httpx.GinHTTPError(c, ActionDeleteSelectApps, err)
		return
	}
	loggerx.SuccessLog(c, ActionDeleteSelectApps, fmt.Sprintf(loggerx.MsgProcesSucceed, ActionDeleteSelectApps))

	loggerx.InfoLog(c, ActionDeleteSelectApps, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I006, fmt.Sprintf(httpx.Temp, AppProcessName, ActionDeleteSelectApps)),
		Data:    response,
	})
}

// HardDeleteApps 物理删除APP记录
// @Router /phydel/apps [delete]
func (a *App) HardDeleteApps(c *gin.Context) {
	loggerx.InfoLog(c, ActionHardDeleteApps, loggerx.MsgProcessStarted)

	var opss client.CallOption = func(o *client.CallOptions) {
		o.RequestTimeout = time.Minute * 10
		o.DialTimeout = time.Minute * 10
	}

	db := c.Query("database")
	domain := sessionx.GetUserDomain(c)
	lang := sessionx.GetCurrentLanguage(c)

	langData := langx.GetLanguageData(db, lang, domain)

	appService := app.NewAppService("manage", client.DefaultClient)
	var req app.HardDeleteAppsRequest
	req.Database = db

	list := c.QueryArray("app_id_list")
	var appNameList []string
	for _, item := range list {
		req.AppIdList = append(req.AppIdList, item[0:strings.Index(item, "_")])

		var reqF app.FindAppRequest
		reqF.AppId = item[0:strings.Index(item, "_")]
		reqF.Database = db
		result, err := appService.FindApp(context.TODO(), &reqF)
		if err != nil {
			httpx.GinHTTPError(c, ActionHardDeleteApps, err)
			return
		}
		appName := langx.GetLangValue(langData, result.GetApp().AppName, langx.DefaultResult)
		appNameList = append(appNameList, appName)
	}

	response, err := appService.HardDeleteApps(context.TODO(), &req, opss)
	if err != nil {
		httpx.GinHTTPError(c, ActionHardDeleteApps, err)
		return
	}

	//处理log
	for _, name := range appNameList {
		appName := strings.Builder{}
		appName.WriteString(name)
		appName.WriteString("(")
		appName.WriteString(sessionx.GetCurrentLanguage(c))
		appName.WriteString(")")
		params := make(map[string]string)
		params["user_name"] = sessionx.GetUserName(c)
		params["app_name"] = appName.String()

		loggerx.ProcessLog(c, ActionHardDeleteApps, msg.L013, params)
	}
	loggerx.SuccessLog(c, ActionHardDeleteApps, fmt.Sprintf(loggerx.MsgProcesSucceed, ActionHardDeleteApps))

	langService := language.NewLanguageService("global", client.DefaultClient)

	for _, id := range list {
		appID := id[0:strings.Index(id, "_")]
		domain := id[strings.Index(id, "_")+1:]
		loggerx.InfoLog(c, ActionHardDeleteApps, fmt.Sprintf("Process DeleteLanguageData:%s", loggerx.MsgProcessStarted))
		delreq := language.DeleteLanguageDataRequest{
			Domain:   domain,
			AppId:    appID,
			Writer:   sessionx.GetAuthUserID(c),
			Database: req.Database,
		}
		_, err := langService.DeleteLanguageData(context.TODO(), &delreq, opss)
		if err != nil {
			httpx.GinHTTPError(c, ActionHardDeleteApps, err)
			return
		}

		loggerx.SuccessLog(c, ActionHardDeleteApps, fmt.Sprintf(loggerx.MsgProcesSucceed, "DeleteLanguageData"))
		loggerx.InfoLog(c, ActionHardDeleteApps, fmt.Sprintf("Process DeleteLanguageData:%s", loggerx.MsgProcessEnded))

		minioClient, err := storagecli.NewClient(domain)
		if err != nil {
			httpx.GinHTTPError(c, ActionHardDeleteApps, err)
			return
		}

		size, err := minioClient.DeletePath("app_" + appID)
		if err != nil {
			httpx.GinHTTPError(c, ActionHardDeleteApps, err)
			return
		}

		// 更新顾客的使用空间大小
		err = filex.ModifyUsedSize(domain, -float64(size))
		if err != nil {
			httpx.GinHTTPError(c, ActionHardDeleteApps, err)
			return
		}
	}

	// 通知刷新多语言数据
	langx.RefreshLanguage(sessionx.GetAuthUserID(c), domain)

	loggerx.InfoLog(c, ActionHardDeleteApps, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I006, fmt.Sprintf(httpx.Temp, AppProcessName, ActionHardDeleteApps)),
		Data:    response,
	})
}

// RecoverSelectApps 恢复选中的APP记录
// @Router /recover/apps [PUT]
func (a *App) RecoverSelectApps(c *gin.Context) {
	loggerx.InfoLog(c, ActionRecoverSelectApps, loggerx.MsgProcessStarted)

	var req app.RecoverSelectAppsRequest

	// 从body中获取参数
	if err := c.BindJSON(&req); err != nil {
		httpx.GinHTTPError(c, ActionRecoverSelectApps, err)
		return
	}
	// 从共通中获取参数
	req.Writer = sessionx.GetAuthUserID(c)
	req.Database = c.Query("database")

	for index, item := range req.AppIdList {
		req.AppIdList[index] = item[0:strings.Index(item, "_")]
	}

	appService := app.NewAppService("manage", client.DefaultClient)
	response, err := appService.RecoverSelectApps(context.TODO(), &req)
	if err != nil {
		httpx.GinHTTPError(c, ActionRecoverSelectApps, err)
		return
	}
	loggerx.SuccessLog(c, ActionRecoverSelectApps, fmt.Sprintf(loggerx.MsgProcesSucceed, ActionRecoverSelectApps))

	loggerx.InfoLog(c, ActionRecoverSelectApps, loggerx.MsgProcessEnded)
	c.JSON(200, httpx.Response{
		Status:  0,
		Message: msg.GetMsg("ja-JP", msg.Info, msg.I013, fmt.Sprintf(httpx.Temp, AppProcessName, ActionRecoverSelectApps)),
		Data:    response,
	})
}
