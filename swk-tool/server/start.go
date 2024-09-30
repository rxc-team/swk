package server

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"rxcsoft.cn/tool/utils"
)

var (
	configEnvFileName = "config.env"
)

// Start 加载环境变量和配置文件
func Start() {
	// 加载环境变量
	InitConfigEnv()
}

// InitConfigEnv 初始化env配置
func InitConfigEnv() {
	file := fmt.Sprintf("%v/%v", getCwd(), configEnvFileName)
	if err := godotenv.Load(file); err != nil {
		utils.ErrorLog("InitConfigEnv", err.Error())
	}
}

func getCwd() string {
	pwd, err := os.Getwd()
	if err != nil {
		utils.ErrorLog("getCwd", err.Error())
		os.Exit(1)
	}

	// if path is root, return empty instead
	if pwd == "/" {
		pwd = ""
	}

	return pwd
}
