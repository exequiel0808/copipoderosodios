import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- CARGAR VIDEOS DESDE FIREBASE ---
async function cargarVideos() {
    const contenedor = document.querySelector('.predicas-grid');
    if (!contenedor) return;

    try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        
        // Limpiar videos de ejemplo
        contenedor.innerHTML = '';
        
        if (querySnapshot.empty) {
            contenedor.innerHTML = '<p style="color: white; grid-column: 1/-1; text-align: center;">No hay videos disponibles aún.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const video = doc.data();
            const videoDiv = document.createElement('div');
            videoDiv.className = 'video-container';
            videoDiv.innerHTML = `
                <iframe src="${video.embedUrl}" frameborder="0" allowfullscreen></iframe>
            `;
            contenedor.appendChild(videoDiv);
        });
    } catch (error) {
        console.error("Error al cargar videos:", error);
    }
}

// --- CARGAR CATEGORÍAS DE VERSÍCULOS ---
async function cargarCategorias() {
    const contenedor = document.getElementById("contenedorBotones");
    if (!contenedor) return;

    try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        contenedor.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const cat = doc.data();
            const btn = document.createElement("button");
            btn.textContent = cat.nombre;
            btn.className = "btn-cat-dinamico";
            btn.onclick = () => mostrarVersiculo(cat.texto, cat.cita);
            contenedor.appendChild(btn);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

function mostrarVersiculo(texto, cita) {
    const textoEl = document.getElementById("texto-biblico");
    const citaEl = document.getElementById("cita-biblica");
    
    textoEl.style.opacity = "0";
    citaEl.style.opacity = "0";
    
    setTimeout(() => {
        textoEl.textContent = texto;
        citaEl.textContent = cita;
        textoEl.style.opacity = "1";
        citaEl.style.opacity = "1";
    }, 300);
}

// --- VERSÍCULO DEL DÍA ---
async function cargarVersiculoDelDia() {
    const textoEl = document.getElementById("texto-dia");
    const citaEl = document.getElementById("cita-dia");
    
    if (!textoEl || !citaEl) return;

    try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        const versiculos = [];
        
        querySnapshot.forEach((doc) => {
            versiculos.push(doc.data());
        });

        if (versiculos.length > 0) {
            const random = versiculos[Math.floor(Math.random() * versiculos.length)];
            textoEl.textContent = random.texto;
            citaEl.textContent = random.cita;
        }
    } catch (error) {
        console.error("Error al cargar versículo del día:", error);
    }
}

// --- MODO OSCURO ---
const btnModo = document.getElementById("btnModoOscuro");
const iconoModo = document.getElementById("iconoModo");

if (btnModo) {
    btnModo.addEventListener("click", () => {
        document.body.classList.toggle("modo-oscuro");
        iconoModo.textContent = document.body.classList.contains("modo-oscuro") ? "☀️" : "🌙";
    });
}

// --- MÚSICA ---
const btnMusica = document.getElementById("btnMusicaVersiculos");
const audio = document.getElementById("audioVersiculos");

if (btnMusica && audio) {
    btnMusica.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            btnMusica.querySelector("span").textContent = "Pausar Música";
        } else {
            audio.pause();
            btnMusica.querySelector("span").textContent = "Música de Paz";
        }
    });
}

// --- FAQ ACORDEÓN ---
document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const answer = btn.nextElementSibling;
        const icon = btn.querySelector("i");
        
        if (answer.style.display === "block") {
            answer.style.display = "none";
            icon.classList.remove("fa-minus");
            icon.classList.add("fa-plus");
        } else {
            answer.style.display = "block";
            icon.classList.remove("fa-plus");
            icon.classList.add("fa-minus");
        }
    });
});

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarVersiculoDelDia();
    cargarVideos(); // ← NUEVA FUNCIÓN PARA CARGAR VIDEOS
});
