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
              apt-get update -y
              apt-get upgrade -y
              apt-get install -y docker.io git nginx
              systemctl start docker nginx
              systemctl enable docker nginx
              usermod -aG docker ubuntu
              EOF

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

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get upgrade -y
              apt-get install -y docker.io git
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
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

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get upgrade -y
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
