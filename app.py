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
        if "imagen" not in request.files:
            return jsonify({"error": "Debe enviar una imagen"}), 400

        image = request.files["imagen"]

        filter_name = request.form.get("filtro", "sobel")
        ksize = int(request.form.get("ksize", 9))

        # ---- Nuevos parámetros de bloques enviados por el front ----
        block_x = int(request.form.get("block_x", 16))
        block_y = int(request.form.get("block_y", 16))
        block_z = int(request.form.get("block_z", 1))

        if block_x * block_y * block_z > 1024:
            return jsonify({
              "error": f"El total de hilos por bloque ({block_x * block_y * block_z}) "
                 f"excede el máximo permitido de 1024."
            }), 400
            
        # Parámetros internos
        factor = 2.0
        offset = 128.0
        sigma = 90.0
        sharp_factor = 20.0

        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        image.save(temp_input.name)

        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_output.close()

        elapsed, (W, H) = run_gpu_filter_rgb(
            input_path=temp_input.name,
            output_path=temp_output.name,
            filter_name=filter_name,
            ksize=ksize,
            factor=factor,
            offset=offset,
            sigma=sigma,
            sharp_factor=sharp_factor,
            block=(block_x, block_y, block_z)
        )

        with open(temp_output.name, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode("utf-8")

        peso_mb = os.path.getsize(temp_output.name) / (1024 * 1024)

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
                "sharp_factor": sharp_factor,
                "block_x": block_x,
                "block_y": block_y,
                "block_z": block_z
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
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