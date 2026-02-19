import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDg6RXRQLroOmsmIlziXlv1Rqnp3qaeEoM",
  authDomain: "poderoso-es-dios-b59f6.firebaseapp.com",
  projectId: "poderoso-es-dios-b59f6",
  storageBucket: "poderoso-es-dios-b59f6.firebasestorage.app",
  messagingSenderId: "974573934460",
  appId: "1:974573934460:web:67983211175a88811db6f9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- SEGURIDAD AL CARGAR LA PÁGINA ---
function verificarAcceso() {
    const claveCorrecta = "AdminDios2024";
    const pass = prompt("Clave de acceso:");

    if (pass === claveCorrecta) {
        document.getElementById("adminContent").style.display = "block";
    } else {
        alert("Acceso denegado");
        window.location.href = "index.html";
    }
}

verificarAcceso();

// --- GUARDAR CATEGORÍA DE VERSÍCULOS ---
const formVer = document.getElementById("formVersiculo");
if (formVer) {
    formVer.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector("button");
        btn.innerText = "Guardando...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "categorias"), {
                nombre: document.getElementById("catNombre").value,
                texto: document.getElementById("catTexto").value,
                cita: document.getElementById("catCita").value,
                id: document.getElementById("catId").value.toLowerCase()
            });
            alert("✅ ¡Categoría guardada exitosamente en Firebase!");
            formVer.reset();
        } catch (error) {
            console.error("Error completo:", error);
            alert("❌ Error al guardar. Revisa la consola (F12) o las reglas de Firebase.");
        } finally {
            btn.innerText = "Guardar Categoría";
            btn.disabled = false;
        }
    });
}

// --- GUARDAR VIDEO DE PRÉDICA ---
const formVideo = document.getElementById("formVideo");
if (formVideo) {
    formVideo.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector("button");
        btn.innerText = "Guardando...";
        btn.disabled = true;

        const titulo = document.getElementById("videoTitulo").value;
        const link = document.getElementById("videoLink").value;
        
        // Convertir link de YouTube a formato embed
        let embedUrl = link;
        if (link.includes("youtube.com/watch?v=")) {
            const videoId = link.split("v=")[1].split("&")[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (link.includes("youtu.be/")) {
            const videoId = link.split("youtu.be/")[1].split("?")[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        try {
            await addDoc(collection(db, "videos"), {
                titulo: titulo,
                embedUrl: embedUrl,
                linkOriginal: link,
                fecha: new Date().toISOString()
            });
            alert("✅ ¡Video guardado exitosamente! Se mostrará automáticamente en el index.html");
            formVideo.reset();
        } catch (error) {
            console.error("Error al guardar video:", error);
            alert("❌ Error al guardar el video. Revisa la consola (F12).");
        } finally {
            btn.innerText = "Guardar Video";
            btn.disabled = false;
        }
    });
}