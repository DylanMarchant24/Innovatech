data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 1. CAPA FRONTEND
resource "aws_instance" "front_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_frontend.id
  vpc_security_group_ids = [aws_security_group.sg_front.id]
  iam_instance_profile   = "LabInstanceProfile"

  user_data = <<-EOF
              #!/bin/bash
              exec > >(tee -a /var/log/user-data.log) 2>&1
              fallocate -l 3G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
              
              apt-get update -y && apt-get install -y git nginx curl
              curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
              apt-get install -y nodejs
              
              git clone -b develop https://github.com/DylanMarchant24/Innovatech.git /home/ubuntu/Innovatech
              cd /home/ubuntu/Innovatech/frontend
              npm ci && npm run build
              
              rm -rf /var/www/html/*
              cp -r dist/* /var/www/html/
              chown -R www-data:www-data /var/www/html

              cat > /etc/nginx/sites-available/default <<'NGINX'
              server {
                  listen 80 default_server;
                  root /var/www/html;
                  index index.html;
                  location /api/ {
                      proxy_pass http://BACKEND_IP:8080;
                      proxy_set_header Host \$host;
                      proxy_set_header X-Real-IP \$remote_addr;
                  }
                  location / {
                      try_files \$uri \$uri/ /index.html;
                  }
              }
              NGINX

              sed -i "s/BACKEND_IP/${aws_instance.back_server.private_ip}/g" /etc/nginx/sites-available/default
              systemctl restart nginx
              EOF

  depends_on = [aws_instance.back_server]
  tags = { Name = "EC2-Frontend" }
}

# 2. CAPA BACKEND
resource "aws_instance" "back_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.private_backend_data.id
  vpc_security_group_ids = [aws_security_group.sg_back.id]
  iam_instance_profile   = "LabInstanceProfile"
  private_ip             = "10.0.2.50"

  user_data = <<-EOF
              #!/bin/bash
              exec > >(tee -a /var/log/user-data.log) 2>&1
              fallocate -l 3G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
              
              until curl -sSf http://www.google.com >/dev/null; do sleep 5; done
              
              apt-get update -y && apt-get install -y docker.io git maven wget
              wget -qO - https://apt.corretto.aws/corretto.key | apt-key add -
              echo "deb https://apt.corretto.aws stable main" > /etc/apt/sources.list.d/corretto.list
              apt-get update -y && apt-get install -y java-21-amazon-corretto-jdk
              systemctl start docker && systemctl enable docker
              
              git clone -b develop https://github.com/DylanMarchant24/Innovatech.git /home/ubuntu/Innovatech
              sed -i "s/data-server-ip/${aws_instance.data_server.private_ip}/g" /home/ubuntu/Innovatech/backend/src/main/resources/application.properties
              
              sleep 60
              
              cd /home/ubuntu/Innovatech/backend
              export MAVEN_OPTS="-Xmx512m"
              mvn clean package spring-boot:repackage -DskipTests
              
              cp target/*.jar app.jar
              docker build -t mi-backend .
              
              # Comando limpio sin variables de emergencia
              docker run -d --restart always -p 8080:8080 -e SPRING_MAIN_ALLOW_BEAN_DEFINITION_OVERRIDING=true mi-backend
              EOF

  depends_on = [aws_instance.data_server]
  tags = { Name = "EC2-Backend" }
}

# 3. CAPA DATA
resource "aws_instance" "data_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.private_backend_data.id
  vpc_security_group_ids = [aws_security_group.sg_data.id]
  iam_instance_profile   = "LabInstanceProfile"
  private_ip             = "10.0.2.66"

  user_data = <<-EOF
              #!/bin/bash
              exec > >(tee -a /var/log/user-data.log) 2>&1
              fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
              until curl -sSf http://www.google.com >/dev/null; do sleep 5; done
              apt-get update -y && apt-get install -y docker.io
              systemctl start docker && systemctl enable docker
              docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=innovatech -p 3306:3306 -d mysql:8.0
              EOF

  tags = { Name = "EC2-BaseDatos" }
}

output "frontend_public_ip" { value = aws_instance.front_server.public_ip }