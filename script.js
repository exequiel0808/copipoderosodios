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
  snapshot.forEach(docSnap => {
    allApps.push({ id: docSnap.id, ...docSnap.data() });
  });

  displayApps(allApps);
  document.getElementById("totalApps").textContent = allApps.length;
}

// ===== MOSTRAR APPS =====
function displayApps(apps) {
  const grid = document.getElementById("appsGrid");

  if (apps.length === 0) {
    grid.innerHTML = "<p>No hay aplicaciones aún.</p>";
    return;
  }

  grid.innerHTML = apps.map(app => `
    <div class="app-card">
      <h3>${app.nombre}</h3>
      <p>${app.descripcion || ""}</p>
      <button class="btn-download" onclick="downloadApp('${app.id}', '${app.url}')">
        Descargar
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
    imagen1: image1.value,
    imagen2: image2.value,
    imagen3: image3.value,
    descargas: 0,
    fecha: serverTimestamp()
  };

  await addDoc(collection(db, "apks"), data);

  alert("Aplicación agregada correctamente ✅");
  uploadForm.reset();
  loadApps();
}

// ===== DESCARGAR =====
async function downloadApp(id, url) {
  const ref = doc(db, "apks", id);
  await updateDoc(ref, { descargas: increment(1) });
  window.open(url, "_blank");
}

window.downloadApp = downloadApp;

// ===== EVENTOS =====
document.addEventListener("DOMContentLoaded", () => {
  loadApps();

  uploadForm.addEventListener("submit", uploadAPK);

  passwordForm.addEventListener("submit", function(e){
    e.preventDefault();
    checkPassword(adminPassword.value);
  });

  btnLoginFromSection.addEventListener("click", openPasswordModal);
  closePasswordModal.addEventListener("click", closePasswordModal);
});
