# app.py
from flask import Flask, request, jsonify, send_file, render_template
import tempfile
import os
import pycuda.autoinit 
import base64
from gpu_filters_rgb import run_gpu_filter_rgb

app = Flask(__name__)

@app.route("/procesar", methods=["POST"])
def process_image():
    temp_input = None
    temp_output = None

    try:
        # Validación: verificar si se envió archivo
        if "imagen" not in request.files:
            return jsonify({"error": "Debe enviar una imagen"}), 400

        image = request.files["imagen"]

        # Parámetros enviados por el front
        filter_name = request.form.get("filtro", "sobel")
        ksize = int(request.form.get("ksize", 9))

        # Parámetros no enviados pero requeridos por GPU
        factor = 2.0
        offset = 128.0
        sigma = 90.0
        sharp_factor = 20.0

        # Archivo temporal de entrada
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        image.save(temp_input.name)

        # Archivo temporal de salida
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_output.close()

        # Procesar en GPU
        elapsed, (W, H) = run_gpu_filter_rgb(
            input_path=temp_input.name,
            output_path=temp_output.name,
            filter_name=filter_name,
            ksize=ksize,
            factor=factor,
            offset=offset,
            sigma=sigma,
            sharp_factor=sharp_factor
        )

        # Convertir imagen procesada a BASE64 para enviar al front
        with open(temp_output.name, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode("utf-8")

        # Tamaño en MB
        peso_mb = os.path.getsize(temp_output.name) / (1024 * 1024)

        # Respuesta JSON en el mismo formato que espera tu front
        return jsonify({
            "imagenProcesada": img_base64,
            "filtro": filter_name,
            "ksize": ksize,
            "tiempo": elapsed,
            "pesoMB": round(peso_mb, 4),
            "ancho": W,
            "alto": H,
            "parametros": {
                "factor": factor,
                "offset": offset,
                "sigma": sigma,
                "sharp_factor": sharp_factor
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Limpieza de temporales
        if temp_input and os.path.exists(temp_input.name):
            try: os.unlink(temp_input.name)
            except: pass
        if temp_output and os.path.exists(temp_output.name):
            try: os.unlink(temp_output.name)
            except: pass

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    print("🚀 Iniciando servidor Flask")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=False)