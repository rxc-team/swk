package lease

import (
	"time"

	"github.com/spf13/cast"
)

// getGapMonths  获取二个日期间隔月数
func getGapMonths(startymd time.Time, endymd time.Time) (months int) {
	// 开始年
	startymdyear := startymd.Year()
	// 开始月
	startymdmonth := cast.ToInt(startymd.Format("01"))
	// 结束年
	endymdyear := endymd.Year()
	// 结束月
	endymdmonth := cast.ToInt(endymd.Format("01"))

	return endymdyear*12 + endymdmonth - startymdyear*12 - startymdmonth
}

// getPayDate  获取支付日
func getPayDate(date time.Time, payday int) (pdate time.Time) {
	// 年月日取得
	years := date.Year()
	month := cast.ToInt(date.Format("01"))
	nowday := date.Day()

	// 月末日取得
	lastday := 0
	if month != 2 {
		if month == 4 || month == 6 || month == 9 || month == 11 {
			lastday = 30
		} else {
			lastday = 31
		}
	} else {
		if ((years%4) == 0 && (years%100) != 0) || (years%400) == 0 {
			lastday = 29
		} else {
			lastday = 28
		}
	}

	// 获取支付日
	if payday > lastday {
		pdate = date.AddDate(0, 0, lastday-nowday)
	} else {
		pdate = date.AddDate(0, 0, payday-nowday)
	}

	return pdate
}
