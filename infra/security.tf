# 1. Security Group para Frontend (Capa Pública)
# IE9: Única capa expuesta a Internet [cite: 109]
resource "aws_security_group" "sg_front" {
  name        = "SG_Front"
  description = "Acceso HTTP desde Internet. Admin via Session Manager"
  vpc_id      = aws_vpc.main.id

  # Entrada: HTTP para los usuarios finales
  ingress {
    description = "HTTP desde Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida: Permitir descargar paquetes y conectar con el Backend
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "Seguridad-Frontend" }
}

# 2. Security Group para Backend (Capa Privada)
# IE6: Flujo Front -> Back [cite: 148]
resource "aws_security_group" "sg_back" {
  name        = "SG_Back"
  description = "Acceso restringido solo desde el Frontend"
  vpc_id      = aws_vpc.main.id

  # Entrada: Solo permitimos el puerto 8080 si viene del SG del Frontend
  ingress {
    description     = "Trafico desde SG_Front"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_front.id]
  }

  # Salida: Permitir descargar Docker/JDK via NAT y conectar con Data
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "Seguridad-Backend" }
}

# 3. Security Group para Base de Datos (Capa Privada)
# IE6: Flujo Back -> Data [cite: 148]
resource "aws_security_group" "sg_data" {
  name        = "SG_Data"
  description = "Acceso MySQL solo desde el Backend"
  vpc_id      = aws_vpc.main.id

  # Entrada: Solo permitimos el puerto 3306 si viene del SG del Backend
  ingress {
    description     = "MySQL desde SG_Back"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_back.id]
  }

  # Salida: Permitir descargar imagen de MySQL via NAT
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "Seguridad-BaseDatos" }
}