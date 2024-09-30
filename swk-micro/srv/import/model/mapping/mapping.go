package mapping

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/kataras/i18n"
	"github.com/micro/go-micro/v2/client"
	"golang.org/x/text/encoding/japanese"
	"golang.org/x/text/transform"
	"rxcsoft.cn/pit3/srv/database/proto/field"
	"rxcsoft.cn/pit3/srv/database/proto/item"
	"rxcsoft.cn/pit3/srv/import/common/filex"
	"rxcsoft.cn/pit3/srv/import/common/jobx"
	"rxcsoft.cn/pit3/srv/import/common/langx"
	"rxcsoft.cn/pit3/srv/import/common/loggerx"
	"rxcsoft.cn/pit3/srv/import/model"
	"rxcsoft.cn/pit3/srv/manage/proto/app"
	"rxcsoft.cn/pit3/srv/manage/proto/user"
	"rxcsoft.cn/pit3/srv/task/proto/task"
	"rxcsoft.cn/pit3/srv/task/utils"
	storagecli "rxcsoft.cn/utils/storage/client"
)

// Import 文件导入并上传
func Import(base Params, filePath string) {

	appID := base.AppId
	datastoreID := base.DatastoreId
	mappingID := base.MappingID
	jobID := base.JobId
	domain := base.Domain
	lang := base.Lang
	userID := base.UserId
	roles := base.Roles
	owners := base.Owners
	db := base.Database
	updateOwners := base.UpdateOwners

	// 发送消息 开始读取数据
	jobx.ModifyTask(task.ModifyRequest{
		JobId:       jobID,
		Message:     "アップロードされたファイルを取得する",
		CurrentStep: "get-file",
		Database:    db,
	}, userID)

	minioClient, err := storagecli.NewClient(domain)
	if err != nil {
		loggerx.ErrorLog("readCsvFileAndImport", err.Error())
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "csvファイルの読み取りに失敗しました",
			CurrentStep: "get-file",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	}

	// 自动删除minio中的临时文件
	defer func() {
		if len(filePath) > 0 {
			os.Remove(filePath)
			minioClient.DeleteObject(filePath)
		}
		// 最后删除public文件夹
		os.Remove("public/app_" + appID)
	}()

	// 发送消息 开始读取数据
	jobx.ModifyTask(task.ModifyRequest{
		JobId:       jobID,
		Message:     i18n.Tr(lang, "job.J_001"),
		CurrentStep: "read-file",
		Database:    db,
	}, userID)

	// 从minio获取文件到本地临时文件夹备用
	err = model.GetFile(domain, appID, filePath)
	if err != nil {
		loggerx.ErrorLog("ReadCheckCsvFileAndImport", err.Error())
		// 編輯錯誤日誌文件
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     i18n.Tr(lang, "job.J_016"),
			CurrentStep: "read-file",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	}

	// 发送消息 开始读取数据
	model.ModifyTask(task.ModifyRequest{
		JobId:       jobID,
		Message:     "依存データの取得",
		CurrentStep: "data-ready",
		Database:    db,
	}, userID)

	// 获取app设置的无效特殊字符
	appService := app.NewAppService("manage", client.DefaultClient)

	var req app.FindAppRequest
	req.AppId = appID
	req.Database = db
	response, err := appService.FindApp(context.TODO(), &req)
	if err != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "ファイルのアップロード中にエラーが発生しました。",
			CurrentStep: "save-file",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)
		return
	}
	specialChars := response.GetApp().GetConfigs().GetSpecial()
	var specialchar string
	if len(specialChars) != 0 {
		// 编辑特殊字符
		for i := 0; i < len(specialChars); {
			specialchar += specialChars[i : i+1]
			i += 2
		}
	}

	// 读取文件
	fs, err := os.Open(filePath)
	if err != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "ファイルを開くことができません",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)
		return
	}
	defer fs.Close()

	mappingInfo, e1 := getMappingInfo(db, datastoreID, mappingID)
	if e1 != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{e1.Error()})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "マッピングの取得に失敗しました",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)
		return
	}

	// 获取台账字段
	fields := model.GetFields(db, datastoreID, appID, roles, false)
	if len(fields) == 0 {
		path := filex.WriteAndSaveFile(domain, appID, []string{"フィールドの取得に失敗しました"})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "フィールドの取得に失敗しました",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)
		return
	}

	// 获取当前app的语言数据
	langData := langx.GetLanguageData(db, lang, domain)
	if langData == nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{"言語データの取得に失敗しました"})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "言語データの取得に失敗しました",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)
		return
	}

	// 读取文件获取文件总行数
	fsTotal, err := os.Open(filePath)
	if err != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
		// 发送消息 数据验证错误，停止上传
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "ファイルを開くことができません",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)
		return
	}
	defer fsTotal.Close()

	var rTotal *csv.Reader
	// UTF-8格式的场合，直接读取
	if mappingInfo.CharEncoding == "UTF-8" {
		rTotal = csv.NewReader(fsTotal)
	} else {
		// ShiftJIS格式的场合，先转换为uft-8，再读取
		utfReader := transform.NewReader(fsTotal, japanese.ShiftJIS.NewDecoder())
		rTotal = csv.NewReader(utfReader)
	}

	// 读取CSV文件的所有行
	rows, err := rTotal.ReadAll()
	if err != nil {
		fmt.Println("Error reading CSV file:", err)
		return
	}

	// 计算总行数
	total := len(rows) - 1

	// 获取关联数据，以便于数据验证
	var userList []*user.User
	optionsMap := make(map[string]OptionMap)

	ds, err := getDatastore(db, datastoreID)
	if err != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})

		// 发送消息 数据查询错误
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "台帳データの取得に失敗しました",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	}

	for _, fs := range fields {
		if fs.FieldType == "user" {
			if len(userList) == 0 {
				userList = model.GetUsers(db, appID, domain)
			}
		}
		if fs.FieldType == "options" {
			if _, ok := optionsMap[fs.FieldId]; !ok {
				optionsMap[fs.FieldId] = GetOptionMap(db, appID, fs.OptionId, langData)
			}
		}
	}

	var r *csv.Reader
	// UTF-8格式的场合，直接读取
	if mappingInfo.CharEncoding == "UTF-8" {
		r = csv.NewReader(fs)
	} else {
		// ShiftJIS格式的场合，先转换为uft-8，再读取
		utfReader := transform.NewReader(fs, japanese.ShiftJIS.NewDecoder())
		r = csv.NewReader(utfReader)
	}
	r.LazyQuotes = true

	if mappingInfo.SeparatorChar == "," {
		r.Comma = 44 // 逗号
	} else {
		r.Comma = 9 // 制表符
	}

	/* itemService := item.NewItemService("database", client.DefaultClient)

	var opss client.CallOption = func(o *client.CallOptions) {
		o.RequestTimeout = time.Minute * 10
		o.DialTimeout = time.Minute * 10
	}

	stream, err := itemService.MappingUpload(context.Background(), opss)
	if err != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})

		// 发送消息 数据查询错误
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "ファイルアップロードの初期化に失敗しました",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	}

	err = stream.Send(&item.MappingUploadRequest{
		Status: item.SendStatus_SECTION,
		Request: &item.MappingUploadRequest_Meta{
			Meta: &item.MappingMetaData{
				AppId:        appID,
				DatastoreId:  datastoreID,
				MappingType:  mappingInfo.MappingType,
				UpdateType:   mappingInfo.UpdateType,
				Writer:       userID,
				Owners:       owners,
				UpdateOwners: updateOwners,
				Database:     db,
			},
		},
	})

	if err != nil {
		path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})

		// 发送消息 数据查询错误
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     "ファイルアップロードメタ送信に失敗しました",
			CurrentStep: "data-ready",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	} */

	fieldService := field.NewFieldService("database", client.DefaultClient)

	// 所有字段
	var allFields []*item.Field
	var userbool = false
	uMap := make(map[string]string)
	fMap := make(map[string]*item.Field)

	var reqFields field.FieldsRequest
	reqFields.DatastoreId = datastoreID
	reqFields.AppId = appID
	reqFields.Database = db
	reqFields.AsTitle = "false"

	responseFields, errF := fieldService.FindFields(context.TODO(), &reqFields)
	if errF != nil {
		utils.ErrorLog("MappingImport", err.Error())
		return
	}

	for _, fd := range responseFields.GetFields() {
		if fd.FieldType == "user" {
			userbool = true
		}
		value := item.Field(*fd)
		fMap[fd.FieldId] = &value

		allFields = append(allFields, &value)
	}

	if userbool {
		userService := user.NewUserService("manage", client.DefaultClient)

		var reqUser user.FindUsersRequest
		reqUser.InvalidatedIn = "true"
		reqUser.Domain = domain
		reqUser.Database = db

		responseUser, err1 := userService.FindUsers(context.TODO(), &reqUser)
		if err1 == nil {
			for _, u := range responseUser.Users {
				uMap[u.UserId] = u.UserName
			}
		}
	}

	var langI item.Language
	var appI item.App
	langI.Apps = make(map[string]*item.App)
	langI.Common = (*item.Common)(langData.Common)
	for key, value := range langData.Apps {
		appI.AppName = value.AppName
		appI.Datastores = value.Datastores
		appI.Fields = value.Fields
		appI.Queries = value.Queries
		appI.Reports = value.Reports
		appI.Dashboards = value.Dashboards
		appI.Statuses = value.Statuses
		appI.Options = value.Options
		appI.Mappings = value.Mappings
		appI.Workflows = value.Workflows
		langI.Apps[key] = &appI
	}

	/* userService := user.NewUserService("manage", client.DefaultClient)

	var reqUser user.FindUsersRequest
	reqUser.InvalidatedIn = "true"
	reqUser.Domain = domain
	reqUser.Database = db

	responseUser, err1 := userService.FindUsers(context.TODO(), &reqUser)
	if err1 != nil {
		return
	}

	for _, u := range responseUser.Users {
		uMap[u.UserId] = u.UserName
	} */

	// 发送消息 开始进行数据上传（包括数据验证和上传错误）
	jobx.ModifyTask(task.ModifyRequest{
		JobId:       jobID,
		Message:     i18n.Tr(lang, "job.J_046"),
		CurrentStep: "build-check-data",
		Database:    db,
	}, userID)

	index := 0
	var insertCount int
	var updateCount int
	var header []string
	/* var items []item.ChangeData */
	var errorList []string
	// 重新定位文件指针到文件开头
	/* fs.Seek(0, 0) */

	// 针对大文件，一行一行的读取文件
	for {
		row, err := r.Read()
		if err == io.EOF {
			break
		}
		// 出现读写错误，直接返回
		if err != nil {
			path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
			// 发送消息 数据验证错误，停止上传
			jobx.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     "ファイルの読み込みに失敗しました",
				CurrentStep: "build-check-data",
				EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
				ErrorFile: &task.File{
					Url:  path.MediaLink,
					Name: path.Name,
				},
				Database: db,
			}, userID)
			return
		}
		// 验证行数据是否只包含逗号，只有逗号的行不合法
		isValid, errmsg := filex.CheckRowDataValid(row, index)
		if !isValid {
			path := filex.WriteAndSaveFile(domain, appID, []string{errmsg})

			// 发送消息 数据验证错误，停止上传
			model.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     errmsg,
				CurrentStep: "check-data",
				EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
				ErrorFile: &task.File{
					Url:  path.MediaLink,
					Name: path.Name,
				},
				Database: db,
			}, userID)

			return
		}

		if index == 0 {
			header = row
			// 去除utf-8 withbom的前缀
			header[0] = strings.Replace(header[0], "\ufeff", "", 1)

			index++
			continue
		}

		// 验证中有错误，放入全局的验证错误中，等待全部验证完毕后一起返回
		parm := bvParam{
			AppID:       appID,
			Datastore:   datastoreID,
			DB:          db,
			Data:        row,
			Header:      header,
			Fields:      fields,
			LangData:    *langData.Apps[appID],
			UserList:    userList,
			OptionMap:   optionsMap,
			MappingInfo: *mappingInfo,
			Relations:   ds.GetRelations(),
			Index:       index,
			Special:     specialchar,
			EmptyChange: base.EmptyChange,
		}

		result, errList := buildAndValidate(parm)
		if len(errList) > 0 {
			errorList = append(errorList, errList...)
			index++
			continue
		}

		itemService := item.NewItemService("database", client.DefaultClient)

		var req item.ImportMappingRequest
		req.DB = db
		req.AppId = appID
		req.DatastoreId = datastoreID
		req.UserId = userID
		req.Owners = owners
		req.UpdateOwners = updateOwners
		req.MappingType = mappingInfo.MappingType
		req.UpdateType = mappingInfo.UpdateType
		req.EmptyChange = base.EmptyChange
		req.Change = result.Change
		req.Query = result.Query
		req.Index = result.Index
		req.LangCd = lang
		req.Domain = domain
		req.UMap = uMap
		req.FMap = fMap
		req.AllFields = allFields
		req.Language = &langI

		ress, _ := itemService.ImportMappingItem(context.Background(), &req)
		/* if errm != nil {
			path := filex.WriteAndSaveFile(domain, appID, []string{errm.Error()})
			// 发送消息 出现错误
			jobx.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     "データのアップロードに失敗しました",
				CurrentStep: "build-check-data",
				EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
				ErrorFile: &task.File{
					Url:  path.MediaLink,
					Name: path.Name,
				},
				Database: db,
			}, userID)
			return
		} */
		/* items = append(items, result) */
		if ress != nil {
			errorList = append(errorList, ress.ErrorMsg...)
			/* for _, mes := range ress.ErrorMsg {
				errorList = append(errorList, mes)
			} */
		}

		if ress.MappingType == "insert" {
			insertCount++
		}

		if ress.MappingType == "update" {
			updateCount++
		}

		if index%500 == 0 && len(errorList) == 0 {
			// 返回消息
			result := make(map[string]interface{})

			result["total"] = total
			result["current"] = index

			message, _ := json.Marshal(result)

			model.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     string(message),
				CurrentStep: "build-check-data",
				Database:    db,
			}, userID)
		}

		if index == total && len(errorList) == 0 {

			// 返回消息
			result := make(map[string]interface{})

			result["inserted"] = insertCount
			result["updated"] = updateCount
			result["total"] = total

			message, _ := json.Marshal(result)

			model.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     string(message),
				CurrentStep: "build-check-data",
				Database:    db,
			}, userID)
		}

		index++
	}

	defer os.Remove(filePath)

	// 返回全局错误
	if len(errorList) > 0 {
		path := filex.WriteAndSaveFile(domain, appID, errorList)

		// 发送消息 出现错误
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     i18n.Tr(lang, "job.J_003"),
			CurrentStep: "build-check-data",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	}

	/* go func() {
		// 开始导入
		for _, data := range items {
			err := stream.Send(&item.MappingUploadRequest{
				Status: item.SendStatus_SECTION,
				Request: &item.MappingUploadRequest_Data{
					Data: &data,
				},
			})

			if err == io.EOF {
				return
			}

			if err != nil {
				path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
				// 发送消息 数据验证错误，停止上传
				jobx.ModifyTask(task.ModifyRequest{
					JobId:       jobID,
					Message:     "ファイルのアップロード中にエラーが発生しました。",
					CurrentStep: "upload",
					EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
					ErrorFile: &task.File{
						Url:  path.MediaLink,
						Name: path.Name,
					},
					Database: db,
				}, userID)
				return
			}
		}

		err := stream.Send(&item.MappingUploadRequest{
			Status: item.SendStatus_COMPLETE,
			Request: &item.MappingUploadRequest_Data{
				Data: nil,
			},
		})

		if err != nil {
			path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
			// 发送消息 数据验证错误，停止上传
			jobx.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     "ファイルのアップロード中にエラーが発生しました。",
				CurrentStep: "upload",
				EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
				ErrorFile: &task.File{
					Url:  path.MediaLink,
					Name: path.Name,
				},
				Database: db,
			}, userID)
			return
		}
	}()

	// 如果执行成功
	total := int64(len(items))
	var inserted int64 = 0
	var updated int64 = 0

	for {
		result, err := stream.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			path := filex.WriteAndSaveFile(domain, appID, []string{err.Error()})
			// 发送消息 数据验证错误，停止上传
			jobx.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     "ファイルのアップロード中にエラーが発生しました。",
				CurrentStep: "upload",
				EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
				ErrorFile: &task.File{
					Url:  path.MediaLink,
					Name: path.Name,
				},
				Database: db,
			}, userID)
			return
		}

		if result.Status == item.Status_FAILED {
			// 如果有失败的情况发生
			// cancel()
			for _, e := range result.GetResult().GetErrors() {
				eMsg := "第{0}〜{1}行目でエラーが発生しました。エラー内容：{2}"
				fieldErrorMsg := "第{0}行目でエラーが発生しました。フィールド名：[{1}]、エラー内容：{2}"
				noFieldErrorMsg := "第{0}行目でエラーが発生しました。エラー内容：{1}"
				if len(e.FieldId) == 0 {
					if e.CurrentLine != 0 {
						es, _ := msg.Format(noFieldErrorMsg, strconv.FormatInt(e.CurrentLine, 10), e.ErrorMsg)
						errorList = append(errorList, es)
					} else {
						es, _ := msg.Format(eMsg, strconv.FormatInt(e.FirstLine, 10), strconv.FormatInt(e.LastLine, 10), e.ErrorMsg)
						errorList = append(errorList, es)
					}
				} else {
					es, _ := msg.Format(fieldErrorMsg, strconv.FormatInt(e.CurrentLine, 10), langx.GetLangValue(langData, langx.GetFieldKey(appID, datastoreID, e.FieldId), langx.DefaultResult), e.ErrorMsg)
					errorList = append(errorList, es)
				}
			}

			continue
		}

		if result.Status == item.Status_SUCCESS {

			inserted = inserted + result.Result.Insert
			updated = updated + result.Result.Modify
			importMsg, _ := json.Marshal(map[string]interface{}{
				"total":    total,
				"inserted": inserted,
				"updated":  updated,
			})

			progress := (inserted + updated) / total * 100

			// 发送消息 收集上传结果
			jobx.ModifyTask(task.ModifyRequest{
				JobId:       jobID,
				Message:     string(importMsg),
				CurrentStep: "upload",
				Progress:    int64(progress),
				Insert:      int64(inserted),
				Update:      int64(updated),
				Total:       total,
				Database:    db,
			}, userID)

			continue
		}
	} */

	// stream.Close()

	// 表示有部分发生错误
	/* if len(errorList) > 0 {
		path := filex.WriteAndSaveFile(domain, appID, errorList)

		// 发送消息 出现错误
		jobx.ModifyTask(task.ModifyRequest{
			JobId:       jobID,
			Message:     i18n.Tr(lang, "job.J_008"),
			CurrentStep: "end",
			EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
			ErrorFile: &task.File{
				Url:  path.MediaLink,
				Name: path.Name,
			},
			Database: db,
		}, userID)

		return
	} */

	// 完成全部导入
	jobx.ModifyTask(task.ModifyRequest{
		JobId:       jobID,
		Message:     i18n.Tr(lang, "job.J_009"),
		CurrentStep: "end",
		Progress:    100,
		EndTime:     time.Now().UTC().Format("2006-01-02 15:04:05"),
		Database:    db,
	}, userID)

}
