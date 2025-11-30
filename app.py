# app.py
from flask import Flask, request, jsonify, send_file
import tempfile
import os
import pycuda.autoinit 
from gpu_filters_rgb import run_gpu_filter_rgb

app = Flask(__name__)

@app.route("/process", methods=["POST"])
def process_image():
    temp_input = None
    temp_output = None
    try:
        # Validación de archivo
        if "image" not in request.files:
            return jsonify({"error": "Debe enviar una imagen"}), 400

        image = request.files["image"]

        # Parámetros del filtro
        filter_name = request.form.get("filter", "sobel")
        ksize = int(request.form.get("ksize", 9))
        factor = float(request.form.get("factor", 1.0))
        offset = float(request.form.get("offset", 0.0))
        sigma = request.form.get("sigma", None)
        sharp_factor = float(request.form.get("sharp_factor", 1.0))

        if sigma is not None:
            sigma = float(sigma)

        # Guardar imagen de entrada en archivo temporal
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        image.save(temp_input.name)

        # Archivo de salida temporal
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_output.close()

        # Ejecutar filtro GPU 
        elapsed, shape = run_gpu_filter_rgb(
            input_path=temp_input.name,
            output_path=temp_output.name,
            filter_name=filter_name,
            ksize=ksize,
            factor=factor,
            offset=offset,
            sigma=sigma,
            sharp_factor=sharp_factor
        )

        # Devolver imagen procesada
        response = send_file(temp_output.name, mimetype="image/png")
        response.headers["X-Processing-Time"] = f"{elapsed:.5f}"
        response.headers["X-Image-Shape"] = str(shape)
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Limpiar archivos temporales 
        if temp_input and os.path.exists(temp_input.name):
            try:
                os.unlink(temp_input.name)
            except Exception:
                pass
        if temp_output and os.path.exists(temp_output.name):
            try:
                os.unlink(temp_output.name)
            except Exception:
                pass

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "API Flask + PyCUDA funcionando (modo seguro, single-thread)",
        "note": "Ejecutado con pycuda.autoinit y threaded=False"
    })

if __name__ == "__main__":
    print("🚀 Iniciando servidor Flask")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=False)