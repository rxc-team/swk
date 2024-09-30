package cmd

import (
	"errors"
	"os"
	"time"

	"github.com/spf13/cobra"
	"rxcsoft.cn/tool/server"
	"rxcsoft.cn/tool/service/auth"
	"rxcsoft.cn/tool/service/mapping"
	"rxcsoft.cn/tool/utils"
)

var (
	apiServer   string
	userid      string
	password    string
	datastoreId string
	mappingId   string
	file        string
	emptyChange string
)

func init() {

	// 初始化配置文件
	server.Start()

	rootCmd.AddCommand(mappingCmd)

	mappingCmd.PersistentFlags().StringVarP(&apiServer, "server", "s", os.Getenv("API_SERVER"), "Server address, default is environment variable [API_SERVER]")
	mappingCmd.PersistentFlags().StringVarP(&userid, "user", "u", os.Getenv("USERID"), "Login account, default is environment variable [USERID]")
	mappingCmd.PersistentFlags().StringVarP(&password, "password", "p", os.Getenv("PASSWORD"), "Login password, the default is environment variable [PASSWORD]")
	mappingCmd.PersistentFlags().StringVarP(&datastoreId, "datastore", "d", os.Getenv("DATASTORE"), "Datastore id, the default is an environment variable [DATASTORE]")
	mappingCmd.PersistentFlags().StringVarP(&mappingId, "mapping", "m", os.Getenv("MAPPING"), "Mapping id,Only used when commond is mapping,  the default is an environment variable [MAPPING]")
	mappingCmd.PersistentFlags().StringVarP(&file, "file", "f", os.Getenv("FILE"), "Upload file, default is environment variable [FILE]")
	mappingCmd.PersistentFlags().StringVarP(&emptyChange, "emptyChange", "q", os.Getenv("EMPTY_CHANGE"), "Is Empty Update, default is environment variable [EMPTY_CHANGE]")
}

var mappingCmd = &cobra.Command{
	Use:   "mapping",
	Short: "Import data using mapping",
	RunE: func(cmd *cobra.Command, args []string) error {

		// 必须check
		if len(apiServer) == 0 {
			return errors.New("-s parameter is required")
		}

		// 用户登录
		err := auth.Login(apiServer, userid, password)
		if err != nil {
			return err
		}
		// 任务ID
		jobID := "tool_job_" + time.Now().Format("20060102150405")

		// 判断文件类型(必须指定)
		if len(cfile) > 0 {
			if utils.IsFile(cfile) {
				if !utils.IsCSV(cfile) {
					return errors.New("-f parameter is not a csv file")
				}
			} else {
				return errors.New("-f parameter is not a file")
			}
		} else {
			return errors.New("-f parameter is required")
		}

		// 必须check
		if len(datastoreId) == 0 {
			return errors.New("-d parameter is required")
		}

		// 必须check
		if len(mappingId) == 0 {
			return errors.New("-m parameter is required")
		}

		err = mapping.MappingImport(apiServer, jobID, datastoreId, mappingId, file, emptyChange)
		if err != nil {
			return err
		}
		return nil
	},
}
