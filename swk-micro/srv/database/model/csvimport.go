package model

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/spf13/cast"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"rxcsoft.cn/pit3/srv/database/proto/item"
	"rxcsoft.cn/pit3/srv/database/utils"
	"rxcsoft.cn/pit3/srv/global/proto/language"
	database "rxcsoft.cn/utils/mongo"
)

type ImportData struct {
	ID           primitive.ObjectID `json:"id" bson:"_id"`
	Item_Id      string             `json:"item_id" bson:"item_id"`
	App_Id       string             `json:"app_id" bson:"app_id"`
	Datastore_Id string             `json:"datastore_id" bson:"datastore_id"`
	Items        ItemMap            `json:"items" bson:"items"`
	Owners       []string           `json:"owners" bson:"owners"`
	CheckType    string             `json:"check_type" bson:"check_type"`
	CheckStatus  string             `json:"check_status" bson:"check_status"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	CreatedBy    string             `json:"created_by" bson:"created_by"`
	UpdatedAt    time.Time          `json:"updated_at" bson:"updated_at"`
	UpdatedBy    string             `json:"updated_by" bson:"updated_by"`
	CheckedAt    time.Time          `json:"checked_at" bson:"checked_at"`
	CheckedBy    string             `json:"checked_by" bson:"checked_by"`
	LabelTime    time.Time          `json:"label_time" bson:"label_time"`
	Status       string             `json:"status" bson:"status"`
}

func insertAttachData(client *mongo.Client, sc mongo.SessionContext, p AttachParam) error {

	data := make(map[string][]*Item)

	for _, it := range p.Items {
		it.ID = primitive.NewObjectID()
		it.ItemID = it.ID.Hex()
		it.Status = "1"
		it.Owners = p.Owners
		data[it.DatastoreID] = append(data[it.DatastoreID], it)
	}

	for datastoreID, items := range data {
		c := client.Database(database.GetDBName(p.DB)).Collection(GetItemCollectionName(datastoreID))

		step := len(items)
		autoList := make(map[string][]string)

		allFields := p.FileMap[datastoreID]
		for _, f := range allFields {
			if f.FieldType == "autonum" {
				list, err := autoNumListWithSession(sc, p.DB, &f, step)
				if err != nil {
					utils.ErrorLog("insertAttachData", err.Error())
					return err
				}
				autoList[f.FieldID] = list
			}

		}

		var insertData []interface{}
		for index, it := range items {
			for _, f := range allFields {
				if f.FieldType == "autonum" {
					nums := autoList[f.FieldID]
					it.ItemMap[f.FieldID] = &Value{
						DataType: "autonum",
						Value:    nums[index],
					}
				}

				addEmptyData(it.ItemMap, f)
			}

			insertData = append(insertData, it)
		}
		_, err := c.InsertMany(sc, insertData)
		if err != nil {
			utils.ErrorLog("insertAttachData", err.Error())
			return err
		}
	}

	return nil
}

func ImportCSVItem(ctx context.Context, userID string, db string, datastoreId string, appId string, owners []string, action string, emptyChange bool, items map[string]*item.Value, langCD string, domain string, uMap map[string]string, langData *item.Language) (m []*item.Error, err error) {

	client := database.New()
	c := client.Database(database.GetDBName(db)).Collection("item_" + datastoreId)

	var importErrors []*item.Error
	var cxModels []mongo.WriteModel
	var itemList []*Item
	fieldMap := make(map[string][]Field)
	insert := 1
	autoList := make(map[string][]string)

	if action == "update" {
		queryItem := bson.M{
			"owners": bson.M{
				"$in": owners,
			},
		}
		queryItem["item_id"] = items["id"].Value
		itemList = findItems(db, datastoreId, queryItem)
	}

	// 根据所有台账，获取所有字段数据
	fm, err := getFieldMap(db, appId)
	if err != nil {
		return nil, err
	}

	/* fieldMap = fm */

	fMap := make(map[string]Field)
	for _, fd := range fm[datastoreId] {
		fMap[fd.FieldID] = fd
	}

	keyValue := make(map[string]*Value)
	var line int
	for key, typeAndValue := range items {
		if key != "action" && key != "index" && key != "id" {
			theValue := Value{
				DataType: typeAndValue.DataType,
				Value:    typeAndValue.Value,
			}

			if typeAndValue.DataType == "date" {
				if typeAndValue.GetValue() == "" {
					date, _ := time.Parse("2006-01-02", "0001-01-01")
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    date,
					}
				} else {
					date, err := time.Parse("2006-01-02", typeAndValue.GetValue())
					if err != nil {
						utils.ErrorLog("MappingImport", err.Error())
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							ErrorMsg: err.Error(),
						})
					}
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    date,
					}
				}
			}

			if typeAndValue.DataType == "number" && typeAndValue.GetValue() != "" {
				floatValue, err := strconv.ParseFloat(typeAndValue.GetValue(), 64)
				if err != nil {
					utils.ErrorLog("MappingImport", err.Error())
					// 返回错误信息
					importErrors = append(importErrors, &item.Error{
						ErrorMsg: err.Error(),
					})
				}
				theValue = Value{
					DataType: typeAndValue.DataType,
					Value:    floatValue,
				}
			}

			if typeAndValue.DataType == "user" {
				if len(typeAndValue.GetValue()) == 0 {
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    []string{},
					}
				} else {
					result := strings.Split(typeAndValue.GetValue(), ",")
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    result,
					}
				}
			}

			keyValue[key] = &theValue
		}
		if key == "index" {
			num, _ := strconv.Atoi(typeAndValue.Value)
			line = num
		}
	}

	var langL language.Language
	var appL language.App
	langL.Apps = make(map[string]*language.App)
	langL.Common = (*language.Common)(langData.Common)
	for key, value := range langData.Apps {
		appL.AppName = value.AppName
		appL.Datastores = value.Datastores
		appL.Fields = value.Fields
		appL.Queries = value.Queries
		appL.Reports = value.Reports
		appL.Dashboards = value.Dashboards
		appL.Statuses = value.Statuses
		appL.Options = value.Options
		appL.Mappings = value.Mappings
		appL.Workflows = value.Workflows
		langL.Apps[key] = &appL
	}

	callback := func(sc mongo.SessionContext) (interface{}, error) {

		/* hs := NewHistory(db, userID, datastoreId, langCD, domain, sc, fieldMap[datastoreId]) */

		hs := &HistoryServer{
			db:    db,
			uid:   userID,
			did:   datastoreId,
			datas: make(map[string]*Data),
			sc:    sc,
			uMap:  uMap,
			fMap:  fMap,
			lang:  &langL,
		}

		for _, f := range fieldMap[datastoreId] {
			if f.FieldType == "autonum" {
				list, err := autoNumListWithSession(sc, db, &f, insert)
				if err != nil {
					if err.Error() != "(WriteConflict) WriteConflict" {
						utils.ErrorLog("ImportItem", err.Error())
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							ErrorMsg: err.Error(),
						})
					}
					return importErrors, err
				}
				autoList[f.FieldID] = list
			}
		}

		if action == "insert" {

			dataItem := Item{
				AppID:       appId,
				DatastoreID: datastoreId,
				ItemMap:     keyValue,
				Owners:      owners,
				CreatedAt:   time.Now(),
				CreatedBy:   userID,
				UpdatedAt:   time.Now(),
				UpdatedBy:   userID,
			}
			dataItem.ID = primitive.NewObjectID()
			dataItem.ItemID = dataItem.ID.Hex()
			dataItem.Status = "1"
			dataItem.CheckStatus = "0"

			for _, f := range fieldMap[datastoreId] {
				if f.FieldType == "autonum" {
					nums := autoList[f.FieldID]
					dataItem.ItemMap[f.FieldID] = &Value{
						DataType: "autonum",
						Value:    nums[0],
					}
					continue
				}
				//  添加空数据
				addEmptyData(dataItem.ItemMap, f)
			}

			err := hs.Add(cast.ToString(line), dataItem.ItemID, nil)
			if err != nil {
				utils.ErrorLog("MappingImport", err.Error())
				// 返回错误信息
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			insertCxModel := mongo.NewInsertOneModel()
			insertCxModel.SetDocument(dataItem)
			cxModels = append(cxModels, insertCxModel)

			err = hs.Compare(cast.ToString(line), dataItem.ItemMap)
			if err != nil {
				// 返回错误信息
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			/* _, err := c.InsertOne(ctx, *h1)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return err
			} */
		}

		if action == "update" && emptyChange {
			if len(itemList) == 0 {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: fmt.Sprintf("行 %d はエラーです,この台帳には該当するデータはありませんでした。", line),
				})
				utils.ErrorLog("MappingImport", fmt.Sprintf("行 %d はエラーです,この台帳には該当するデータはありませんでした。", line))
				return importErrors, nil
			}

			err := hs.Add(cast.ToString(line), items["id"].Value, itemList[0].ItemMap)
			if err != nil {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			// 自增字段不更新
			for _, f := range fieldMap[datastoreId] {
				if f.FieldType == "autonum" {
					if itemList[0] != nil {
						delete(itemList[0].ItemMap, f.FieldID)
					}
					delete(keyValue, f.FieldID)
				}
				_, ok := keyValue[f.FieldID]
				// 需要进行自算的情况
				if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
					if f.SelfCalculate == "add" {
						o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
						n := GetNumberValue(keyValue[f.FieldID])
						keyValue[f.FieldID].Value = o + n
						continue
					}
					if f.SelfCalculate == "sub" {
						o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
						n := GetNumberValue(keyValue[f.FieldID])
						keyValue[f.FieldID].Value = o - n
						continue
					}
				}
			}

			query := bson.M{
				"item_id": items["id"].Value,
			}

			change := bson.M{}

			for m, n := range keyValue {
				change["items."+m+".value"] = n.Value
			}
			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(query)
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err = hs.Compare(cast.ToString(line), itemList[0].ItemMap)
			if err != nil {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			/* queryJSON, _ := json.Marshal(query)
			utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

			updateSON, _ := json.Marshal(update)
			utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

			_, err := c.UpdateOne(ctx, query, update)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return err
			} */
		}

		if action == "update" && !emptyChange {

			if len(itemList) == 0 {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: fmt.Sprintf("行 %d はエラーです,この台帳には該当するデータはありませんでした。", line),
				})
				utils.ErrorLog("MappingImport", fmt.Sprintf("行 %d はエラーです,この台帳には該当するデータはありませんでした。", line))
				return importErrors, nil
			}

			err := hs.Add(cast.ToString(line), items["id"].Value, itemList[0].ItemMap)
			if err != nil {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			// 自增字段不更新
			for _, f := range fieldMap[datastoreId] {
				if f.FieldType == "autonum" {
					if itemList[0] != nil {
						delete(itemList[0].ItemMap, f.FieldID)
					}
					delete(keyValue, f.FieldID)
				}
				_, ok := keyValue[f.FieldID]
				// 需要进行自算的情况
				if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
					if f.SelfCalculate == "add" {
						o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
						n := GetNumberValue(keyValue[f.FieldID])
						keyValue[f.FieldID].Value = o + n
						continue
					}
					if f.SelfCalculate == "sub" {
						o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
						n := GetNumberValue(keyValue[f.FieldID])
						keyValue[f.FieldID].Value = o - n
						continue
					}
				}
			}

			query := bson.M{
				"item_id": items["id"].Value,
			}

			change := bson.M{}

			for key, typeAndValue := range keyValue {
				if typeAndValue.Value != "" {
					change["items."+key+".value"] = typeAndValue.Value
				}
			}

			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(query)
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err = hs.Compare(cast.ToString(line), itemList[0].ItemMap)
			if err != nil {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			/* queryJSON, _ := json.Marshal(query)
			utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

			updateSON, _ := json.Marshal(update)
			utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

			_, err := c.UpdateOne(ctx, query, update)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return err
			} */
		}

		if action == "image" {

			err := hs.Add(cast.ToString(line), items["id"].Value, nil)
			if err != nil {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}

			query := bson.M{
				"item_id": items["id"].Value,
			}

			change := bson.M{}

			for m, n := range keyValue {
				change["items."+m+".value"] = n.Value
			}
			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(query)
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err = hs.Compare(cast.ToString(line), nil)
			if err != nil {
				importErrors = append(importErrors, &item.Error{
					ErrorMsg: err.Error(),
				})
				return importErrors, err
			}
		}

		if len(cxModels) > 0 {
			_, err := c.BulkWrite(sc, cxModels)
			if err != nil {
				isDuplicate := mongo.IsDuplicateKeyError(err)
				if isDuplicate {
					bke, ok := err.(mongo.BulkWriteException)
					if !ok {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							ErrorMsg: err.Error(),
						})

						utils.ErrorLog("ImportItem", err.Error())
						return importErrors, err
					}
					errInfo := bke.WriteErrors[0]
					em := errInfo.Message
					values := utils.FieldMatch(`"([^\"]+)"`, em[strings.LastIndex(em, "dup key"):])
					for i, v := range values {
						values[i] = strings.Trim(v, `"`)
					}
					fields := utils.FieldMatch(`field_[0-9a-z]{3}`, em[strings.LastIndex(em, "dup key"):])
					// 返回错误信息
					importErrors = append(importErrors, &item.Error{
						ErrorMsg: fmt.Sprintf("プライマリキーの重複エラー、API-KEY[%s],重複値は[%s]です。", strings.Join(fields, ","), strings.Join(values, ",")),
					})

					utils.ErrorLog("ImportItem", errInfo.Message)
					return importErrors, errInfo
				}

				utils.ErrorLog("ImportItem", err.Error())
				return importErrors, err
			}
		}

		// 提交履历
		err := hs.Commit()
		if err != nil {
			utils.ErrorLog("ImportItem", err.Error())
			// 返回错误信息
			importErrors = append(importErrors, &item.Error{
				ErrorMsg: err.Error(),
			})

			return importErrors, err
		}
		return importErrors, err
	}
	opts := &options.SessionOptions{}
	// 提交时间改为5分钟
	commitTime := 5 * time.Minute
	opts.SetDefaultMaxCommitTime(&commitTime)
	opts.SetDefaultReadConcern(readconcern.Snapshot())

	session, err := client.StartSession(opts)
	if err != nil {
		utils.ErrorLog("ImportItem", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.Error{
			ErrorMsg: err.Error(),
		})
	}

	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, callback)
	if err != nil {
		utils.ErrorLog("ImportItem", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.Error{
			ErrorMsg: err.Error(),
		})
		return importErrors, nil
	}

	return importErrors, nil
}

func ImportINVItem(ctx context.Context, db string, datastoreId string, checkStatus string, checkType string, checkAt string, checkBy string, mainKeyQuery map[string]*item.Value) error {

	client := database.New()
	c := client.Database(database.GetDBName(db)).Collection("item_" + datastoreId)

	query := bson.M{}

	for m, n := range mainKeyQuery {
		query["items."+m+".value"] = n.Value
	}

	check_at, err1 := time.Parse("2006-01-02 15:04:05", checkAt)
	if err1 != nil {
		check_at = time.Time{}
	}

	change := bson.M{}

	change["check_type"] = checkType
	change["check_status"] = checkStatus
	change["updated_at"] = time.Now()
	change["updated_by"] = checkBy
	change["checked_at"] = check_at
	change["checked_by"] = checkBy

	update := bson.M{"$set": change}

	queryJSON, _ := json.Marshal(query)
	utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

	updateSON, _ := json.Marshal(update)
	utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

	_, err := c.UpdateOne(ctx, query, update)
	if err != nil {
		utils.ErrorLog("error ModifyUser", err.Error())
		return err
	}

	return nil
}

func ImportMappingItem(ctx context.Context, db string, datastoreId string, appId string, userID string, owners []string, updateOwners []string, mappingType string, updateType string, emptyChange bool, change map[string]*item.Value, query map[string]*item.Value, index int64, langCD string, domain string, uMap map[string]string, fMapI map[string]*item.Field, allFieldsI []*item.Field, langData *item.Language) (m []*item.MappingError, mapType string, err error) {

	client := database.New()
	c := client.Database(database.GetDBName(db)).Collection("item_" + datastoreId)

	// 返回错误
	var importErrors []*item.MappingError
	// 执行任务
	var cxModels []mongo.WriteModel
	// 所有字段
	var allFields []Field
	// 必须字段
	var requriedFields []Field
	// 自动採番字段
	var autoFields []Field
	var mType string

	for _, fd := range allFieldsI {
		var aaa Field
		aaa.FieldID = fd.FieldId
		aaa.AppID = fd.AppId
		aaa.DatastoreID = fd.DatastoreId
		aaa.FieldName = fd.FieldName
		aaa.FieldType = fd.FieldType
		aaa.IsRequired = fd.IsRequired
		aaa.IsFixed = fd.IsFixed
		aaa.IsImage = fd.IsImage
		aaa.IsCheckImage = fd.IsCheckImage
		aaa.Unique = fd.Unique
		aaa.LookupAppID = fd.LookupAppId
		aaa.LookupDatastoreID = fd.LookupDatastoreId
		aaa.LookupFieldID = fd.LookupFieldId
		aaa.UserGroupID = fd.UserGroupId
		aaa.OptionID = fd.OptionId
		aaa.Cols = fd.Cols
		aaa.Rows = fd.Rows
		aaa.X = fd.X
		aaa.Y = fd.Y
		aaa.MinLength = fd.MinLength
		aaa.MaxLength = fd.MaxLength
		aaa.MinValue = fd.MinValue
		aaa.MaxValue = fd.MaxValue
		aaa.AsTitle = fd.AsTitle
		aaa.Width = fd.Width
		aaa.DisplayOrder = fd.DisplayOrder
		aaa.DisplayDigits = fd.DisplayDigits
		aaa.Precision = fd.Precision
		aaa.Prefix = fd.Prefix
		aaa.ReturnType = fd.ReturnType
		aaa.Formula = fd.Formula
		aaa.SelfCalculate = fd.SelfCalculate
		aaa.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", fd.CreatedAt)
		aaa.CreatedBy = fd.CreatedBy
		aaa.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", fd.UpdatedAt)
		aaa.UpdatedBy = fd.UpdatedBy
		aaa.DeletedAt, _ = time.Parse("2006-01-02 15:04:05", fd.DeletedAt)
		aaa.DeletedBy = fd.DeletedBy
		allFields = append(allFields, aaa)
	}

	for _, f := range allFields {
		if f.IsRequired {
			requriedFields = append(requriedFields, f)
		}
		if f.FieldType == "autonum" {
			autoFields = append(autoFields, f)
		}
	}

	fMap := make(map[string]Field)
	for _, fd := range allFields {
		fMap[fd.FieldID] = fd
	}

	var langL language.Language
	var appL language.App
	langL.Apps = make(map[string]*language.App)
	langL.Common = (*language.Common)(langData.Common)
	for key, value := range langData.Apps {
		appL.AppName = value.AppName
		appL.Datastores = value.Datastores
		appL.Fields = value.Fields
		appL.Queries = value.Queries
		appL.Reports = value.Reports
		appL.Dashboards = value.Dashboards
		appL.Statuses = value.Statuses
		appL.Options = value.Options
		appL.Mappings = value.Mappings
		appL.Workflows = value.Workflows
		langL.Apps[key] = &appL
	}

	callback := func(sc mongo.SessionContext) (interface{}, error) {

		/* hs := NewHistory(db, userID, datastoreId, langCD, domain, sc, allFields) */

		hs := &HistoryServer{
			db:    db,
			uid:   userID,
			did:   datastoreId,
			datas: make(map[string]*Data),
			sc:    sc,
			uMap:  uMap,
			fMap:  fMap,
			lang:  &langL,
		}

		keyValueChange := make(map[string]*Value)
		for key, typeAndValue := range change {
			theValue := Value{
				DataType: typeAndValue.DataType,
				Value:    typeAndValue.Value,
			}

			if typeAndValue.DataType == "date" {
				if typeAndValue.GetValue() == "" {
					date, _ := time.Parse("2006-01-02", "0001-01-01")
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    date,
					}
				} else {
					date, err := time.Parse("2006-01-02", typeAndValue.GetValue())
					if err != nil {
						utils.ErrorLog("MappingImport", err.Error())
						// 返回错误信息
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: err.Error(),
						})
					}
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    date,
					}
				}
			}

			if typeAndValue.DataType == "number" && typeAndValue.GetValue() != "" {
				floatValue, err := strconv.ParseFloat(typeAndValue.GetValue(), 64)
				if err != nil {
					utils.ErrorLog("MappingImport", err.Error())
					// 返回错误信息
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err.Error(),
					})
				}
				theValue = Value{
					DataType: typeAndValue.DataType,
					Value:    floatValue,
				}
			}

			if typeAndValue.DataType == "user" {
				if len(typeAndValue.GetValue()) == 0 {
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    []string{},
					}
				} else {
					result := strings.Split(typeAndValue.GetValue(), ",")
					theValue = Value{
						DataType: typeAndValue.DataType,
						Value:    result,
					}
				}
			}
			keyValueChange[key] = &theValue
		}

		if mappingType == "insert" {
			mType = "insert"
			step := 1
			autoList := make(map[string][]string)

			for _, f := range autoFields {
				list, err := autoNumListWithSession(sc, db, &f, step)
				if err != nil {
					if err.Error() != "(WriteConflict) WriteConflict" {
						utils.ErrorLog("MappingImport", err.Error())
						// 返回错误信息
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: err.Error(),
						})
					}

					return importErrors, err
				} else {
					autoList[f.FieldID] = list
				}
			}

			dataItem := Item{
				AppID:       appId,
				DatastoreID: datastoreId,
				ItemMap:     keyValueChange,
				Owners:      owners,
				CreatedAt:   time.Now(),
				CreatedBy:   userID,
				UpdatedAt:   time.Now(),
				UpdatedBy:   userID,
			}
			dataItem.ID = primitive.NewObjectID()
			dataItem.ItemID = dataItem.ID.Hex()
			dataItem.Status = "1"
			dataItem.CheckStatus = "0"

			err1 := hs.Add(cast.ToString(index), dataItem.ID.Hex(), nil)
			if err1 != nil {
				utils.ErrorLog("MappingImport", err1.Error())
				// 返回错误信息
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, err1
			}

			// 没有必须字段的情况下直接插入数据
			if len(requriedFields) == 0 {
				for _, f := range allFields {
					if f.FieldType == "autonum" {
						nums := autoList[f.FieldID]
						dataItem.ItemMap[f.FieldID] = &Value{
							DataType: "autonum",
							Value:    nums[0],
						}
						continue
					}
					//  添加空数据
					addEmptyData(dataItem.ItemMap, f)
				}

				queryJSON, _ := json.Marshal(dataItem)
				utils.DebugLog("MappingImport", fmt.Sprintf("item: [ %s ]", queryJSON))

				insertCxModel := mongo.NewInsertOneModel()
				insertCxModel.SetDocument(dataItem)
				cxModels = append(cxModels, insertCxModel)

				err = hs.Compare(cast.ToString(index), dataItem.ItemMap)
				if err != nil {
					// 返回错误信息
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err.Error(),
					})
					return importErrors, err
				}
			}

			// 有必须字段的情况下，先判断是否必须字段是否有值
			for _, f := range allFields {
				if f.IsRequired {
					if value, ok := dataItem.ItemMap[f.FieldID]; ok {
						if isEmptyValue(value) {
							importErrors = append(importErrors, &item.MappingError{
								ErrorMsg: "このフィールドは必須フィールドです",
							})
						}
					} else {
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: "このフィールドは必須フィールドです",
						})
					}

					continue
				}

				if f.FieldType == "autonum" {
					nums := autoList[f.FieldID]
					dataItem.ItemMap[f.FieldID] = &Value{
						DataType: "autonum",
						Value:    nums[0],
					}
					continue
				}
				//  添加空数据
				addEmptyData(dataItem.ItemMap, f)
			}

			if len(importErrors) > 0 {
				return importErrors, errors.New("field is required")
			}

			queryJSON, _ := json.Marshal(dataItem)
			utils.DebugLog("MappingImport", fmt.Sprintf("item: [ %s ]", queryJSON))

			insertCxModel := mongo.NewInsertOneModel()
			insertCxModel.SetDocument(dataItem)
			cxModels = append(cxModels, insertCxModel)

			err1 = hs.Compare(cast.ToString(index), dataItem.ItemMap)
			if err1 != nil {
				// 返回错误信息
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, err1
			}

			if len(cxModels) > 0 {
				_, err := c.BulkWrite(sc, cxModels)
				if err != nil {
					isDuplicate := mongo.IsDuplicateKeyError(err)
					if isDuplicate {
						bke, ok := err.(mongo.BulkWriteException)
						if !ok {
							// 返回错误信息
							importErrors = append(importErrors, &item.MappingError{
								ErrorMsg: err.Error(),
							})

							utils.ErrorLog("MappingImport", err.Error())
							return importErrors, err
						}
						errInfo := bke.WriteErrors[0]
						em := errInfo.Message
						values := utils.FieldMatch(`"([^\"]+)"`, em[strings.LastIndex(em, "dup key"):])
						for i, v := range values {
							values[i] = strings.Trim(v, `"`)
						}
						fields := utils.FieldMatch(`field_[0-9a-z]{3}`, em[strings.LastIndex(em, "dup key"):])
						// 返回错误信息
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: fmt.Sprintf("プライマリキーの重複エラー、API-KEY[%s],重複値は[%s]です。", strings.Join(fields, ","), strings.Join(values, ",")),
						})

						utils.ErrorLog("MappingImport", errInfo.Message)
						return importErrors, errInfo
					}

					utils.ErrorLog("MappingImport", err.Error())
					return importErrors, err
				}
			}

			err2 := hs.Commit()
			if err2 != nil {
				// 返回错误信息
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err2.Error(),
				})
				return importErrors, err2
			}
		}

		if mappingType == "update" {
			mType = "update"

			queryItem := bson.M{
				"owners": bson.M{
					"$in": updateOwners,
				},
			}
			for key, value := range query {
				queryItem["items."+key+".value"] = GetValueFromProto(value)
			}
			itemList := findItems(db, datastoreId, queryItem)

			if len(itemList) == 0 {
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: fmt.Sprintf("行 %d はエラーです,この台帳には該当するデータはありませんでした。", index),
				})
				utils.ErrorLog("MappingImport", fmt.Sprintf("行 %d はエラーです,この台帳には該当するデータはありませんでした。", index))
				return importErrors, nil
			} else {
				imperr, cxm, _ := MappingUpdateType(updateType, itemList, importErrors, index, hs, allFields, keyValueChange, emptyChange, userID)
				if len(imperr) > 0 {
					for _, value := range imperr {
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: value.ErrorMsg,
						})
					}
				}
				cxModels = cxm

				if len(cxModels) > 0 {
					_, err := c.BulkWrite(ctx, cxModels)
					if err != nil {
						isDuplicate := mongo.IsDuplicateKeyError(err)
						if isDuplicate {
							bke, ok := err.(mongo.BulkWriteException)
							if !ok {
								// 返回错误信息
								importErrors = append(importErrors, &item.MappingError{
									ErrorMsg: err.Error(),
								})

								utils.ErrorLog("MappingImport", err.Error())
								return importErrors, err
							}
							errInfo := bke.WriteErrors[0]
							em := errInfo.Message
							values := utils.FieldMatch(`"([^\"]+)"`, em[strings.LastIndex(em, "dup key"):])
							for i, v := range values {
								values[i] = strings.Trim(v, `"`)
							}
							fields := utils.FieldMatch(`field_[0-9a-z]{3}`, em[strings.LastIndex(em, "dup key"):])
							// 返回错误信息
							importErrors = append(importErrors, &item.MappingError{
								ErrorMsg: fmt.Sprintf("プライマリキーの重複エラー、API-KEY[%s],重複値は[%s]です。", strings.Join(fields, ","), strings.Join(values, ",")),
							})

							utils.ErrorLog("MappingImport", errInfo.Message)
							return importErrors, errInfo
						}

						utils.ErrorLog("MappingImport", err.Error())
						return importErrors, err
					}
				}

				err1 := hs.Commit()
				if err1 != nil {
					// 返回错误信息
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, err1
				}
			}

		}

		if mappingType == "upsert" {

			queryItem := bson.M{
				"owners": bson.M{
					"$in": updateOwners,
				},
			}
			for key, value := range query {
				queryItem["items."+key+".value"] = GetValueFromProto(value)
			}
			itemList := findItems(db, datastoreId, queryItem)

			if len(itemList) == 0 {
				mType = "insert"
				// 新规更新的新规时
				itemMapData := keyValueChange
				// 合并query和change
				for key, value := range query {
					itemMapData[key] = &Value{
						DataType: value.DataType,
						Value:    value.Value,
					}
				}

				dataItem := Item{
					AppID:       appId,
					DatastoreID: datastoreId,
					ItemMap:     itemMapData,
					Owners:      owners,
					CreatedAt:   time.Now(),
					CreatedBy:   userID,
					UpdatedAt:   time.Now(),
					UpdatedBy:   userID,
				}
				dataItem.ID = primitive.NewObjectID()
				dataItem.ItemID = dataItem.ID.Hex()
				dataItem.Status = "1"
				dataItem.CheckStatus = "0"

				err1 := hs.Add(cast.ToString(index), dataItem.ID.Hex(), nil)
				if err1 != nil {
					utils.ErrorLog("MappingImport", err1.Error())
					// 返回错误信息
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, err1
				}

				/* _, err := c.InsertOne(ctx, *h1)
				   if err != nil {
				   	utils.ErrorLog("error ModifyUser", err.Error())
				   	return nil, err
				   } */

				// 若无必须字段则直接插入
				if len(requriedFields) == 0 {

					for _, f := range allFields {
						if f.FieldType == "autonum" {
							num, err := autoNum(sc, db, f)
							if err != nil {
								if err.Error() != "(WriteConflict) WriteConflict" {
									utils.ErrorLog("MappingImport", err.Error())
									// 返回错误信息
									importErrors = append(importErrors, &item.MappingError{
										ErrorMsg: err.Error(),
									})
								}

								return importErrors, err
							} else {
								dataItem.ItemMap[f.FieldID] = &Value{
									DataType: "autonum",
									Value:    num,
								}
							}

							continue
						}

						//  添加空数据
						addEmptyData(dataItem.ItemMap, f)
					}

					// 必须字段检查NG,返回错误
					if len(importErrors) > 0 {
						return importErrors, errors.New("field has error")
					}

					queryJSON, _ := json.Marshal(dataItem)
					utils.DebugLog("MappingImport", fmt.Sprintf("item: [ %s ]", queryJSON))

					insertCxModel := mongo.NewInsertOneModel()
					insertCxModel.SetDocument(dataItem)
					cxModels = append(cxModels, insertCxModel)

					err = hs.Compare(cast.ToString(index), dataItem.ItemMap)
					if err != nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: err.Error(),
						})
						return importErrors, err
					}
				}

				// 有必须字段的情况下，先判断是否必须字段是否有值
				for _, f := range allFields {
					if f.IsRequired {
						if value, ok := dataItem.ItemMap[f.FieldID]; ok {
							if isEmptyValue(value) {
								importErrors = append(importErrors, &item.MappingError{
									ErrorMsg: "このフィールドは必須フィールドです",
								})
							}
						} else {
							importErrors = append(importErrors, &item.MappingError{
								ErrorMsg: "このフィールドは必須フィールドです",
							})
						}

						continue
					}

					if f.FieldType == "autonum" {
						num, err := autoNum(sc, db, f)
						if err != nil {
							if err.Error() != "(WriteConflict) WriteConflict" {
								utils.ErrorLog("MappingImport", err.Error())
								// 返回错误信息
								importErrors = append(importErrors, &item.MappingError{
									ErrorMsg: err.Error(),
								})
							}

							return importErrors, err
						} else {
							dataItem.ItemMap[f.FieldID] = &Value{
								DataType: "autonum",
								Value:    num,
							}
						}

						continue
					}
					//  添加空数据
					addEmptyData(dataItem.ItemMap, f)
				}

				// 必须字段检查NG,返回错误
				if len(importErrors) > 0 {
					return importErrors, errors.New("field has error")
				}

				queryJSON, _ := json.Marshal(dataItem)
				utils.DebugLog("MappingImport", fmt.Sprintf("item: [ %s ]", queryJSON))

				insertCxModel := mongo.NewInsertOneModel()
				insertCxModel.SetDocument(dataItem)
				cxModels = append(cxModels, insertCxModel)

				err1 = hs.Compare(cast.ToString(index), dataItem.ItemMap)
				if err1 != nil {
					// 返回错误信息
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, err1
				}
			} else {
				mType = "update"
				imperr, cxm, _ := MappingUpdateType(updateType, itemList, importErrors, index, hs, allFields, keyValueChange, emptyChange, userID)
				if len(imperr) > 0 {
					for _, value := range imperr {
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: value.ErrorMsg,
						})
					}
				}
				cxModels = cxm
			}

			if len(cxModels) > 0 {
				_, err := c.BulkWrite(ctx, cxModels)
				if err != nil {
					isDuplicate := mongo.IsDuplicateKeyError(err)
					if isDuplicate {
						bke, ok := err.(mongo.BulkWriteException)
						if !ok {
							// 返回错误信息
							importErrors = append(importErrors, &item.MappingError{
								ErrorMsg: err.Error(),
							})

							utils.ErrorLog("MappingImport", err.Error())
							return importErrors, err
						}
						errInfo := bke.WriteErrors[0]
						em := errInfo.Message
						values := utils.FieldMatch(`"([^\"]+)"`, em[strings.LastIndex(em, "dup key"):])
						for i, v := range values {
							values[i] = strings.Trim(v, `"`)
						}
						fields := utils.FieldMatch(`field_[0-9a-z]{3}`, em[strings.LastIndex(em, "dup key"):])
						// 返回错误信息
						importErrors = append(importErrors, &item.MappingError{
							ErrorMsg: fmt.Sprintf("プライマリキーの重複エラー、API-KEY[%s],重複値は[%s]です。", strings.Join(fields, ","), strings.Join(values, ",")),
						})

						utils.ErrorLog("MappingImport", errInfo.Message)
						return importErrors, errInfo
					}

					utils.ErrorLog("MappingImport", err.Error())
					return importErrors, err
				}
			}

			err1 := hs.Commit()
			if err1 != nil {
				// 返回错误信息
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, err1
			}
		}

		return importErrors, nil
	}

	opts := &options.SessionOptions{}
	// 提交时间改为5分钟
	commitTime := 5 * time.Minute
	opts.SetDefaultMaxCommitTime(&commitTime)
	opts.SetDefaultReadConcern(readconcern.Snapshot())

	session, err := client.StartSession(opts)
	if err != nil {
		utils.ErrorLog("MappingImport", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.MappingError{
			ErrorMsg: err.Error(),
		})
	}

	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, callback)
	if err != nil {

		return importErrors, mType, nil
	}

	return importErrors, mType, nil
}

func MappingUpdateType(updateType string, itemList []*Item, importErrors []*item.MappingError, index int64, hs *HistoryServer, allFields []Field, keyValueChange map[string]*Value, emptyChange bool, userID string) (m []*item.MappingError, cm []mongo.WriteModel, err error) {
	var cxModels []mongo.WriteModel
	if updateType == "error" {
		if len(itemList) > 1 {
			importErrors = append(importErrors, &item.MappingError{
				ErrorMsg: fmt.Sprintf("行 %d はエラーです,複数のデータが見つかったため、更新処理は行われませんでした。", index),
			})
			utils.ErrorLog("MappingImport", fmt.Sprintf("行 %d はエラーです,複数のデータが見つかったため、更新処理は行われませんでした。", index))
			return importErrors, nil, nil
		}

		err1 := hs.Add(cast.ToString(index), itemList[0].ItemID, itemList[0].ItemMap)
		if err1 != nil {
			importErrors = append(importErrors, &item.MappingError{
				ErrorMsg: err1.Error(),
			})
			return importErrors, nil, err1
		}

		// 自增字段不更新
		for _, f := range allFields {
			if f.FieldType == "autonum" {
				if itemList[0] != nil {
					delete(itemList[0].ItemMap, f.FieldID)
				}
				delete(keyValueChange, f.FieldID)
			}
			_, ok := keyValueChange[f.FieldID]
			// 需要进行自算的情况
			if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {

				if f.SelfCalculate == "add" {
					o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
					n := GetNumberValue(keyValueChange[f.FieldID])
					keyValueChange[f.FieldID].Value = o + n
					continue
				}
				if f.SelfCalculate == "sub" {
					o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
					n := GetNumberValue(keyValueChange[f.FieldID])
					keyValueChange[f.FieldID].Value = o - n
					continue
				}
			}
		}

		if emptyChange {

			/* query := bson.M{
				"item_id": itemList[0].ItemID,
			} */

			change := bson.M{}

			for m, n := range keyValueChange {
				change["items."+m+".value"] = n.Value
			}

			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			/* queryJSON, _ := json.Marshal(query)
			utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

			updateSON, _ := json.Marshal(update)
			utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

			_, err := c.UpdateOne(ctx, query, update)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return nil, err
			} */

			objectID, _ := primitive.ObjectIDFromHex(itemList[0].ItemID)
			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(bson.M{"_id": objectID})
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err1 = hs.Compare(cast.ToString(index), keyValueChange)
			if err1 != nil {
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, nil, err1
			}

		} else {
			/* query := bson.M{
				"item_id": itemList[0].ItemID,
			} */

			change := bson.M{}

			for key, typeAndValue := range keyValueChange {
				if typeAndValue.Value != "" {
					change["items."+key+".value"] = typeAndValue.Value
				}
			}

			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			/* queryJSON, _ := json.Marshal(query)
			utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

			updateSON, _ := json.Marshal(update)
			utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

			_, err := c.UpdateOne(ctx, query, update)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return nil, err
			} */

			objectID, _ := primitive.ObjectIDFromHex(itemList[0].ItemID)
			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(bson.M{"_id": objectID})
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err1 = hs.Compare(cast.ToString(index), keyValueChange)
			if err1 != nil {
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, nil, err1
			}
		}
	}

	if updateType == "update-one" {

		err1 := hs.Add(cast.ToString(index), itemList[0].ItemID, itemList[0].ItemMap)
		if err1 != nil {
			importErrors = append(importErrors, &item.MappingError{
				ErrorMsg: err1.Error(),
			})
			return importErrors, nil, err1
		}

		// 自增字段不更新
		for _, f := range allFields {
			if f.FieldType == "autonum" {
				if itemList[0] != nil {
					delete(itemList[0].ItemMap, f.FieldID)
				}
				delete(keyValueChange, f.FieldID)
			}
			_, ok := keyValueChange[f.FieldID]
			// 需要进行自算的情况
			if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
				if f.SelfCalculate == "add" {
					o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
					n := GetNumberValue(keyValueChange[f.FieldID])
					keyValueChange[f.FieldID].Value = o + n
					continue
				}
				if f.SelfCalculate == "sub" {
					o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
					n := GetNumberValue(keyValueChange[f.FieldID])
					keyValueChange[f.FieldID].Value = o - n
					continue
				}
			}
		}

		if emptyChange {

			/* query := bson.M{
				"item_id": itemList[0].ItemID,
			} */

			change := bson.M{}

			for m, n := range keyValueChange {
				change["items."+m+".value"] = n.Value
			}
			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			/* queryJSON, _ := json.Marshal(query)
			utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

			updateSON, _ := json.Marshal(update)
			utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

			_, err := c.UpdateOne(ctx, query, update)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return nil, err
			} */

			objectID, _ := primitive.ObjectIDFromHex(itemList[0].ItemID)
			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(bson.M{"_id": objectID})
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err1 = hs.Compare(cast.ToString(index), keyValueChange)
			if err1 != nil {
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, nil, err1
			}
		} else {
			/* query := bson.M{
				"item_id": itemList[0].ItemID,
			} */

			change := bson.M{}

			for key, typeAndValue := range keyValueChange {
				if typeAndValue.Value != "" {
					change["items."+key+".value"] = typeAndValue.Value
				}
			}

			change["updated_at"] = time.Now()
			change["updated_by"] = userID

			update := bson.M{"$set": change}

			/* queryJSON, _ := json.Marshal(query)
			utils.DebugLog("ModifyUser", fmt.Sprintf("query: [ %s ]", queryJSON))

			updateSON, _ := json.Marshal(update)
			utils.DebugLog("ModifyUser", fmt.Sprintf("update: [ %s ]", updateSON))

			_, err := c.UpdateOne(ctx, query, update)
			if err != nil {
				utils.ErrorLog("error ModifyUser", err.Error())
				return nil, err
			} */

			objectID, _ := primitive.ObjectIDFromHex(itemList[0].ItemID)
			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(bson.M{"_id": objectID})
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			err1 = hs.Compare(cast.ToString(index), keyValueChange)
			if err1 != nil {
				importErrors = append(importErrors, &item.MappingError{
					ErrorMsg: err1.Error(),
				})
				return importErrors, nil, err1
			}
		}
	}

	if updateType == "update-many" {
		if emptyChange {
			for k, oldItem := range itemList {

				index := strings.Builder{}
				index.WriteString("many_")
				index.WriteString(cast.ToString(index))
				index.WriteString("_")
				index.WriteString(cast.ToString(k + 1))

				err1 := hs.Add(index.String(), oldItem.ItemID, oldItem.ItemMap)
				if err1 != nil {
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, nil, err1
				}

				// 自增字段不更新
				for _, f := range allFields {
					if f.FieldType == "autonum" {
						if itemList[0] != nil {
							delete(itemList[0].ItemMap, f.FieldID)
						}
						delete(keyValueChange, f.FieldID)
					}

					_, ok := keyValueChange[f.FieldID]
					// 需要进行自算的情况
					if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
						if f.SelfCalculate == "add" {
							o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
							n := GetNumberValue(keyValueChange[f.FieldID])
							keyValueChange[f.FieldID].Value = o + n
							continue
						}
						if f.SelfCalculate == "sub" {
							o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
							n := GetNumberValue(keyValueChange[f.FieldID])
							keyValueChange[f.FieldID].Value = o - n
							continue
						}
					}
				}

				change1 := bson.M{
					"updated_at": time.Now(),
					"updated_by": userID,
				}

				for key, value := range keyValueChange {
					change1["items."+key] = value
				}

				update := bson.M{"$set": change1}

				objectID, _ := primitive.ObjectIDFromHex(oldItem.ItemID)
				upCxModel := mongo.NewUpdateOneModel()
				upCxModel.SetFilter(bson.M{"_id": objectID})
				upCxModel.SetUpdate(update)
				upCxModel.SetUpsert(false)
				cxModels = append(cxModels, upCxModel)

				err1 = hs.Compare(index.String(), keyValueChange)
				if err1 != nil {
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, nil, err1
				}
			}
		} else {
			for k, oldItem := range itemList {

				index := strings.Builder{}
				index.WriteString("many_")
				index.WriteString(cast.ToString(index))
				index.WriteString("_")
				index.WriteString(cast.ToString(k + 1))

				err1 := hs.Add(index.String(), oldItem.ItemID, oldItem.ItemMap)
				if err1 != nil {
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, nil, err1
				}

				// 自增字段不更新
				for _, f := range allFields {
					if f.FieldType == "autonum" {
						if itemList[0] != nil {
							delete(itemList[0].ItemMap, f.FieldID)
						}
						delete(keyValueChange, f.FieldID)
					}

					_, ok := keyValueChange[f.FieldID]
					// 需要进行自算的情况
					if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
						if f.SelfCalculate == "add" {
							o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
							n := GetNumberValue(keyValueChange[f.FieldID])
							keyValueChange[f.FieldID].Value = o + n
							continue
						}
						if f.SelfCalculate == "sub" {
							o := GetNumberValue(itemList[0].ItemMap[f.FieldID])
							n := GetNumberValue(keyValueChange[f.FieldID])
							keyValueChange[f.FieldID].Value = o - n
							continue
						}
					}
				}

				change1 := bson.M{
					"updated_at": time.Now(),
					"updated_by": userID,
				}

				for key, value := range keyValueChange {
					if value.Value != "" {
						change1["items."+key] = value
					}
				}

				update := bson.M{"$set": change1}

				objectID, _ := primitive.ObjectIDFromHex(oldItem.ItemID)
				upCxModel := mongo.NewUpdateOneModel()
				upCxModel.SetFilter(bson.M{"_id": objectID})
				upCxModel.SetUpdate(update)
				upCxModel.SetUpsert(false)
				cxModels = append(cxModels, upCxModel)

				err1 = hs.Compare(index.String(), keyValueChange)
				if err1 != nil {
					importErrors = append(importErrors, &item.MappingError{
						ErrorMsg: err1.Error(),
					})
					return importErrors, nil, err1
				}
			}
		}
	}
	return importErrors, cxModels, nil
}

// ImportCheckItem 导入盘点
func ImportCheckItem(ctx context.Context, stream item.ItemService_ImportCheckItemStream) error {

	var meta *item.ImportMetaData
	var dataList []*ChangeData
	var oldItems []*Item
	var current int64 = 0

	defer stream.Close()

	for {
		req, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		status := req.GetStatus()
		if status == item.SendStatus_COMPLETE {
			if len(dataList) > 0 {
				// 如果没有设置metadata，将直接返回
				if meta == nil {
					return errors.New("not set meta data")
				}

				// 执行数据处理操作
				err = checkDataExec(ctx, meta, dataList, oldItems, stream)
				if err != nil {
					return err
				}
			}

			break
		}

		// 判断传入的类型
		m := req.GetMeta()
		// 如果m不等于空，则说明传入的是m
		if m != nil {
			// 设置meta的值
			meta = m

			// 直接进入下一次循环
			continue
		}

		data := req.GetData()
		// 如果data不等于空，则说明传入的是data
		if data != nil {
			current++

			// 判断更新对象数据是否存在
			query := bson.M{
				"owners": bson.M{
					"$in": meta.UpdateOwners,
				},
			}
			for key, value := range data.Query {
				query["items."+key+".value"] = GetValueFromProto(value)
			}

			// 查找对象
			oldData := findItems(meta.Database, meta.DatastoreId, query)
			if len(oldData) != 1 {
				return fmt.Errorf("find mutil data with query %v in datastore %s", query, meta.DatastoreId)
			}

			// 添加到旧数据中
			oldItems = append(oldItems, oldData...)

			// 读取一条数据
			changes := make(map[string]*Value, len(data.GetChange()))
			for key, item := range data.GetChange() {
				if key == "checked_at" {
					date, err := time.Parse("2006-01-02 15:04:05", item.Value)
					if err != nil {
						date = time.Time{}
					}
					changes[key] = &Value{
						DataType: item.DataType,
						Value:    date,
					}
				} else {
					changes[key] = &Value{
						DataType: item.DataType,
						Value:    item.Value,
					}
				}
			}

			dataList = append(dataList, &ChangeData{
				Change: changes,
				Query:  data.GetQuery(),
				Index:  data.GetIndex(),
				ItemId: oldData[0].ItemID,
			})
		}

		if current%500 == 0 {
			// 如果没有设置metadata，将直接返回
			if meta == nil {
				return errors.New("not set meta data")
			}

			// 执行数据处理操作
			err = checkDataExec(ctx, meta, dataList, oldItems, stream)
			if err != nil {
				return err
			}

			dataList = dataList[:0]
			oldItems = oldItems[:0]
		}
	}

	return nil
}

func getFieldMap(db, appID string) (map[string][]Field, error) {
	param := &FindAppFieldsParam{
		AppID:         appID,
		InvalidatedIn: "true",
	}
	fields, err := FindAppFields(db, param)
	if err != nil {
		utils.ErrorLog("getFieldMap", err.Error())
		return nil, err
	}
	var ds string
	var fs []Field
	result := make(map[string][]Field)
	for index, f := range fields {
		if index == 0 {
			ds = f.DatastoreID
			fs = append(fs, f)

			if len(fields) == 1 {
				result[ds] = fs
			}
			continue
		}

		if len(fields)-1 == index {
			if ds == f.DatastoreID {
				fs = append(fs, f)
				result[ds] = fs
			} else {
				result[ds] = fs
				fs = nil
				ds = f.DatastoreID
				fs = append(fs, f)
				result[ds] = fs
			}
			continue
		}

		if ds == f.DatastoreID {
			fs = append(fs, f)
			continue
		}

		result[ds] = fs
		fs = nil
		ds = f.DatastoreID
		fs = append(fs, f)
	}

	return result, nil
}

func ImportItem(ctx context.Context, stream item.ItemService_ImportItemStream) error {

	fieldMap := make(map[string][]Field)
	dsMap := make(map[string]string)

	var meta *item.ImportMetaData
	var dataList []*Item
	var attachItems []*Item
	var oldItemList []primitive.ObjectID
	var current int64 = 0

	defer stream.Close()

	for {
		req, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		status := req.GetStatus()
		if status == item.SendStatus_COMPLETE {
			if len(dataList) > 0 {
				// 如果没有设置metadata，将直接返回
				if meta == nil {
					return errors.New("not set meta data")
				}

				// 获取变更前的条件
				query := bson.M{
					"_id": bson.M{
						"$in": oldItemList,
					},
					"owners": bson.M{
						"$in": meta.GetUpdateOwners(),
					},
				}

				// 获取变更前的记录
				oldItems := findItems(meta.GetDatabase(), meta.GetDatastoreId(), query)

				// 执行数据处理操作
				err := dataExec(ctx, meta, fieldMap, dsMap, dataList, attachItems, oldItems, stream)
				if err != nil {
					return err
				}
			}

			break
		}

		// 判断传入的类型
		m := req.GetMeta()
		// 如果m不等于空，则说明传入的是m
		if m != nil {
			// 设置meta的值
			meta = m

			// 根据所有台账，获取所有字段数据
			fm, err := getFieldMap(meta.GetDatabase(), meta.GetAppId())
			if err != nil {
				return err
			}

			fieldMap = fm

			// 获取所有台账
			dsList, e := FindDatastores(meta.GetDatabase(), meta.GetAppId(), "", "", "")
			if e != nil {
				utils.ErrorLog("ImportItem", e.Error())
				return err
			}

			for _, d := range dsList {
				dsMap[d.ApiKey] = d.DatastoreID
			}

			// 直接进入下一次循环
			continue
		}

		data := req.GetData()
		// 如果data不等于空，则说明传入的是data
		if data != nil {
			current++

			// 读取一条数据
			items := make(map[string]*Value, len(data.GetItems().Items))
			itemId := ""
			for key, item := range data.GetItems().GetItems() {
				if key != "id" {
					items[key] = &Value{
						DataType: item.DataType,
						Value:    GetValueFromProto(item),
					}
				} else {
					itemId = GetValueFromProto(item).(string)
				}
			}

			if len(itemId) > 0 {
				objectID, _ := primitive.ObjectIDFromHex(itemId)
				oldItemList = append(oldItemList, objectID)
			}

			dataList = append(dataList, &Item{
				ItemID:      itemId,
				AppID:       meta.GetAppId(),
				DatastoreID: meta.GetDatastoreId(),
				ItemMap:     items,
				CreatedAt:   time.Now(),
				CreatedBy:   meta.GetWriter(),
				UpdatedAt:   time.Now(),
				UpdatedBy:   meta.GetWriter(),
			})

			// 读取一条数据的附加数据
			for _, it := range data.GetAttachItems() {

				items := make(map[string]*Value, len(it.Items))
				for key, item := range it.GetItems() {
					items[key] = &Value{
						DataType: item.DataType,
						Value:    GetValueFromProto(item),
					}
				}

				attachItems = append(attachItems, &Item{
					AppID:       meta.GetAppId(),
					DatastoreID: it.GetDatastoreId(),
					ItemMap:     items,
					CreatedAt:   time.Now(),
					CreatedBy:   meta.GetWriter(),
					UpdatedAt:   time.Now(),
					UpdatedBy:   meta.GetWriter(),
				})
			}

		}

		if current%500 == 0 {
			// 如果没有设置metadata，将直接返回
			if meta == nil {
				return errors.New("not set meta data")
			}

			// 获取变更前的条件
			query := bson.M{
				"_id": bson.M{
					"$in": oldItemList,
				},
				"owners": bson.M{
					"$in": meta.GetUpdateOwners(),
				},
			}

			// 获取变更前的记录
			oldItems := findItems(meta.GetDatabase(), meta.GetDatastoreId(), query)

			// 执行数据处理操作
			err := dataExec(ctx, meta, fieldMap, dsMap, dataList, attachItems, oldItems, stream)
			if err != nil {
				return err
			}

			dataList = dataList[:0]
			attachItems = attachItems[:0]
			oldItemList = oldItemList[:0]
		}
	}

	return nil
}

func checkDataExec(ctx context.Context, meta *item.ImportMetaData, dataList []*ChangeData, oldItems []*Item, stream item.ItemService_ImportCheckItemStream) error {

	client := database.New()
	c := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(meta.GetDatastoreId()))

	var importErrors []*item.Error
	var cxModels []mongo.WriteModel

	// 当前行号
	firstLine := dataList[0].Index
	// 获取当前最后行号
	lastLine := dataList[len(dataList)-1].Index

	callback := func(sc mongo.SessionContext) (interface{}, error) {

		var result *mongo.BulkWriteResult

		for _, it := range dataList {
			// 获取当前行号
			line := it.Index

			// 查询变更前的数据
			oldItem := getOldItem(oldItems, it.ItemId)

			if oldItem == nil {
				// 返回错误信息
				importErrors = append(importErrors, &item.Error{
					FirstLine:   firstLine,
					LastLine:    lastLine,
					CurrentLine: line,
					ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
				})

				continue
			}

			// 更新条件
			objectID, _ := primitive.ObjectIDFromHex(it.ItemId)
			query := bson.M{
				"_id": objectID,
			}

			change := bson.M{
				"updated_at": time.Now(),
				"updated_by": meta.GetWriter(),
			}

			for key, value := range it.Change {
				change[key] = value.Value
			}
			update := bson.M{"$set": change}

			upCxModel := mongo.NewUpdateOneModel()
			upCxModel.SetFilter(query)
			upCxModel.SetUpdate(update)
			upCxModel.SetUpsert(false)
			cxModels = append(cxModels, upCxModel)

			continue
		}

		if len(cxModels) > 0 {
			res, err := c.BulkWrite(sc, cxModels)
			if err != nil {
				isDuplicate := mongo.IsDuplicateKeyError(err)
				if isDuplicate {
					bke, ok := err.(mongo.BulkWriteException)
					if !ok {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine: firstLine,
							LastLine:  lastLine,
							ErrorMsg:  err.Error(),
						})

						utils.ErrorLog("ImportItem", err.Error())
						return nil, err
					}
					errInfo := bke.WriteErrors[0]
					em := errInfo.Message
					values := utils.FieldMatch(`"([^\"]+)"`, em[strings.LastIndex(em, "dup key"):])
					for i, v := range values {
						values[i] = strings.Trim(v, `"`)
					}
					fields := utils.FieldMatch(`field_[0-9a-z]{3}`, em[strings.LastIndex(em, "dup key"):])
					// 返回错误信息
					importErrors = append(importErrors, &item.Error{
						FirstLine: firstLine,
						LastLine:  lastLine,
						ErrorMsg:  fmt.Sprintf("プライマリキーの重複エラー、API-KEY[%s],重複値は[%s]です。", strings.Join(fields, ","), strings.Join(values, ",")),
					})

					utils.ErrorLog("ImportItem", errInfo.Message)
					return nil, errInfo
				}

				utils.ErrorLog("ImportItem", err.Error())
				return nil, err
			}

			result = res
		}

		err := stream.Send(&item.ImportCheckResponse{
			Status: item.Status_SUCCESS,
			Result: &item.ImportResult{
				Insert: result.InsertedCount,
				Modify: result.ModifiedCount,
			},
		})

		if err != nil {
			return nil, err
		}

		return nil, nil
	}

	opts := &options.SessionOptions{}
	// 提交时间改为5分钟
	commitTime := 5 * time.Minute
	opts.SetDefaultMaxCommitTime(&commitTime)
	opts.SetDefaultReadConcern(readconcern.Snapshot())

	session, err := client.StartSession(opts)
	if err != nil {
		utils.ErrorLog("ImportItem", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.Error{
			FirstLine: firstLine,
			LastLine:  lastLine,
			ErrorMsg:  err.Error(),
		})

		err := stream.Send(&item.ImportCheckResponse{
			Status: item.Status_FAILED,
			Result: &item.ImportResult{
				Errors: importErrors,
			},
		})

		if err != nil {
			return err
		}
	}

	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, callback)
	if err != nil {
		utils.ErrorLog("ImportItem", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.Error{
			FirstLine: firstLine,
			LastLine:  lastLine,
			ErrorMsg:  err.Error(),
		})

		err := stream.Send(&item.ImportCheckResponse{
			Status: item.Status_FAILED,
			Result: &item.ImportResult{
				Errors: importErrors,
			},
		})

		if err != nil {
			return err
		}

		return nil
	}

	return nil
}

func dataExec(ctx context.Context, meta *item.ImportMetaData, fieldMap map[string][]Field, dsMap map[string]string, dataList []*Item, attachItems []*Item, oldItems []*Item, stream item.ItemService_ImportItemStream) error {

	client := database.New()
	c := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(meta.GetDatastoreId()))

	var importErrors []*item.Error
	var cxModels []mongo.WriteModel

	// 当前行号
	firstLine := int64(dataList[0].ItemMap["index"].Value.(float64))
	// 获取当前最后行号
	lastLine := int64(dataList[len(dataList)-1].ItemMap["index"].Value.(float64))

	// 获取插入的条数
	insert := len(dataList) - len(oldItems)
	autoList := make(map[string][]string)

	callback := func(sc mongo.SessionContext) (interface{}, error) {

		hs := NewHistory(meta.Database, meta.Writer, meta.DatastoreId, meta.LangCd, meta.Domain, sc, fieldMap[meta.DatastoreId])

		var result *mongo.BulkWriteResult

		for _, f := range fieldMap[meta.DatastoreId] {
			if f.FieldType == "autonum" {
				list, err := autoNumListWithSession(sc, meta.GetDatabase(), &f, insert)
				if err != nil {
					if err.Error() != "(WriteConflict) WriteConflict" {
						utils.ErrorLog("ImportItem", err.Error())
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine: firstLine,
							LastLine:  lastLine,
							ErrorMsg:  err.Error(),
						})
					}

					return nil, err

				}

				autoList[f.FieldID] = list
			}
		}

		for index, it := range dataList {
			// 获取当前行号
			line := int64(it.ItemMap["index"].Value.(float64))
			delete(it.ItemMap, "index")

			// 判断itemid是否传入
			if it.ItemID == "" {
				// 没有找到必须字段的情况下，直接插入数据
				it.ID = primitive.NewObjectID()
				it.ItemID = it.ID.Hex()
				it.Status = "1"
				it.CheckStatus = "0"
				it.Owners = meta.GetOwners()
				if owner, ok := it.ItemMap["owner"]; ok {
					it.Owners = []string{owner.Value.(string)}
					delete(it.ItemMap, "owner")
				}

				// 删除临时数据
				delete(it.ItemMap, "action")

				for _, f := range fieldMap[meta.GetDatastoreId()] {
					if f.FieldType == "autonum" {
						nums := autoList[f.FieldID]
						it.ItemMap[f.FieldID] = &Value{
							DataType: "autonum",
							Value:    nums[index],
						}
						continue
					}
					//  添加空数据
					addEmptyData(it.ItemMap, f)
				}

				err := hs.Add(cast.ToString(index+1), it.ItemID, nil)
				if err != nil {
					utils.ErrorLog("MappingImport", err.Error())
					// 返回错误信息
					importErrors = append(importErrors, &item.Error{
						FirstLine:   firstLine,
						CurrentLine: line,
						LastLine:    lastLine,
						ErrorMsg:    err.Error(),
					})
					return nil, err
				}

				insertCxModel := mongo.NewInsertOneModel()
				insertCxModel.SetDocument(it)
				cxModels = append(cxModels, insertCxModel)

				err = hs.Compare(cast.ToString(index+1), it.ItemMap)
				if err != nil {
					// 返回错误信息
					importErrors = append(importErrors, &item.Error{
						FirstLine:   firstLine,
						CurrentLine: line,
						LastLine:    lastLine,
						ErrorMsg:    err.Error(),
					})
					return nil, err
				}

				continue
			} else {
				// action
				action := "update"
				if val, exist := it.ItemMap["action"]; exist {
					action = val.Value.(string)
					// 删除临时数据ID
					delete(it.ItemMap, "action")
				}
				if action == "update" {
					// 查询变更前的数据
					oldItem := getOldItem(oldItems, it.ItemID)

					if oldItem == nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							LastLine:    lastLine,
							CurrentLine: line,
							ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
						})

						continue
					}

					err := hs.Add(cast.ToString(index+1), it.ItemID, oldItem.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 更新条件
					objectID, _ := primitive.ObjectIDFromHex(it.ItemID)
					query := bson.M{
						"_id": objectID,
					}

					change := bson.M{
						"updated_at": it.UpdatedAt,
						"updated_by": it.UpdatedBy,
					}

					delete(it.ItemMap, meta.GetKey())

					if owner, ok := it.ItemMap["owner"]; ok {
						change["owners"] = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					// 自增字段不更新
					for _, f := range fieldMap[meta.GetDatastoreId()] {
						if f.FieldType == "autonum" {
							if oldItem != nil {
								delete(oldItem.ItemMap, f.FieldID)
							}
							delete(it.ItemMap, f.FieldID)
						}
						_, ok := it.ItemMap[f.FieldID]
						// 需要进行自算的情况
						if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
							if f.SelfCalculate == "add" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o + n
								continue
							}
							if f.SelfCalculate == "sub" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o - n
								continue
							}
						}
					}

					for k, v := range it.ItemMap {
						change["items."+k] = v
					}

					update := bson.M{"$set": change}
					upCxModel := mongo.NewUpdateOneModel()
					upCxModel.SetFilter(query)
					upCxModel.SetUpdate(update)
					upCxModel.SetUpsert(false)
					cxModels = append(cxModels, upCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					continue
				}
				if action == "image" {
					// 查询变更前的数据
					oldItem := getOldItem(oldItems, it.ItemID)

					if oldItem == nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							LastLine:    lastLine,
							CurrentLine: line,
							ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
						})

						continue
					}

					err := hs.Add(cast.ToString(index+1), it.ItemID, oldItem.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 更新条件
					objectID, _ := primitive.ObjectIDFromHex(it.ItemID)
					query := bson.M{
						"_id": objectID,
					}

					change := bson.M{
						"updated_at": it.UpdatedAt,
						"updated_by": it.UpdatedBy,
					}

					delete(it.ItemMap, meta.GetKey())

					if owner, ok := it.ItemMap["owner"]; ok {
						change["owners"] = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					// 自增字段不更新
					for _, f := range fieldMap[meta.GetDatastoreId()] {
						if f.FieldType == "autonum" {
							if oldItem != nil {
								delete(oldItem.ItemMap, f.FieldID)
							}
							delete(it.ItemMap, f.FieldID)
						}
					}

					for key, value := range it.ItemMap {
						if oldItem != nil {
							if ovalue, ok := oldItem.ItemMap[key]; ok {
								var new []File
								err := json.Unmarshal([]byte(value.Value.(string)), &new)
								if err != nil {
									continue
								}
								var old []File
								err = json.Unmarshal([]byte(ovalue.Value.(string)), &old)
								if err != nil {
									continue
								}

								old = append(old, new...)

								fs, err := json.Marshal(old)
								if err != nil {
									continue
								}

								it.ItemMap[key] = &Value{
									DataType: value.DataType,
									Value:    string(fs),
								}

								change["items."+key] = Value{
									DataType: value.DataType,
									Value:    string(fs),
								}
							} else {
								var new []File
								err := json.Unmarshal([]byte(value.Value.(string)), &new)
								if err != nil {
									continue
								}
								var old []File

								old = append(old, new...)

								fs, err := json.Marshal(old)
								if err != nil {
									continue
								}

								change["items."+key] = Value{
									DataType: value.DataType,
									Value:    string(fs),
								}
							}
							continue
						}

						var new []File
						err := json.Unmarshal([]byte(value.Value.(string)), &new)
						if err != nil {
							continue
						}
						var old []File

						old = append(old, new...)

						fs, err := json.Marshal(old)
						if err != nil {
							continue
						}

						change["items."+key] = Value{
							DataType: value.DataType,
							Value:    string(fs),
						}

					}

					update := bson.M{"$set": change}
					upCxModel := mongo.NewUpdateOneModel()
					upCxModel.SetFilter(query)
					upCxModel.SetUpdate(update)
					upCxModel.SetUpsert(false)
					cxModels = append(cxModels, upCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					continue
				}
				// 判断是否是契约登录
				if action == "contract-insert" {
					// 没有找到必须字段的情况下，直接插入数据
					oid, err := primitive.ObjectIDFromHex(it.ItemID)
					if err != nil {
						utils.ErrorLog("ImportItem", err.Error())
						return nil, err
					}
					it.ID = oid
					it.Status = "1"
					it.CheckStatus = "0"
					it.Owners = meta.GetOwners()
					if owner, ok := it.ItemMap["owner"]; ok {
						it.Owners = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					err = hs.Add(cast.ToString(index+1), it.ItemID, nil)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 自增字段更新
					for _, f := range fieldMap[meta.GetDatastoreId()] {
						if f.FieldType == "autonum" {
							nums := autoList[f.FieldID]
							it.ItemMap[f.FieldID] = &Value{
								DataType: "autonum",
								Value:    nums[index],
							}
						}
					}

					insertCxModel := mongo.NewInsertOneModel()
					insertCxModel.SetDocument(it)
					cxModels = append(cxModels, insertCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					continue
				}
				if action == "info-change" {
					// 变更前契约情报取得
					oldItem := getOldItem(oldItems, it.ItemID)
					if oldItem == nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							LastLine:    lastLine,
							CurrentLine: line,
							ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
						})

						continue
					}

					err := hs.Add(cast.ToString(index+1), it.ItemID, oldItem.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 自增字段不更新
					for _, f := range fieldMap[meta.GetDatastoreId()] {
						if f.FieldType == "autonum" {
							if oldItem != nil {
								delete(oldItem.ItemMap, f.FieldID)
							}
							delete(it.ItemMap, f.FieldID)
						}
						_, ok := it.ItemMap[f.FieldID]
						// 需要进行自算的情况
						if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
							if f.SelfCalculate == "add" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o + n
								continue
							}
							if f.SelfCalculate == "sub" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o - n
								continue
							}
						}
					}

					change := bson.M{
						"updated_at": it.UpdatedAt,
						"updated_by": it.UpdatedBy,
					}

					if owner, ok := it.ItemMap["owner"]; ok {
						change["owners"] = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					// 循环契约情报数据对比变更
					for key, value := range it.ItemMap {
						change["items."+key] = value
					}

					// 契约情报变更参数编辑
					update := bson.M{"$set": change}
					objectID, e := primitive.ObjectIDFromHex(it.ItemID)
					if e != nil {
						utils.ErrorLog("ImportItem", e.Error())
						return nil, e
					}
					query := bson.M{
						"_id": objectID,
					}

					// 第一步：更新契约台账情报
					upCxModel := mongo.NewUpdateOneModel()
					upCxModel.SetFilter(query)
					upCxModel.SetUpdate(update)
					upCxModel.SetUpsert(false)
					cxModels = append(cxModels, upCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					continue
				}
				if action == "debt-change" {
					// 支付，利息，偿还表取得
					dsPay := dsMap["paymentStatus"]
					dsInterest := dsMap["paymentInterest"]
					dsRepay := dsMap["repayment"]

					cpay := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsPay))
					cinter := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsInterest))
					crepay := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsRepay))

					// 变更前契约情报取得
					oldItem := getOldItem(oldItems, it.ItemID)
					if oldItem == nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							LastLine:    lastLine,
							CurrentLine: line,
							ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
						})

						continue
					}

					err := hs.Add(cast.ToString(index+1), it.ItemID, oldItem.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 自增字段不更新
					for _, f := range fieldMap[meta.GetDatastoreId()] {
						if f.FieldType == "autonum" {
							if oldItem != nil {
								delete(oldItem.ItemMap, f.FieldID)
							}
							delete(it.ItemMap, f.FieldID)
						}
						_, ok := it.ItemMap[f.FieldID]
						// 需要进行自算的情况
						if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
							if f.SelfCalculate == "add" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o + n
								continue
							}
							if f.SelfCalculate == "sub" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o - n
								continue
							}
						}
					}

					// 变更箇所数记录用
					changeCount := 0

					// 变更情报编辑
					change := bson.M{
						"updated_at": it.UpdatedAt,
						"updated_by": it.UpdatedBy,
					}

					if owner, ok := it.ItemMap["owner"]; ok {
						change["owners"] = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					// 循环契约情报数据对比变更
					for key, value := range it.ItemMap {
						// 项目[百分比]不做更新
						if key != "percentage" {
							change["items."+key] = value
						}

						// 对比前后数据值
						if _, ok := oldItem.ItemMap[key]; ok {
							// 该项数据历史存在,判断历史与当前是否变更
							if compare(value, oldItem.ItemMap[key]) {
								changeCount++
							}
						} else {
							// 该项数据历史不存在,判断当前是否为空
							if value.Value == "" || value.Value == "[]" {
								continue
							}

							changeCount++
						}
					}

					// 契约情报变更参数编辑
					update := bson.M{"$set": change}
					objectID, e := primitive.ObjectIDFromHex(it.ItemID)
					if e != nil {
						utils.ErrorLog("ImportItem", e.Error())
						return nil, e
					}
					query := bson.M{
						"_id": objectID,
					}

					// 第一步：更新契约台账情报
					upCxModel := mongo.NewUpdateOneModel()
					upCxModel.SetFilter(query)
					upCxModel.SetUpdate(update)
					upCxModel.SetUpsert(false)
					cxModels = append(cxModels, upCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 第二步：若字段有变更,添加契约历史情报和新旧履历情报
					if changeCount > 0 {
						// 追加履历特有的数据
						keiyakuno := GetValueFromModel(oldItem.ItemMap["keiyakuno"])

						/* ******************契约更新后根据契约番号删除以前的支付，利息，偿还的数据************* */
						querydel := bson.M{
							"items.keiyakuno.value": keiyakuno,
						}

						if _, err := cpay.DeleteMany(sc, querydel); err != nil {
							utils.ErrorLog("ImportItem", err.Error())
							return nil, err
						}

						if _, err := cinter.DeleteMany(sc, querydel); err != nil {
							utils.ErrorLog("ImportItem", err.Error())
							return nil, err
						}

						if _, err := crepay.DeleteMany(sc, querydel); err != nil {
							utils.ErrorLog("ImportItem", err.Error())
							return nil, err
						}

					}

					continue
				}
				if action == "midway-cancel" {
					// 支付，利息，偿还表取得
					dsPay := dsMap["paymentStatus"]
					dsInterest := dsMap["paymentInterest"]
					dsRepay := dsMap["repayment"]

					cpay := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsPay))
					cinter := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsInterest))
					crepay := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsRepay))

					// 变更前契约情报取得
					oldItem := getOldItem(oldItems, it.ItemID)
					if oldItem == nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							LastLine:    lastLine,
							CurrentLine: line,
							ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
						})

						continue
					}

					err := hs.Add(cast.ToString(index+1), it.ItemID, oldItem.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 自增字段不更新
					for _, f := range fieldMap[meta.GetDatastoreId()] {
						if f.FieldType == "autonum" {
							if oldItem != nil {
								delete(oldItem.ItemMap, f.FieldID)
							}
							delete(it.ItemMap, f.FieldID)
						}
						_, ok := it.ItemMap[f.FieldID]
						// 需要进行自算的情况
						if f.FieldType == "number" && len(f.SelfCalculate) > 0 && ok {
							if f.SelfCalculate == "add" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o + n
								continue
							}
							if f.SelfCalculate == "sub" {
								o := GetNumberValue(oldItem.ItemMap[f.FieldID])
								n := GetNumberValue(it.ItemMap[f.FieldID])
								it.ItemMap[f.FieldID].Value = o - n
								continue
							}
						}
					}

					// 变更箇所数记录用
					changeCount := 0

					// 追加契约状态
					it.ItemMap["status"] = &Value{
						DataType: "options",
						Value:    "cancel",
					}

					// 契约变更情报编辑
					change := bson.M{
						"updated_at": it.UpdatedAt,
						"updated_by": it.UpdatedBy,
					}

					if owner, ok := it.ItemMap["owner"]; ok {
						change["owners"] = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					// 循环契约情报数据对比变更
					for key, value := range it.ItemMap {
						change["items."+key] = value
						// 对比前后数据值
						if _, ok := oldItem.ItemMap[key]; ok {
							// 该项数据历史存在,判断历史与当前是否变更
							if compare(value, oldItem.ItemMap[key]) {
								changeCount++
							}
						} else {
							// 该项数据历史不存在,判断当前是否为空
							if value.Value == "" || value.Value == "[]" {
								continue
							}

							changeCount++
						}
					}

					// 契约情报变更参数编辑
					update := bson.M{"$set": change}
					objectID, e := primitive.ObjectIDFromHex(it.ItemID)
					if e != nil {
						utils.ErrorLog("ImportItem", e.Error())
						return nil, e
					}
					query := bson.M{
						"_id": objectID,
					}

					// 第一步：更新契约台账情报
					upCxModel := mongo.NewUpdateOneModel()
					upCxModel.SetFilter(query)
					upCxModel.SetUpdate(update)
					upCxModel.SetUpsert(false)
					cxModels = append(cxModels, upCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 第二步：若字段有变更,添加契约历史情报和新旧履历情报
					if changeCount > 0 {
						// 将契约番号变成lookup类型
						keiyakuno := GetValueFromModel(oldItem.ItemMap["keiyakuno"])

						/* ******************契约更新后根据契约番号删除以前的支付，利息，偿还的数据************* */
						querydel := bson.M{
							"items.keiyakuno.value": keiyakuno,
						}

						if _, err := cpay.DeleteMany(sc, querydel); err != nil {
							utils.ErrorLog("ImportItem", err.Error())
							return nil, err
						}

						if _, err := cinter.DeleteMany(sc, querydel); err != nil {
							utils.ErrorLog("ImportItem", err.Error())
							return nil, err
						}

						if _, err := crepay.DeleteMany(sc, querydel); err != nil {
							utils.ErrorLog("ImportItem", err.Error())
							return nil, err
						}
					}

					continue
				}
				if action == "contract-expire" {
					// 取出是否需要更新偿还台账数据的flag
					hasChange := it.ItemMap["hasChange"].Value
					delete(it.ItemMap, "hasChange")

					// 变更前契约情报取得
					oldItem := getOldItem(oldItems, it.ItemID)
					if oldItem == nil {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							LastLine:    lastLine,
							CurrentLine: line,
							ErrorMsg:    "データが存在しないか、データを変更する権限がありません",
						})

						continue
					}

					err := hs.Add(cast.ToString(index+1), it.ItemID, oldItem.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					// 变更箇所数记录用
					changeCount := 0

					// 契约变更情报编辑
					change := bson.M{
						"updated_at": it.UpdatedAt,
						"updated_by": it.UpdatedBy,
					}

					if owner, ok := it.ItemMap["owner"]; ok {
						change["owners"] = []string{owner.Value.(string)}
						delete(it.ItemMap, "owner")
					}

					// 循环契约情报数据对比变更
					for key, value := range it.ItemMap {
						change["items."+key] = value
						// 对比前后数据值
						if _, ok := oldItem.ItemMap[key]; ok {
							// 该项数据历史存在,判断历史与当前是否变更
							if compare(value, oldItem.ItemMap[key]) {
								changeCount++
							}
						} else {
							// 该项数据历史不存在,判断当前是否为空
							if value.Value == "" || value.Value == "[]" {
								continue
							}
							changeCount++
						}
					}

					// 契约情报变更参数编辑
					update := bson.M{"$set": change}
					objectID, e := primitive.ObjectIDFromHex(it.ItemID)
					if e != nil {
						utils.ErrorLog("ImportItem", e.Error())
						return nil, e
					}
					query := bson.M{
						"_id": objectID,
					}

					// 更新契约台账情报
					// 第一步：更新契约台账情报
					upCxModel := mongo.NewUpdateOneModel()
					upCxModel.SetFilter(query)
					upCxModel.SetUpdate(update)
					upCxModel.SetUpsert(false)
					cxModels = append(cxModels, upCxModel)

					err = hs.Compare(cast.ToString(index+1), it.ItemMap)
					if err != nil {
						importErrors = append(importErrors, &item.Error{
							FirstLine:   firstLine,
							CurrentLine: line,
							LastLine:    lastLine,
							ErrorMsg:    err.Error(),
						})
						return nil, err
					}

					if changeCount > 0 {
						if hasChange == "1" {
							keiyakuno := GetValueFromModel(oldItem.ItemMap["keiyakuno"])
							dsRepay := dsMap["repayment"]
							crepay := client.Database(database.GetDBName(meta.GetDatabase())).Collection(GetItemCollectionName(dsRepay))
							/* ******************契约更新后根据契约番号删除以前的偿还的数据************* */
							querydel := bson.M{
								"items.keiyakuno.value": keiyakuno,
							}
							if _, err := crepay.DeleteMany(sc, querydel); err != nil {
								utils.ErrorLog("ImportItem", err.Error())
								return nil, err
							}
						}
					}
					continue
				}
			}
		}

		if len(cxModels) > 0 {
			res, err := c.BulkWrite(sc, cxModels)
			if err != nil {
				isDuplicate := mongo.IsDuplicateKeyError(err)
				if isDuplicate {
					bke, ok := err.(mongo.BulkWriteException)
					if !ok {
						// 返回错误信息
						importErrors = append(importErrors, &item.Error{
							FirstLine: firstLine,
							LastLine:  lastLine,
							ErrorMsg:  err.Error(),
						})

						utils.ErrorLog("ImportItem", err.Error())
						return nil, err
					}
					errInfo := bke.WriteErrors[0]
					em := errInfo.Message
					values := utils.FieldMatch(`"([^\"]+)"`, em[strings.LastIndex(em, "dup key"):])
					for i, v := range values {
						values[i] = strings.Trim(v, `"`)
					}
					fields := utils.FieldMatch(`field_[0-9a-z]{3}`, em[strings.LastIndex(em, "dup key"):])
					// 返回错误信息
					importErrors = append(importErrors, &item.Error{
						FirstLine: firstLine,
						LastLine:  lastLine,
						ErrorMsg:  fmt.Sprintf("プライマリキーの重複エラー、API-KEY[%s],重複値は[%s]です。", strings.Join(fields, ","), strings.Join(values, ",")),
					})

					utils.ErrorLog("ImportItem", errInfo.Message)
					return nil, errInfo
				}

				utils.ErrorLog("ImportItem", err.Error())
				return nil, err
			}

			result = res
		}

		// 提交履历
		err := hs.Commit()
		if err != nil {
			utils.ErrorLog("ImportItem", err.Error())
			// 返回错误信息
			importErrors = append(importErrors, &item.Error{
				FirstLine: firstLine,
				LastLine:  lastLine,
				ErrorMsg:  err.Error(),
			})

			return nil, err
		}
		// 插入附加数据
		params := AttachParam{
			DB:      meta.GetDatabase(),
			DsMap:   dsMap,
			FileMap: fieldMap,
			Items:   attachItems,
			Owners:  meta.GetOwners(),
		}
		err = insertAttachData(client, sc, params)
		if err != nil {
			if err.Error() != "(WriteConflict) WriteConflict" {
				utils.ErrorLog("ImportItem", err.Error())
				// 返回错误信息
				importErrors = append(importErrors, &item.Error{
					FirstLine: firstLine,
					LastLine:  lastLine,
					ErrorMsg:  err.Error(),
				})
			}

			return nil, err
		}

		err = stream.Send(&item.ImportResponse{
			Status: item.Status_SUCCESS,
			Result: &item.ImportResult{
				Insert: result.InsertedCount,
				Modify: result.ModifiedCount,
			},
		})

		if err != nil {
			return nil, err
		}

		return nil, nil
	}

	opts := &options.SessionOptions{}
	// 提交时间改为5分钟
	commitTime := 5 * time.Minute
	opts.SetDefaultMaxCommitTime(&commitTime)
	opts.SetDefaultReadConcern(readconcern.Snapshot())

	session, err := client.StartSession(opts)
	if err != nil {
		utils.ErrorLog("ImportItem", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.Error{
			FirstLine: firstLine,
			LastLine:  lastLine,
			ErrorMsg:  err.Error(),
		})

		err := stream.Send(&item.ImportResponse{
			Status: item.Status_FAILED,
			Result: &item.ImportResult{
				Errors: importErrors,
			},
		})

		if err != nil {
			return err
		}
	}

	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, callback)
	if err != nil {
		utils.ErrorLog("ImportItem", err.Error())
		// 返回错误信息
		importErrors = append(importErrors, &item.Error{
			FirstLine: firstLine,
			LastLine:  lastLine,
			ErrorMsg:  err.Error(),
		})

		err := stream.Send(&item.ImportResponse{
			Status: item.Status_FAILED,
			Result: &item.ImportResult{
				Errors: importErrors,
			},
		})

		if err != nil {
			return err
		}

		return nil
	}

	return nil
}
