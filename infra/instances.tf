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
              # Crear 3GB de Swap para evitar errores de memoria (OOM) al compilar React
              fallocate -l 3G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # 1. Actualizar sistema e instalar dependencias base
              apt-get update -y
              apt-get install -y git nginx curl

              # 2. Instalar Node.js 20 LTS
              curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
              apt-get install -y nodejs

              # 3. Clonar repositorio (rama develop que tiene todo integrado)
              git clone -b develop https://github.com/DylanMarchant24/Innovatech.git /home/ubuntu/Innovatech

              # 4. Construir el Frontend
              cd /home/ubuntu/Innovatech/frontend
              echo "Instalando dependencias..." >> /var/log/user-data.log
              npm ci >> /var/log/user-data.log 2>&1
              echo "Construyendo frontend..." >> /var/log/user-data.log
              npm run build >> /var/log/user-data.log 2>&1

              # 5. Copiar archivos del build a Nginx
              echo "Copiando archivos a Nginx..." >> /var/log/user-data.log
              cp -r /home/ubuntu/Innovatech/frontend/dist/* /var/www/html/ >> /var/log/user-data.log 2>&1

              # 6. Configurar Nginx: servir el sitio React y hacer proxy de /api al Backend
              echo "Configurando Nginx..." >> /var/log/user-data.log
              cat > /etc/nginx/sites-available/default <<'NGINX'
              server {
                  listen 80 default_server;
                  server_name _;
                  root /var/www/html;
                  index index.html;

                  # Proxy de API hacia el Backend privado
                  location /api/ {
                      proxy_pass http://BACKEND_IP:8080/api/;
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                  }

                  # React Router: devolver index.html para cualquier ruta
                  location / {
                      try_files $uri $uri/ /index.html;
                  }
              }
              NGINX
              
              # Reemplazar placeholder con la IP real del backend
              sed -i "s|BACKEND_IP|${aws_instance.back_server.private_ip}|g" /etc/nginx/sites-available/default

              # 7. Iniciar y habilitar Nginx
              echo "Reiniciando Nginx..." >> /var/log/user-data.log
              systemctl restart nginx >> /var/log/user-data.log 2>&1
              systemctl enable nginx >> /var/log/user-data.log 2>&1
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
              
              echo "=== Iniciando bootstrap del Backend ===" 
              echo "Timestamp: $(date)"
              
              # Crear 3GB de Swap para evitar errores de memoria (OOM) al compilar Java
              echo "Creando swap..."
              fallocate -l 3G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              echo "Esperando red..."
              until curl -sSf --connect-timeout 5 http://us-east-1.ec2.archive.ubuntu.com/ubuntu/ >/dev/null; do
                echo "  red no disponible, reintentando en 5s..."
                sleep 5
              done

              echo "Actualizando sistema..."
              apt-get update -o Acquire::ForceIPv4=true >> /var/log/apt-update.log 2>&1
              
              echo "Instalando dependencias..."
              apt-get install -y docker.io git maven openjdk-17-jdk >> /var/log/apt-install.log 2>&1
              
              echo "Iniciando Docker..."
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              echo "Clonando repositorio..."
              git clone -b develop https://github.com/DylanMarchant24/Innovatech.git /home/ubuntu/Innovatech
              
              echo "Reemplazando IP de Base de Datos..."
              sed -i "s/data-server-ip/${aws_instance.data_server.private_ip}/g" /home/ubuntu/Innovatech/backend/src/main/resources/application.properties
              cat /home/ubuntu/Innovatech/backend/src/main/resources/application.properties

              echo "Esperando que la Base de Datos esté lista..."
              sleep 30
              
              echo "Compilando Backend..."
              cd /home/ubuntu/Innovatech/backend
              export MAVEN_OPTS="-Xmx512m"
              mvn clean package -DskipTests >> /var/log/maven-build.log 2>&1
              
              echo "Creando Docker image..."
              cp target/app.jar /home/ubuntu/Innovatech/backend/app.jar
              docker build -t mi-backend . >> /var/log/docker-build.log 2>&1
              
              echo "Ejecutando contenedor Backend..."
              docker run -d --restart always -p 8080:8080 mi-backend >> /var/log/docker-run.log 2>&1
              
              echo "=== Bootstrap completado ==="
              docker ps
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
              # Crear 2GB de Swap para MySQL
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
              # Ejecutar MySQL simple en contenedor para tener el servicio activo
              docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=innovatech -p 3306:3306 -d mysql:8.0
              EOF

  tags = {
    Name = "EC2-BaseDatos"
  }
}

output "frontend_public_ip" {
  description = "IP publica del servidor Frontend"
  value       = aws_instance.front_server.public_ip
}
