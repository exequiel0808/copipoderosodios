import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGuvarPXC8XMH6wGDp_3yviQPbLtayXfA",
  authDomain: "apkstore2026-71e05.firebaseapp.com",
  projectId: "apkstore2026-71e05",
  storageBucket: "apkstore2026-71e05.firebasestorage.app",
  messagingSenderId: "348939975191",
  appId: "1:348939975191:web:18b63745feeb69eb843a52"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PASSWORD = "admin123";

let allApps = [];

// ===== ELEMENTOS DEL DOM =====
let uploadForm, passwordForm, adminPassword;
let appName, appVersion, appCategory, appDescription, appURL;
let image1, image2, image3;
let btnLoginFromSection, closePasswordModalBtn;
let searchInput, categoryButtons;

// ===== ADMIN =====
if (localStorage.getItem("adminLoggedIn") === "true") {
  showAdminUI();
}

function showAdminUI() {
  localStorage.setItem("adminLoggedIn", "true");
  document.getElementById("uploadFormContainer").style.display = "block";
  document.getElementById("accessDenied").style.display = "none";
  document.getElementById("subir").style.display = "block";
}

function checkPassword(password) {
  if (password === ADMIN_PASSWORD) {
    showAdminUI();
    closePasswordModal();
  } else {
    document.getElementById("passwordError").style.display = "flex";
    setTimeout(() => {
      document.getElementById("passwordError").style.display = "none";
    }, 3000);
  }
}

function openPasswordModal() {
  document.getElementById("passwordModal").style.display = "block";
}

function closePasswordModal() {
  document.getElementById("passwordModal").style.display = "none";
  document.getElementById("passwordForm").reset();
}

// ===== CARGAR APPS =====
async function loadApps() {
  const q = query(collection(db, "apks"), orderBy("fecha", "desc"));
  const snapshot = await getDocs(q);

  allApps = [];
  let totalDescargas = 0;
  
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    allApps.push({ id: docSnap.id, ...data });
    totalDescargas += data.descargas || 0;
  });

  displayApps(allApps);
  document.getElementById("totalApps").textContent = allApps.length;
  document.getElementById("totalDownloads").textContent = totalDescargas;
}

// ===== MOSTRAR APPS =====
function displayApps(apps) {
  const grid = document.getElementById("appsGrid");

  if (apps.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-inbox"></i>
        <p>No hay aplicaciones disponibles</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = apps.map(app => `
    <div class="app-card" data-category="${app.categoria}">
      <div class="app-icon">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <h3>${app.nombre}</h3>
      <p class="app-version">v${app.version}</p>
      <p class="app-description">${app.descripcion || "Sin descripción"}</p>
      <div class="app-stats">
        <span><i class="fas fa-download"></i> ${app.descargas || 0}</span>
        <span class="app-category">${app.categoria}</span>
      </div>
      <button class="btn-download" onclick="downloadApp('${app.id}', '${app.url}')">
        <i class="fas fa-download"></i> Descargar
      </button>
    </div>
  `).join("");
}

// ===== AGREGAR APP =====
async function uploadAPK(e) {
  e.preventDefault();

  const data = {
    nombre: appName.value,
    version: appVersion.value,
    categoria: appCategory.value,
    descripcion: appDescription.value,
    url: appURL.value,
    imagen1: image1.value || "",
    imagen2: image2.value || "",
    imagen3: image3.value || "",
    descargas: 0,
    fecha: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "apks"), data);
    alert("✅ Aplicación agregada correctamente");
    uploadForm.reset();
    loadApps();
  } catch (error) {
    alert("❌ Error al agregar la aplicación: " + error.message);
    console.error(error);
  }
}

// ===== DESCARGAR =====
async function downloadApp(id, url) {
  try {
    const ref = doc(db, "apks", id);
    await updateDoc(ref, { descargas: increment(1) });
    window.open(url, "_blank");
    loadApps(); // Actualizar contador
  } catch (error) {
    console.error("Error al actualizar descargas:", error);
    window.open(url, "_blank");
  }
}

// ===== BÚSQUEDA Y FILTROS =====
function setupSearch() {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allApps.filter(app => 
      app.nombre.toLowerCase().includes(searchTerm) ||
      (app.descripcion && app.descripcion.toLowerCase().includes(searchTerm))
    );
    displayApps(filtered);
  });

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remover active de todos
      categoryButtons.forEach(b => b.classList.remove("active"));
      // Agregar active al clickeado
      btn.classList.add("active");
      
      const category = btn.dataset.category;
      if (category === "todas") {
        displayApps(allApps);
      } else {
        const filtered = allApps.filter(app => app.categoria === category);
        displayApps(filtered);
      }
    });
  });
}

// Hacer downloadApp global
window.downloadApp = downloadApp;

// ===== EVENTOS =====
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar elementos del DOM
  uploadForm = document.getElementById("uploadForm");
  passwordForm = document.getElementById("passwordForm");
  adminPassword = document.getElementById("adminPassword");
  
  appName = document.getElementById("appName");
  appVersion = document.getElementById("appVersion");
  appCategory = document.getElementById("appCategory");
  appDescription = document.getElementById("appDescription");
  appURL = document.getElementById("appURL");
  image1 = document.getElementById("image1");
  image2 = document.getElementById("image2");
  image3 = document.getElementById("image3");
  
  btnLoginFromSection = document.getElementById("btnLoginFromSection");
  closePasswordModalBtn = document.getElementById("closePasswordModal");
  
  searchInput = document.getElementById("searchInput");
  categoryButtons = document.querySelectorAll(".category-btn");
  
  // Cargar aplicaciones
  loadApps();
  
  // Event listeners de formularios
  uploadForm.addEventListener("submit", uploadAPK);
  
  passwordForm.addEventListener("submit", function(e) {
    e.preventDefault();
    checkPassword(adminPassword.value);
  });
  
  // Event listeners de modales
  btnLoginFromSection.addEventListener("click", openPasswordModal);
  closePasswordModalBtn.addEventListener("click", closePasswordModal);
  
  // Cerrar modal al hacer click fuera
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("passwordModal");
    if (e.target === modal) {
      closePasswordModal();
    }
  });
  
  // Setup búsqueda y filtros
  setupSearch();
});