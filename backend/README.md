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


# Contract TDs: 
Permission Management:

Use Google Cloud IAM policies to control who can view or modify the contracts.
Ensure that shared contracts can only be viewed by the clients they are shared with.
Audit Logging:

Maintain logs of who shared the contract, who viewed it, and who signed it. This can help in case of disputes.
Data Integrity:

Once a contract is signed, it should be immutable. Any changes should create a new version of the contract.
Security:

Use signed URLs with expiration times for accessing the contracts. Ensure that the URLs cannot be guessed or reused.
Compliance:

Ensure that your solution complies with legal requirements for electronic signatures and document management in your jurisdiction.