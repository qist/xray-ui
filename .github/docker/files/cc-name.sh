#!/bin/bash
case $TARGETARCH in
    "amd64")
        cc=''
        ;;
    "arm64")
        cc='aarch64-linux-gnu-gcc'
        ;;
    *)
        echo "Unknown architecture"
        exit 1
        ;;
esac
cc_name="$cc"
echo $cc_name