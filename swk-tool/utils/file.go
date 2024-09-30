package utils

import (
	"os"

	"github.com/qingstor/go-mime"
)

func GetFileContentType(path string) string {
	return mime.DetectFilePath(path)
}

// IsDir 判断路径是否是文件夹
func IsDir(path string) bool {
	state, err := os.Stat(path)
	if err != nil {
		return false
	}
	return state.IsDir()
}

// IsFile 判断路径是否是文件
func IsFile(path string) bool {
	return !IsDir(path)
}

// IsZip 判断文件是否是压缩文件
func IsZip(path string) bool {
	contentType := GetFileContentType(path)
	return contentType == "application/zip"
}

// IsCSV 判断文件是否是CSV文件
func IsCSV(path string) bool {
	contentType := GetFileContentType(path)
	if contentType == "text/plain" || contentType == "text/csv" {
		return true
	}

	return false
}

// GetFileSize 获取文件大小
func GetFileSize(path string) int64 {
	stat, err := os.Stat(path)
	if err != nil {
		return 0
	}

	return stat.Size()
}
