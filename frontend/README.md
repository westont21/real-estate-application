# Run this before starting the server
```bash
HTTPS=true 
SSL_CRT_FILE=../backend/security/server.cert 
SSL_KEY_FILE=../backend/security npm start
```

# Install mkcert and setup and create a CA for localhost
```bash
brew install mkcert
mkcert -install
mkcert localhost
```

# List the path to your certs to add to .env
```bash
mkcert -CAROOT 
```

