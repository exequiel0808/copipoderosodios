// ======================================================
// FIREBASE CONFIG
// ======================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ======================================================
// VERSÍCULO DEL DÍA (JSON DESDE GITHUB)
// ======================================================
async function cargarVersiculoDiario() {
  const URL =
    "https://raw.githubusercontent.com/exequiel0808/poderoso-Dios/main/biblia-completa-rv1960.json";

  const texto = document.getElementById("texto-dia");
  const cita = document.getElementById("cita-dia");

  if (!texto || !cita) return;

  try {
    const res = await fetch(URL + "?v=" + Date.now());
    const biblia = await res.json();

    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), 0, 0);
    const dia = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));

    const versiculo = biblia[dia % biblia.length];

    texto.textContent = `"${versiculo.texto}"`;
    cita.textContent = versiculo.cita;
  } catch (e) {
    texto.textContent =
      "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.";
    cita.textContent = "Salmos 119:105";
  }
}

// ======================================================
// MODO OSCURO
// ======================================================
function inicializarModoOscuro() {
  const btn = document.getElementById("btnModoOscuro");
  if (!btn) return;

  const estado = localStorage.getItem("modoOscuro");
  if (estado === "on") document.body.classList.add("modo-oscuro");

  btn.addEventListener("click", () => {
    document.body.classList.toggle("modo-oscuro");
    localStorage.setItem(
      "modoOscuro",
      document.body.classList.contains("modo-oscuro") ? "on" : "off"
    );
  });
}

// ======================================================
// MÚSICA DE FONDO
// ======================================================
function inicializarMusica() {
  const audio = document.getElementById("audioVersiculos");
  const btn = document.getElementById("btnMusicaVersiculos");

  if (!audio || !btn) return;

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      btn.classList.add("activo");
    } else {
      audio.pause();
      btn.classList.remove("activo");
    }
  });
}

// ======================================================
// FAQ – FUNDAMENTOS DE FE (EL +)
// ======================================================
function inicializarFAQ() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = question.querySelector("i");

    answer.style.display = "none";

    question.addEventListener("click", () => {
      const abierto = answer.style.display === "block";

      items.forEach(i => {
        i.querySelector(".faq-answer").style.display = "none";
        i.querySelector("i").classList.replace("fa-minus", "fa-plus");
      });

      if (!abierto) {
        answer.style.display = "block";
        icon.classList.replace("fa-plus", "fa-minus");
      }
    });
  });
}

// ======================================================
// FORMULARIO DE ORACIÓN (FIREBASE)
// ======================================================
const formOracion = document.getElementById("formOracion");
if (formOracion) {
  formOracion.addEventListener("submit", async e => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "oraciones"), {
        nombre: document.getElementById("nombreInput").value.trim(),
        peticion: document.getElementById("peticionInput").value.trim(),
        fecha: serverTimestamp()
      });

      alert("🙏 Tu petición fue enviada. Estamos orando por ti.");
      formOracion.reset();
    } catch (e) {
      alert("❌ No se pudo enviar la petición.");
    }
  });
}

// ======================================================
// FORMULARIO DE CONTACTO (FIREBASE)
// ======================================================
const formContacto = document.getElementById("formContacto");
if (formContacto) {
  formContacto.addEventListener("submit", async e => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "contacto"), {
        nombre: document.getElementById("nombreC").value.trim(),
        email: document.getElementById("emailC").value.trim(),
        mensaje: document.getElementById("mensajeC").value.trim(),
        fecha: serverTimestamp()
      });

      alert("📩 Mensaje enviado correctamente.");
      formContacto.reset();
    } catch (e) {
      alert("❌ Error al enviar el mensaje.");
    }
  });
}

// ======================================================
// INICIALIZACIÓN GENERAL
// ======================================================
window.addEventListener("DOMContentLoaded", () => {
  cargarVersiculoDiario();
  inicializarModoOscuro();
  inicializarMusica();
  inicializarFAQ();
});
