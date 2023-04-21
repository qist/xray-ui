#!/bin/sh
case $TARGETPLATFORM in
    "linux/amd64")
        arch="64"
        ;;
    "linux/arm64")
        arch="arm64-v8a"
        ;;
    *)
        echo "Unknown architecture"
        exit 1
        ;;
esac
file_name="$arch"
echo $file_name