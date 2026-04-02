
# -------------------------------------------------------------
# Security Groups
# -------------------------------------------------------------
resource "aws_security_group" "sg_front" {
  name        = "SG_Front"
  description = "Permitir HTTP (80) y HTTPS (443) al Frontend. SSH administrado por SSM"
  vpc_id      = aws_vpc.main.id

  # HTTP desde Internet
  ingress {
    description = "HTTP desde Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS desde Internet
  ingress {
    description = "HTTPS desde Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Seguridad-Frontend"
  }
}

resource "aws_security_group" "sg_back" {
  name        = "SG_Back"
  description = "Permitir trafico solo desde el Frontend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Trafico desde SG_Front"
    from_port       = 8080 # Puerto de ejemplo del microservicio
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_front.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Seguridad-Backend"
  }
}

resource "aws_security_group" "sg_data" {
  name        = "SG_Data"
  description = "Permitir trafico de BD (MySQL) solo desde el Backend"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL desde SG_Back"
    from_port       = 3306 # MySQL
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.sg_back.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Seguridad-BaseDatos"
  }
}
