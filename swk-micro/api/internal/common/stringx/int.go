package stringx

import (
	"strconv"

	"github.com/dustin/go-humanize"
)

// StringToInt string转int
func StringToInt(in string) (out int) {
	out, _ = strconv.Atoi(in)
	return
}

// 数値をカンマ区切りする
func CommaInt(in string) (out string) {
	out = humanize.Comma(int64(StringToInt(in)))
	return
}
