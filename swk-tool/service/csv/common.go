package csv

import (
	"archive/zip"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// GetZipFile 压缩文件并获取压缩文件名称
func GetZipFile(file string) (zipName string) {
	// 判断所给路径文件/文件夹是否存在
	if !Exists(file) {
		return ""
	}
	// 空文件夹
	if IsDir(file) && IsNullPath(file) {
		return ""
	}

	zipFileName := filepath.Dir(file) + "/" + filepath.Base(file) + ".zip"
	zipFile(file, zipFileName)

	return zipFileName
}

// zipFile 压缩文件
func zipFile(dir, fileName string) {
	// 预防：旧文件无法覆盖
	os.RemoveAll(fileName)

	// 创建：zip文件
	zipfile, _ := os.Create(fileName)
	defer zipfile.Close()

	// 打开：zip文件
	archive := zip.NewWriter(zipfile)
	defer archive.Close()

	// 遍历路径信息
	filepath.Walk(dir, func(path string, info os.FileInfo, _ error) error {

		// 如果是源路径，提前进行下一个遍历
		if IsDir(dir) {
			if path == dir {
				return nil
			}
		}

		// 获取：文件头信息
		header, _ := zip.FileInfoHeader(info)
		header.Name = strings.TrimPrefix(path, dir+`\`)
		if !IsDir(dir) {
			header.Name = filepath.Base(dir)
		}

		// 判断：文件是不是文件夹
		if info.IsDir() {
			header.Name += `/`
		} else {
			// 设置：zip的文件压缩算法
			header.Method = zip.Deflate
		}

		// 创建：压缩包头部信息
		writer, _ := archive.CreateHeader(header)
		if !info.IsDir() {
			file, _ := os.Open(path)
			io.Copy(writer, file)
			file.Close()
		}
		return nil
	})
}

// 判断所给路径文件/文件夹是否存在
func Exists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		return os.IsExist(err)
	}
	return true
}

// 判断所给路径是否为文件夹
func IsDir(path string) bool {
	s, err := os.Stat(path)
	if err != nil {
		return false
	}
	return s.IsDir()
}

// 判断目录是否为空
func IsNullPath(path string) bool {
	dir, _ := ioutil.ReadDir(path)
	return len(dir) == 0
}
