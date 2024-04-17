To use HTTPS in your Express app, you need an SSL certificate. For local development, you can generate a self-signed certificate, but for production, you should use a certificate from a trusted CA (Certificate Authority).

run this command to generate a self signed SSL certificate for development purposes only and then place them in a security directory
```bash
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.cert -days 365 -nodes -subj "/CN=localhost"
```



Future considerations: 

For Production SSL Certificate: Obtain your SSL certificate from a trusted CA for your production environment.
Database Security: Ensure that your database connections are also secure and use encrypted connections if possible.
API Security Best Practices: Consider other security practices such as API throttling, more sophisticated rate limiting, and using OAuth for better authentication mechanisms. 