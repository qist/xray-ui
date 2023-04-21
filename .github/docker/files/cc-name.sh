#!/bin/sh
case $TARGETARCH in
    "amd64")
        cc='"CC=x86_64-linux-gnu-gcc"'
        ;;
    "arm64")
        cc='CC="aarch64-linux-gnu-gcc"'
        ;;
    *)
        echo "Unknown architecture"
        exit 1
        ;;
esac
cc_name="$cc"
echo $cc_name