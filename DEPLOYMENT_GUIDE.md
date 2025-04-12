# Deployment Guide for Fandom Intelligence Suite

This guide provides detailed instructions for deploying the Fandom Intelligence Suite to production environments.

## Deployment Options

The Fandom Intelligence Suite can be deployed in several ways depending on your requirements and infrastructure preferences:

1. **Self-hosted deployment** - Deploy on your own servers or VPS
2. **Cloud platform deployment** - Deploy on AWS, Google Cloud, or Azure
3. **Platform-as-a-Service deployment** - Deploy on Render, Heroku, or similar services

## Prerequisites

Regardless of deployment method, you'll need:

- PostgreSQL database
- Redis server (for Celery background tasks)
- Domain name (optional but recommended)
- SSL certificate (recommended for production)
- OpenAI API key (for AI insights functionality)

## Option 1: Self-Hosted Deployment

### Backend Deployment

1. **Set up a server**
   - Ubuntu 20.04 LTS or newer recommended
   - Minimum 2GB RAM, 1 CPU, 20GB storage

2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib redis-server nginx
   ```

3. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fandom-intelligence-suite.git
   cd fandom-intelligence-suite/backend
   ```

4. **Set up a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

6. **Set up the database**
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE fandom_intelligence;
   CREATE USER fandom_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE fandom_intelligence TO fandom_user;
   \q
   ```

7. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

8. **Set up Gunicorn service**
   Create a systemd service file:
   ```bash
   sudo nano /etc/systemd/system/fandom-api.service
   ```
   
   Add the following content:
   ```
   [Unit]
   Description=Fandom Intelligence API
   After=network.target

   [Service]
   User=ubuntu
   Group=ubuntu
   WorkingDirectory=/path/to/fandom-intelligence-suite/backend
   Environment="PATH=/path/to/fandom-intelligence-suite/backend/venv/bin"
   EnvironmentFile=/path/to/fandom-intelligence-suite/backend/.env
   ExecStart=/path/to/fandom-intelligence-suite/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

   [Install]
   WantedBy=multi-user.target
   ```

9. **Set up Celery service**
   ```bash
   sudo nano /etc/systemd/system/fandom-celery.service
   ```
   
   Add the following content:
   ```
   [Unit]
   Description=Fandom Intelligence Celery Worker
   After=network.target

   [Service]
   User=ubuntu
   Group=ubuntu
   WorkingDirectory=/path/to/fandom-intelligence-suite/backend
   Environment="PATH=/path/to/fandom-intelligence-suite/backend/venv/bin"
   EnvironmentFile=/path/to/fandom-intelligence-suite/backend/.env
   ExecStart=/path/to/fandom-intelligence-suite/backend/venv/bin/celery -A celery_worker.celery worker --loglevel=info

   [Install]
   WantedBy=multi-user.target
   ```

10. **Configure Nginx**
    ```bash
    sudo nano /etc/nginx/sites-available/fandom-api
    ```
    
    Add the following content:
    ```
    server {
        listen 80;
        server_name api.yourdomain.com;

        location / {
            proxy_pass http://localhost:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

11. **Enable the Nginx configuration**
    ```bash
    sudo ln -s /etc/nginx/sites-available/fandom-api /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. **Start the services**
    ```bash
    sudo systemctl start fandom-api
    sudo systemctl enable fandom-api
    sudo systemctl start fandom-celery
    sudo systemctl enable fandom-celery
    ```

13. **Set up SSL with Certbot**
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d api.yourdomain.com
    ```

### Frontend Deployment

1. **Build the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Create a production .env file**
   ```bash
   echo "REACT_APP_API_URL=https://api.yourdomain.com/api" > .env.production
   ```

3. **Build the production bundle**
   ```bash
   npm run build
   ```

4. **Configure Nginx for the frontend**
   ```bash
   sudo nano /etc/nginx/sites-available/fandom-frontend
   ```
   
   Add the following content:
   ```
   server {
       listen 80;
       server_name app.yourdomain.com;
       root /path/to/fandom-intelligence-suite/frontend/build;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

5. **Enable the Nginx configuration**
   ```bash
   sudo ln -s /etc/nginx/sites-available/fandom-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set up SSL with Certbot**
   ```bash
   sudo certbot --nginx -d app.yourdomain.com
   ```

## Option 2: AWS Deployment

### Backend Deployment on AWS

1. **Set up an EC2 instance**
   - Amazon Linux 2 or Ubuntu 20.04
   - t3.small or larger recommended
   - Security group with ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) open

2. **Set up RDS for PostgreSQL**
   - Create a PostgreSQL database instance
   - Note the endpoint, username, password, and database name

3. **Set up ElastiCache for Redis**
   - Create a Redis cluster
   - Note the endpoint

4. **Deploy the backend**
   - Follow the same steps as in the self-hosted deployment
   - Update the `.env` file with RDS and ElastiCache endpoints

### Frontend Deployment on AWS

1. **Build the frontend**
   ```bash
   cd frontend
   npm install
   echo "REACT_APP_API_URL=https://api.yourdomain.com/api" > .env.production
   npm run build
   ```

2. **Create an S3 bucket**
   - Create a new S3 bucket named `app.yourdomain.com`
   - Enable static website hosting
   - Set the index document to `index.html`
   - Set the error document to `index.html`

3. **Upload the build files**
   ```bash
   aws s3 sync build/ s3://app.yourdomain.com
   ```

4. **Set up CloudFront**
   - Create a new CloudFront distribution
   - Set the origin to your S3 bucket
   - Configure HTTPS
   - Set the default root object to `index.html`
   - Create a behavior to redirect all paths to `index.html`

5. **Configure Route 53**
   - Create a new record set for `app.yourdomain.com`
   - Point it to your CloudFront distribution

## Option 3: Render Deployment

### Backend Deployment on Render

1. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the `backend` directory
   - Set the build command: `pip install -r requirements.txt`
   - Set the start command: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`

2. **Set up environment variables**
   - Add all variables from your `.env` file
   - Update the `DATABASE_URL` to use a Render PostgreSQL instance
   - Update the `REDIS_URL` to use a Render Redis instance

3. **Create a PostgreSQL database**
   - Create a new PostgreSQL instance on Render
   - Connect it to your Web Service

4. **Create a Redis instance**
   - Create a new Redis instance on Render
   - Connect it to your Web Service

### Frontend Deployment on Render

1. **Create a new Static Site**
   - Connect your GitHub repository
   - Select the `frontend` directory
   - Set the build command: `npm install && npm run build`
   - Set the publish directory: `build`

2. **Set up environment variables**
   - Add `REACT_APP_API_URL` pointing to your backend service URL

## Maintenance and Monitoring

### Backup Strategy

1. **Database Backups**
   - Set up daily automated backups of your PostgreSQL database
   - For self-hosted: Use `pg_dump` with cron jobs
   - For AWS: Enable automated RDS backups
   - For Render: Automated backups are included

2. **Application Backups**
   - Regularly back up your `.env` files and any custom configurations
   - Use version control for all code changes

### Monitoring

1. **Set up monitoring tools**
   - For self-hosted: Consider Prometheus and Grafana
   - For AWS: Use CloudWatch
   - For Render: Use the built-in monitoring dashboard

2. **Set up alerts**
   - Configure alerts for high CPU/memory usage
   - Set up alerts for application errors
   - Monitor database performance

### Scaling

1. **Vertical Scaling**
   - Increase resources (CPU, RAM) on your existing servers
   - Suitable for moderate growth

2. **Horizontal Scaling**
   - Add more server instances behind a load balancer
   - Suitable for significant growth
   - Requires stateless application design

## Security Considerations

1. **API Security**
   - Use HTTPS for all communications
   - Implement rate limiting
   - Keep JWT secrets secure and rotate them periodically

2. **Database Security**
   - Use strong passwords
   - Restrict network access to the database
   - Regularly update and patch the database server

3. **Application Security**
   - Keep all dependencies updated
   - Regularly scan for vulnerabilities
   - Implement proper input validation

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check database credentials
   - Verify network connectivity
   - Check database server status

2. **API Errors**
   - Check application logs
   - Verify environment variables
   - Check for recent code changes

3. **Frontend Issues**
   - Check browser console for errors
   - Verify API URL configuration
   - Clear browser cache

### Logs

1. **Backend Logs**
   - For self-hosted: Check `/var/log/syslog` and application logs
   - For AWS: Check CloudWatch logs
   - For Render: Check the logs tab in the dashboard

2. **Frontend Logs**
   - Check browser console
   - Implement client-side error tracking (e.g., Sentry)

## Updating the Application

1. **Backend Updates**
   ```bash
   cd backend
   git pull
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   sudo systemctl restart fandom-api
   sudo systemctl restart fandom-celery
   ```

2. **Frontend Updates**
   ```bash
   cd frontend
   git pull
   npm install
   npm run build
   # Then redeploy the build directory
   ```

## Conclusion

This deployment guide covers the most common deployment scenarios for the Fandom Intelligence Suite. Depending on your specific requirements, you may need to adapt these instructions. Always test your deployment in a staging environment before deploying to production.

For additional support, please contact [your-email@example.com](mailto:your-email@example.com).
