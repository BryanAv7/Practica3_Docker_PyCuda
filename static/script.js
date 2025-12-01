// Parámetros visibles por filtro
const PARAMS_BY_FILTER = {
    "emboss": ["offset", "factor"],
    "sobel": ["factor"],
    "gauss": ["sigma"],
    "sharpen": ["sharp_factor"]
};

document.getElementById("form-gpu").addEventListener("submit", async (e) => {
    e.preventDefault();

    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");   // ⬅️ Mostrar aviso

    try {
        const formData = new FormData(e.target);

        // Mostrar preview
        const imgInput = document.getElementById("input-img").files[0];
        document.getElementById("original").src = URL.createObjectURL(imgInput);

        const resp = await fetch("/procesar", {
            method: "POST",
            body: formData
        });

        const data = await resp.json();

        // 🔽 ... tu código existente para mostrar resultados ...
        const filtro = data.filtro;
        const visibles = PARAMS_BY_FILTER[filtro] || [];

        let parametrosFiltrados = {};
        for (let key of visibles) {
            if (data.parametros[key] !== undefined && data.parametros[key] !== null) {
                parametrosFiltrados[key] = data.parametros[key];
            }
        }

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
        loader.classList.add("hidden");  // ⬅️ Ocultar aviso
    }
});

// RESET
document.getElementById("btnReset").addEventListener("click", () => {
    location.reload();
});

// INFO PANEL TOGGLE
// === PANEL LATERAL ===
const panel = document.getElementById("infoPanel");
const tab = document.getElementById("infoTab");
const closeBtn = document.getElementById("closeInfo");

// APARECER PESTAÑA después de carga
window.addEventListener("load", () => {
    tab.style.display = "block";  // ⬅️ Mostrar solo cuando la página está lista
});

// ABRIR panel
tab.addEventListener("click", () => {
    panel.classList.add("open");
    tab.style.display = "none";    // ⬅️ Ocultar pestaña mientras el panel está abierto
});

// CERRAR panel desde botón interno
closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    tab.style.display = "block";   // ⬅️ Volver a mostrar la pestaña
});

// CERRAR si se clickea afuera
document.addEventListener("click", (e) => {
    const clickInsidePanel = panel.contains(e.target);
    const clickTab = tab.contains(e.target);

    if (!clickInsidePanel && !clickTab) {
        if (panel.classList.contains("open")) {
            panel.classList.remove("open");
            tab.style.display = "block"; // ⬅️ Mostrar pestaña otra vez
        }
    }
});

