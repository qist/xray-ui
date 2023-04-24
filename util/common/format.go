package common

import (
	"fmt"
)

func FormatTraffic(trafficBytes int64) (size string) {
	if trafficBytes < 1024 {
		return fmt.Sprintf("%.2fB", float64(trafficBytes)/float64(1))
	} else if trafficBytes < (1024 * 1024) {
		return fmt.Sprintf("%.2fKB", float64(trafficBytes)/float64(1024))
	} else if trafficBytes < (1024 * 1024 * 1024) {
		return fmt.Sprintf("%.2fMB", float64(trafficBytes)/float64(1024*1024))
	} else if trafficBytes < (1024 * 1024 * 1024 * 1024) {
		return fmt.Sprintf("%.2fGB", float64(trafficBytes)/float64(1024*1024*1024))
	} else if trafficBytes < (1024 * 1024 * 1024 * 1024 * 1024) {
		return fmt.Sprintf("%.2fTB", float64(trafficBytes)/float64(1024*1024*1024*1024))
	} else {
		return fmt.Sprintf("%.2fEB", float64(trafficBytes)/float64(1024*1024*1024*1024*1024))
	}
}

func FormatTime(timeseconds uint64) (timeStr string) {
	if timeseconds < 60 {
		return fmt.Sprintf("%d seconds", timeseconds)
	} else if timeseconds < 60*60 {
		return fmt.Sprintf("%d minutes", timeseconds/(60))
	} else if timeseconds < 60*60*24 {
		return fmt.Sprintf("%d hours", timeseconds/(60*60))
	} else {
		return fmt.Sprintf("%d days", timeseconds/(60*60*24))
	}
}
