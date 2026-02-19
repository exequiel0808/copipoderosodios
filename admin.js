import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- GUARDAR CATEGORÍA (VERSÍCULOS) ---
const formVersiculo = document.getElementById("formVersiculo");
if (formVersiculo) {
    formVersiculo.addEventListener("submit", async (e) => {
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
            alert("✅ ¡Categoría guardada exitosamente!");
            formVersiculo.reset();
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error al guardar. Revisa la consola.");
        } finally {
            btn.innerText = "Guardar Categoría";
            btn.disabled = false;
        }
    });
}

// --- GUARDAR PRÉDICA (VIDEOS) ---
const formPredica = document.getElementById("formPredica");
if (formPredica) {
    formPredica.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector("button");
        const textoOriginal = btn.innerText;
        btn.innerText = "Guardando...";
        btn.disabled = true;
        
        try {
            await addDoc(collection(db, "predicas"), {
                nombre: document.getElementById("predicaNombre").value.trim(),
                predicador: document.getElementById("predicaPredicador").value.trim() || "Sin especificar",
                url: document.getElementById("predicaUrl").value.trim(),
                fecha: serverTimestamp()
            });
            
            alert("✅ ¡Prédica guardada exitosamente!");
            formPredica.reset();
            
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error al guardar. Revisa la consola.");
        } finally {
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    });
}