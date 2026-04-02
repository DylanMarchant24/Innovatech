resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "Innovatech-VPC"
  }
}

# Subred Publica para la capa Frontend
resource "aws_subnet" "public_frontend" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true # Importante para Frontend expuesto a internet
  availability_zone       = "us-east-1a"

  tags = {
    Name = "Subred-Publica-Front"
  }
}

# Subred Privada para Backend y Data
resource "aws_subnet" "private_backend_data" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "Subred-Privada-BackData"
  }
}

# Internet Gateway para la subred publica
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "Innovatech-GatewayInternet"
  }
}

# NAT Gateway para la subred privada
resource "aws_eip" "nat_eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_frontend.id

  tags = {
    Name = "Innovatech-GatewayNAT"
  }

  depends_on = [aws_internet_gateway.igw]
}

# Rutas para la subred publica
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "TablaRutas-Publica"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_frontend.id
  route_table_id = aws_route_table.public_rt.id
}

# Rutas para la subred privada
resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "TablaRutas-Privada"
  }
}

resource "aws_route_table_association" "private_assoc_back_data" {
  subnet_id      = aws_subnet.private_backend_data.id
  route_table_id = aws_route_table.private_rt.id
}
