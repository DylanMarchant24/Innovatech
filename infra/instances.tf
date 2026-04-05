data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "front_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_frontend.id
  vpc_security_group_ids = [aws_security_group.sg_front.id]
  iam_instance_profile   = "LabInstanceProfile"

  user_data = <<-EOF
              #!/bin/bash
              set -e
              # Crear Swap para evitar errores de memoria
              fallocate -l 3G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              apt-get update -y
              apt-get install -y git nginx curl

              curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
              apt-get install -y nodejs

              git clone -b develop https://github.com/DylanMarchant24/Innovatech.git /home/ubuntu/Innovatech

              cd /home/ubuntu/Innovatech/frontend
              npm ci
              npm run build

              cp -r /home/ubuntu/Innovatech/frontend/dist/* /var/www/html/

              cat > /etc/nginx/sites-available/default <<'NGINX'
              server {
                  listen 80 default_server;
                  server_name _;
                  root /var/www/html;
                  index index.html;

                  location /api/ {
                      proxy_pass http://BACKEND_IP:8080;
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                  }

                  location / {
                      try_files $uri $uri/ /index.html;
                  }
              }
              NGINX
              
              sed -i "s|BACKEND_IP|${aws_instance.back_server.private_ip}|g" /etc/nginx/sites-available/default

              systemctl restart nginx
              systemctl enable nginx
              EOF

  depends_on = [aws_instance.back_server]

  tags = {
    Name = "EC2-Frontend"
  }
}

resource "aws_instance" "back_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.private_backend_data.id
  vpc_security_group_ids = [aws_security_group.sg_back.id]
  iam_instance_profile   = "LabInstanceProfile"
  private_ip             = "10.0.2.50"

  depends_on = [aws_instance.data_server]

  user_data = <<-EOF
              #!/bin/bash
              set -e
              exec > >(tee -a /var/log/user-data.log)
              exec 2>&1
              
              echo "Creando swap..."
              fallocate -l 3G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              until curl -sSf --connect-timeout 5 http://us-east-1.ec2.archive.ubuntu.com/ubuntu/ >/dev/null; do
                sleep 5
              done

              apt-get update -o Acquire::ForceIPv4=true >> /var/log/apt-update.log 2>&1
              apt-get install -y docker.io git maven wget gnupg lsb-release >> /var/log/apt-install.log 2>&1

              wget -qO - https://apt.corretto.aws/corretto.key | apt-key add - >> /var/log/apt-install.log 2>&1
              echo "deb https://apt.corretto.aws stable main" > /etc/apt/sources.list.d/corretto.list
              apt-get update -o Acquire::ForceIPv4=true >> /var/log/apt-update.log 2>&1
              apt-get install -y java-21-amazon-corretto-jdk >> /var/log/apt-install.log 2>&1

              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              git clone -b develop https://github.com/DylanMarchant24/Innovatech.git /home/ubuntu/Innovatech
              
              # Reemplazo de la IP dinámica de la BD (esto SÍ es tarea de infraestructura)
              sed -i "s/data-server-ip/${aws_instance.data_server.private_ip}/g" /home/ubuntu/Innovatech/backend/src/main/resources/application.properties

              sleep 30
              
              cd /home/ubuntu/Innovatech/backend
              export MAVEN_OPTS="-Xmx512m"
              # Forzamos el repackage para empaquetar bien las dependencias en t2.micro
              mvn clean package spring-boot:repackage -DskipTests >> /var/log/maven-build.log 2>&1
              
              cp target/*.jar /home/ubuntu/Innovatech/backend/app.jar
              docker build -t mi-backend . >> /var/log/docker-build.log 2>&1
              docker run -d --restart always -p 8080:8080 mi-backend >> /var/log/docker-run.log 2>&1
              EOF

  tags = {
    Name = "EC2-Backend"
  }
}

resource "aws_instance" "data_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.private_backend_data.id
  vpc_security_group_ids = [aws_security_group.sg_data.id]
  iam_instance_profile   = "LabInstanceProfile"
  private_ip             = "10.0.2.66"

  user_data = <<-EOF
              #!/bin/bash
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              apt-get update -y
              apt-get install -y docker.io git
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=innovatech -p 3306:3306 -d mysql:8.0
              EOF

  tags = {
    Name = "EC2-BaseDatos"
  }
}

output "frontend_public_ip" {
  value       = aws_instance.front_server.public_ip
}