#!/bin/sh
case $TARGETPLATFORM in
    "linux/amd64")
        cc='"CC=x86_64-linux-gnu-gcc"'
        ;;
    "linux/arm64")
        cc='CC="aarch64-linux-gnu-gcc"'
        ;;
    *)
        echo "Unknown architecture"
        exit 1
        ;;
esac
cc_name="$cc"
echo $cc_name