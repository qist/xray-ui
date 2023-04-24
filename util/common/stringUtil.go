package common

import (
	"bytes"
	"sort"
)

func IsSubString(target string, str_array []string) bool {
	sort.Strings(str_array)
	index := sort.SearchStrings(str_array, target)
	return index < len(str_array) && str_array[index] == target
}

func ByteToString(p []byte) string {
	for i := 0; i < len(p); i++ {
		if p[i] == '\n' {
			return string(p[0:i])
		}
	}
	return string(p)
}

/*
*	if some byte slice have the '\n' we need clear these special characters
*	to get a standard string
 */
func ByteToStringWithOutNewLine(p []byte) string {
	return string(bytes.Replace(p, []byte("\n"), []byte(""), 1))
}
