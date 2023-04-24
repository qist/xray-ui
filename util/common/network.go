package common

import (
	"io/ioutil"
	"net/http"
)

func GetMyIpAddr() string {
	resp, err := http.Get("https://api64.ipify.org")
	if err != nil {
		resp, _ = http.Get("http://ip.cip.cc")
	}
	defer resp.Body.Close()
	s, _ := ioutil.ReadAll(resp.Body)
	return string(s)
}
