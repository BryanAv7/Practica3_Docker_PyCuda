
// PARÁMETROS VISIBLE POR FILTRO
const PARAMS_BY_FILTER = {
    "emboss": ["offset", "factor"],
    "sobel": ["factor"],
    "gauss": ["sigma"],
    "sharpen": ["sharp_factor"]
};


// VALIDACIÓN DE BLOQUES (CUDA)
const bx = document.getElementById("block_x");
const by = document.getElementById("block_y");
const bz = document.getElementById("block_z");
const warning = document.getElementById("blockWarning");
const btnProcesar = document.querySelector("#form-gpu button[type='submit']");

function validarBloques() {
    let x = parseInt(bx.value) || 0;
    let y = parseInt(by.value) || 0;
    let z = parseInt(bz.value) || 0;

    // Mínimos
    if (x < 1) bx.value = x = 1;
    if (y < 1) by.value = y = 1;
    if (z < 1) bz.value = z = 1;

    const total = x * y * z;

    // Si es inválido: mostrar alerta, colorear, bloquear botón
    if (total > 1024) {

        warning.classList.remove("hidden");
        warning.textContent = `⚠️ El bloque tiene ${total} hilos. Máximo permitido: 1024.`;

        [bx, by, bz].forEach(inp => inp.classList.add("input-error"));

        btnProcesar.disabled = true;
        btnProcesar.classList.add("btn-disabled");

        return false;
    }

    // Si es válido: limpiar estilos
    warning.classList.add("hidden");

    [bx, by, bz].forEach(inp => inp.classList.remove("input-error"));

    btnProcesar.disabled = false;
    btnProcesar.classList.remove("btn-disabled");

    return true;
}

[bx, by, bz].forEach(input => input.addEventListener("input", validarBloques));
validarBloques(); // Validación inicial


// PRESETS GPU
const presets = {
    low:  { x: 8,  y: 8,  z: 1 },
    med:  { x: 16, y: 16, z: 1 },
    high: { x: 32, y: 32, z: 1 }  // Máximo permitido: 32×32 = 1024 hilos
};

function aplicarPreset(p) {
    bx.value = p.x;
    by.value = p.y;
    bz.value = p.z;
    validarBloques();
}

document.getElementById("presetLow").addEventListener("click", () => aplicarPreset(presets.low));
document.getElementById("presetMed").addEventListener("click", () => aplicarPreset(presets.med));
document.getElementById("presetHigh").addEventListener("click", () => aplicarPreset(presets.high));


// FORMULARIO PRINCIPAL
document.getElementById("form-gpu").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validarBloques()) {
        alert("El total de hilos por bloque NO puede superar 1024.");
        return;
    }

    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");

    try {
        const formData = new FormData(e.target);

        const imgInput = document.getElementById("input-img").files[0];
        document.getElementById("original").src =
            URL.createObjectURL(imgInput);

        const resp = await fetch("/procesar", {
            method: "POST",
            body: formData
        });

        const data = await resp.json();

        // Parámetros visibles por filtro
        const visibles = PARAMS_BY_FILTER[data.filtro] || [];
        let parametrosFiltrados = {};

        visibles.forEach(key => {
            if (data.parametros[key] !== undefined) {
                parametrosFiltrados[key] = data.parametros[key];
            }
        });

        document.getElementById("resultado").src =
            "data:image/png;base64," + data.imagenProcesada;

        document.getElementById("parametros-resultado").innerHTML = `
            <p><strong>Filtro seleccionado:</strong> ${data.filtro}</p>
            <p><strong>Kernel Size:</strong> ${data.ksize} × ${data.ksize}</p>
            <p><strong>Tiempo de ejecución:</strong> ${data.tiempo.toFixed(4)} s</p>
            <p><strong>Tamaño imagen:</strong> ${data.pesoMB} MB</p>
            <p><strong>Resolución:</strong> ${data.ancho} × ${data.alto} px</p>
            <h3>Parámetros adicionales:</h3>
            <pre>${JSON.stringify(parametrosFiltrados, null, 4)}</pre>
        `;

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error procesando la imagen.");
    } finally {
        loader.classList.add("hidden");
    }
});


// RESET
document.getElementById("btnReset").addEventListener("click", () => {
    location.reload();
});


// PANEL LATERAL
const panel = document.getElementById("infoPanel");
const tab = document.getElementById("infoTab");
const closeBtn = document.getElementById("closeInfo");

window.addEventListener("load", () => {
    tab.style.display = "block";
});

tab.addEventListener("click", () => {
    panel.classList.add("open");
    tab.style.display = "none";
});

closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    tab.style.display = "block";
});

document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !tab.contains(e.target)) {
        if (panel.classList.contains("open")) {
            panel.classList.remove("open");
            tab.style.display = "block";
        }
    }
});
