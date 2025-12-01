# Aplicación Web — Procesamiento de Imágenes basado en Docker y PyCUDA
Esta aplicación esta integrada **Flask** con **PyCUDA** para realizar procesamiento de imágenes acelerado por GPU, dentro de un entorno contenerizado usando **Docker + NVIDIA Container Toolkit**.


# 📦 Ejecución Local (sin Docker)
**Requisitos**:
- Una GPU NVIDIA con soporte CUDA. 
- Requiere CUDA toolkit instalado.
- Python 3.10 o 3.11

## Crear y activar entorno virtual
```bash
python -m venv venv
source venv/bin/activate   # Linux/macOS
# o
venv\Scripts\activate      # Windows
Librerias Utilizadas
```

## Instalar dependencias
```
pip install -r requirements.txt
```

## Ejecución de la Aplicación
- En la terminal, para iniciar la aplicación:
```
python app.py
```

# 🐳 Ejecución con Docker
**Requisitos**:
- Docker Desktop.
- NVIDIA Container Toolkit.
  
**Pasos por realizar**:


Descargar la imagen CUDA requerida
Al desplegarlo nos evita conflictos de versiones y aprovechamos el entorno CUDA oficial.

Abrimos una terminal y construimos la imagen Docker (desde la carpeta donde está el Dockerfile):

```
docker build -t gpu-filters-image .
```

 
## Ejecución del Contenedor

Ejecutar el contenedor mapeando el puerto 5000:

```
docker run -p 5000:5000 gpu-filters-image
```


## Ejecución de la Aplicación

Al iniciar la aplicación verás algo como:

 * `Running on all addresses (0.0.0.0)`
 * `Running on`: `http://127.0.0.1:5000`
 * `Running on`: `http://192.168.1.101:5000`

La URL de acceso desde la misma máquina:

``` http://127.0.0.1:5000 ```

La URL de acceso desde otro dispositivo en tu red local:

``` http://192.168.1.101:5000```


# 🖥️ Guia de Usuario
Esta aplicación web te permite aplicar filtros de procesamiento de imágenes mediante el uso de la GPU de forma rápida. Todos los cálculos se realizan en tu tarjeta gráfica NVIDIA, lo que permite procesar imágenes grandes en fracciones de segundo.


## Interfaz Principal
Al abrir la aplicación se observa una interfaz dividida en tres secciones clave:

1. Formulario de entrada
2. Vista previa (imagen original vs. procesada)
3. Resumen de parámetros usados


# Cómo usar la aplicación

## Paso 1: Sube una imagen
Haz clic en "Seleccione imagen" y elige un archivo desde tu computadora.
Formatos soportados: JPEG, PNG, BMP.
- La imagen se mostrará automáticamente en la sección Original.



## Paso 2: Elige un filtro
Selecciona uno de los siguientes efectos:

| Filtro  | Descripción |
|---------|-------------|
| **Sobel** | Detecta bordes mediante gradiente espacial (ideal para resaltar contornos). |
| **Emboss** | Aplica un efecto de relieve (3D), destacando la dirección de la luz. |
| **Gauss** | Suaviza la imagen (desenfoque gaussiano), útil para reducir ruido. |
| **Sharpen** | Realza los detalles y aumenta la nitidez. |



## Paso 3: Ajusta el tamaño del kernel
El tamaño del kernel define la ventana de cálculo del filtro (siempre impar y ≥ 3):

| Tamaño | Efecto |
|--------|--------|
| **9×9**  | Rápido y ligero — ideal para pruebas o imágenes pequeñas. |
| **21×21** | Equilibrio entre calidad y velocidad. |
| **49×49** | Máxima calidad o efectos intensos. |



## Paso 4: Procesa con GPU
1. Haz clic en "Procesar por GPU".
2. Aparecerá un mensaje: "Procesando imagen, por favor espere..." mientras se ejecuta en la GPU.
3. La imagen resultante se mostrará al lado de la original.
- Ya puedes comparar visualmente el efecto del filtro.



## Paso 5: Visualización de los parámetros utilizados
Al finalizar el procesamiento, la aplicación muestra una tarjeta con los parámetros exactos aplicados, incluyendo:

- Nombre del filtro
- Tamaño del kernel
- Resolución de la imagen
- Tiempo de procesamiento en la GPU (en milisegundos)
- Parámetros adicionales.

## Paso 6: Reiniciar
¿Quieres probar otra combinación?

1. Haz clic en el botón circular ↺ (esquina inferior derecha).
2. Esto limpiará la imagen actual y restablecerá los campos del formulario.

## 📌 Recomendaciones
- Usa imágenes con buena resolución para apreciar mejor los efectos.
- Los filtros funcionan mejor en imágenes con tamaños grandes de píxeles.
