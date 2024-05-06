 To use HTTPS in your Express app, you need an SSL certificate. For local development, you can generate a self-signed certificate, but for production, you should use a certificate from a trusted CA (Certificate Authority).

# Install mkcert and setup and create a self signed CA for localhost
 - This certificate will be placed in your keychain system certifcates
```bash
brew install mkcert
mkcert -install
```

# Name the certificate security and add the certificate to your security folder
```bash
mkdir security
cd security
mkcert server
cd ..
```

- Visit https://cloud.mongodb.com for db control
- Visit https://console.cloud.google.com for oauth control 

# Google Cloud SDK 
- Follow: https://cloud.google.com/sdk/docs/install for cloud installation 
- Once dowloaded (I placed in desktop prob doesnt matter) follow insturctions 
- Try repopening a terminal and running gsutil version 
    - If that doesnt work from a terminal on computer export PATH=$PATH:~/google-cloud-sdk/bin and then source ~/.bashrc
    
# Future considerations: 
For Production SSL Certificate: Obtain your SSL certificate from a trusted CA for your production environment.
Database Security: Ensure that your database connections are also secure and use encrypted connections if possible.
API Security Best Practices: Consider other security practices such as API throttling, more sophisticated rate limiting, and using OAuth for better authentication mechanisms. 