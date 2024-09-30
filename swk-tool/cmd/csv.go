package cmd

import (
	"errors"
	"os"
	"time"

	"github.com/spf13/cobra"
	"rxcsoft.cn/tool/server"
	"rxcsoft.cn/tool/service/auth"
	"rxcsoft.cn/tool/service/csv"
	"rxcsoft.cn/tool/utils"
)

var (
	capiServer   string
	cuserid      string
	cpassword    string
	cdatastoreId string
	caction      string
	cfile        string
	cencoding    string
	cpayFile     string
	czipFile     string
	czipCharset  string
	cemptyChange string
)

func init() {

	// 初始化配置文
	server.Start()

	rootCmd.AddCommand(csvCmd)

	csvCmd.PersistentFlags().StringVarP(&capiServer, "server", "s", os.Getenv("API_SERVER"), "Server address, default is environment variable [API_SERVER]")
	csvCmd.PersistentFlags().StringVarP(&cuserid, "user", "u", os.Getenv("USERID"), "Login account, default is environment variable [USERID]")
	csvCmd.PersistentFlags().StringVarP(&cpassword, "password", "p", os.Getenv("PASSWORD"), "Login password, the default is environment variable [PASSWORD]")
	csvCmd.PersistentFlags().StringVarP(&cdatastoreId, "datastore", "d", os.Getenv("DATASTORE"), "Datastore id, the default is an environment variable [DATASTORE]")
	csvCmd.PersistentFlags().StringVarP(&caction, "action", "a", os.Getenv("ACTION"), "Action,the default is an environment variable [ACTION]")
	csvCmd.PersistentFlags().StringVarP(&cfile, "file", "f", os.Getenv("FILE"), "Upload file, default is environment variable [FILE]")
	csvCmd.PersistentFlags().StringVarP(&cencoding, "encoding", "e", os.Getenv("ENCODING"), "Upload file encoding, default is environment variable [ENCODING]")
	csvCmd.PersistentFlags().StringVarP(&cpayFile, "payFile", "y", "", "Upload pay file,default is empty")
	csvCmd.PersistentFlags().StringVarP(&czipFile, "zipFile", "z", "", "Upload zip file,default is empty")
	csvCmd.PersistentFlags().StringVarP(&czipCharset, "zipCharset", "c", os.Getenv("CHARSET"), "Upload zip file charset, default is environment variable [CHARSET]")
	csvCmd.PersistentFlags().StringVarP(&cemptyChange, "emptyChange", "q", os.Getenv("EMPTY_CHANGE"), "Is Empty Update, default is environment variable [EMPTY_CHANGE]")
}

var csvCmd = &cobra.Command{
	Use:   "csv",
	Short: "Import data using csv file",
	RunE: func(cmd *cobra.Command, args []string) error {
		// 必须check
		if len(apiServer) == 0 {
			return errors.New("-s parameter is required")
		}
		// 用户登录
		err := auth.Login(capiServer, cuserid, cpassword)
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

		// 判断文件类型(不是必须指定)
		if len(cpayFile) > 0 {
			if utils.IsFile(cpayFile) {
				if !utils.IsCSV(cpayFile) {
					return errors.New("-p parameter is not a csv file")
				}
			} else {
				return errors.New("-p parameter is not a file")
			}
		}

		// 判断文件类型(不是必须指定)
		if len(czipFile) > 0 {
			if utils.IsFile(czipFile) {
				if !utils.IsZip(czipFile) {
					return errors.New("-z parameter is not a zip file")
				}
			} else {
				czipFile = csv.GetZipFile(czipFile)
			}

			if len(czipCharset) == 0 {
				return errors.New("upload zip file,the chartset cannot be empty")
			}
		}

		// 必须check
		if len(cdatastoreId) == 0 {
			return errors.New("-d parameter is required")
		}

		// 必须check
		if len(caction) == 0 {
			return errors.New("-a parameter is required")
		}

		// csv导入
		err = csv.CSVImport(capiServer, jobID, cdatastoreId, caction, cfile, cencoding, cpayFile, czipFile, czipCharset, cemptyChange)
		if err != nil {
			return err
		}

		return nil
	},
}
