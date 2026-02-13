// ===== FIREBASE CONFIGURATION =====
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

// ===== CONFIGURACIÓN DE TU PROYECTO =====
const firebaseConfig = {
  apiKey: "AIzaSyAGuvarPXC8XMH6wGDp_3yviQPbLtayXfA",
  authDomain: "apkstore2026-71e05.firebaseapp.com",
  projectId: "apkstore2026-71e05",
  storageBucket: "apkstore2026-71e05.firebasestorage.app",
  messagingSenderId: "348939975191",
  appId: "1:348939975191:web:18b63745feeb69eb843a52"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== CONTRASEÑA DE ADMIN =====
const ADMIN_PASSWORD = "admin123";

// ===== VARIABLES =====
let allApps = [];
let isAdmin = false;

// ===== AUTH SIMPLE =====
if (localStorage.getItem("adminLoggedIn") === "true") {
  showAdminUI();
}

function showAdminUI() {
  isAdmin = true;
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
  try {
    const q = query(collection(db, "apks"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);

    allApps = [];
    querySnapshot.forEach((docSnap) => {
      allApps.push({ id: docSnap.id, ...docSnap.data() });
    });

    displayApps(allApps);
    updateStats();
  } catch (error) {
    console.error("Error cargando apps:", error);
  }
}

// ===== MOSTRAR APPS =====
function displayApps(apps) {
  const appsGrid = document.getElementById("appsGrid");

  if (apps.length === 0) {
    appsGrid.innerHTML = "<p>No hay aplicaciones aún.</p>";
    return;
  }

  appsGrid.innerHTML = apps
    .map(
      (app) => `
    <div class="app-card">
      <h3>${app.nombre}</h3>
      <p>Versión ${app.version}</p>
      <button class="btn-download" onclick="downloadApp('${app.id}', '${app.url}')">
        Descargar
      </button>
    </div>
  `
    )
    .join("");
}

function updateStats() {
  document.getElementById("totalApps").textContent = allApps.length;
}

// ===== SUBIR APK =====
async function uploadAPK(event) {
  event.preventDefault();

  const appName = document.getElementById("appName").value;
  const appVersion = document.getElementById("appVersion").value;
  const appCategory = document.getElementById("appCategory").value;
  const appDescription = document.getElementById("appDescription").value;
  const apkFile = document.getElementById("apkFile").files[0];

  if (!apkFile) {
    alert("Selecciona un archivo APK");
    return;
  }

  const formData = new FormData();
  formData.append("file", apkFile);
  formData.append("upload_preset", "apk_unsigned");

  try {
    const response = await fetch(
"https://api.cloudinary.com/v1_1/dpny3pbg8/auto/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
console.log("Respuesta de Cloudinary:", data);

    if (!data.secure_url) {
      alert("Error al subir archivo");
      return;
    }

    await addDoc(collection(db, "apks"), {
      nombre: appName,
      version: appVersion,
      categoria: appCategory,
      descripcion: appDescription,
      url: data.secure_url,
      descargas: 0,
      fecha: serverTimestamp()
    });

    alert("APK subida correctamente ✅");
    document.getElementById("uploadForm").reset();
    loadApps();
  } catch (error) {
    console.error("Error subiendo APK:", error);
    alert("Error al subir");
  }
}

// ===== DESCARGAR =====
async function downloadApp(appId, url) {
  try {
    const appRef = doc(db, "apks", appId);
    await updateDoc(appRef, {
      descargas: increment(1)
    });

    window.open(url, "_blank");
  } catch (error) {
    console.error("Error descargando:", error);
  }
}

window.downloadApp = downloadApp;

// ===== EVENTOS =====
document.addEventListener("DOMContentLoaded", () => {
  loadApps();

  document
    .getElementById("uploadForm")
    .addEventListener("submit", uploadAPK);

  document
    .getElementById("passwordForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const password = document.getElementById("adminPassword").value;
      checkPassword(password);
    });

  document
    .getElementById("btnLoginFromSection")
    .addEventListener("click", openPasswordModal);

  document
    .getElementById("closePasswordModal")
    .addEventListener("click", closePasswordModal);
});
