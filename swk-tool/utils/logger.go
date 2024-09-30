package utils

import (
	"fmt"
	"os"

	nested "github.com/antonfisher/nested-logrus-formatter"
	filename "github.com/keepeye/logrus-filename"
	"github.com/sirupsen/logrus"
)

func New() *logrus.Logger {
	log := logrus.New()
	// 设置控制台输出
	log.Out = os.Stdout
	// 设置等级到debug模式
	log.Level = logrus.DebugLevel
	// 设置格式为文本格式，时间戳格式为2006-01-02 15:04:05.000000
	formatter := &nested.Formatter{
		HideKeys:        true,
		NoFieldsColors:  false,
		NoColors:        false,
		FieldsOrder:     []string{"log_type", "client_ip", "app_name", "req_uri", "req_method", "status_code", "latency_time", "user_id", "domain", "process_id", "process_info", "source"},
		TimestampFormat: "2006-01-02 15:04:05",
	}

	log.SetFormatter(formatter)

	// 设置source文件名和行Hook
	filenameHook := filename.NewHook()
	filenameHook.Field = "source"
	filenameHook.Skip = 9
	filenameHook.Formatter = func(file, function string, line int) string {
		return fmt.Sprintf("%s:%d %s", file, line, function)
	}
	log.AddHook(filenameHook)

	return log
}

// ErrorLog 普通错误（任务处理等场合使用）
func ErrorLog(action, errMsg string) {
	log := New()
	// 出力日志
	log.WithFields(logrus.Fields{
		"app_name": "tool",
		"action":   action,
	}).Error(errMsg)
}

// DebugLog 调试日志
func DebugLog(action, msg string) {
	log := New()
	// 出力日志
	log.WithFields(logrus.Fields{
		"app_name": "tool",
		"action":   action,
	}).Debug(msg)
}
