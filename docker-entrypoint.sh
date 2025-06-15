#!/bin/sh

# Generate environment configuration
cat <<EOF > /usr/share/nginx/html/env-config.js
window.env = {
  apiUrl: "${API_URL:-http://localhost:8080}",
  production: ${PRODUCTION:-false}
};
EOF

# Execute the original command
exec "$@"
