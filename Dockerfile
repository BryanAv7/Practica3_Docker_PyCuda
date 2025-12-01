FROM nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04

# Evitar interacción de apt
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Crear carpeta de la app
WORKDIR /app

# Copiar requerimientos
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Copiar el resto del código
COPY . .

# Exponer puerto de Flask
EXPOSE 5000

# Comando para iniciar Flask
CMD ["python3", "app.py"]
