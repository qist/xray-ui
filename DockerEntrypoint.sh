#!/bin/sh

# Start fail2ban
fail2ban-client -x start

# Run xray-ui
exec /app/xray-ui