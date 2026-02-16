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
let uploadForm, passwordForm, adminPassword, togglePasswordBtn;
let appName, appVersion, appCategory, appDescription, appURL;
let image1, image2, image3;
let btnAdminNav, btnLogoutNav, navSubirAPK;
let searchInput, searchClear, categoryButtons;
let mobileMenuToggle, navLinks;

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  checkAdminStatus();
  loadApps();
  setupEventListeners();
  setupNavbar();
});

// ===== INICIALIZAR ELEMENTOS =====
function initializeElements() {
  // Formularios
  uploadForm = document.getElementById("uploadForm");
  passwordForm = document.getElementById("passwordForm");
  adminPassword = document.getElementById("adminPassword");
  togglePasswordBtn = document.getElementById("togglePassword");
  
  // Campos del formulario
  appName = document.getElementById("appName");
  appVersion = document.getElementById("appVersion");
  appCategory = document.getElementById("appCategory");
  appDescription = document.getElementById("appDescription");
  appURL = document.getElementById("appURL");
  image1 = document.getElementById("image1");
  image2 = document.getElementById("image2");
  image3 = document.getElementById("image3");
  
  // Navegación
  btnAdminNav = document.getElementById("btnAdminNav");
  btnLogoutNav = document.getElementById("btnLogoutNav");
  navSubirAPK = document.getElementById("navSubirAPK");
  
  // Búsqueda
  searchInput = document.getElementById("searchInput");
  searchClear = document.getElementById("searchClear");
  categoryButtons = document.querySelectorAll(".category-btn");
  
  // Menú móvil
  mobileMenuToggle = document.getElementById("mobileMenuToggle");
  navLinks = document.getElementById("navLinks");
}

// ===== VERIFICAR ESTADO DE ADMIN =====
function checkAdminStatus() {
  if (localStorage.getItem("adminLoggedIn") === "true") {
    showAdminUI();
  }
}

// ===== MOSTRAR UI DE ADMIN =====
function showAdminUI() {
  localStorage.setItem("adminLoggedIn", "true");
  
  // Mostrar sección de subir APK
  document.getElementById("subir").style.display = "block";
  
  // Mostrar enlace en navbar
  if (navSubirAPK) navSubirAPK.style.display = "flex";
  
  // Ocultar botón de admin, mostrar logout
  if (btnAdminNav) btnAdminNav.style.display = "none";
  if (btnLogoutNav) btnLogoutNav.style.display = "flex";
  
  console.log("✅ Admin UI activada");
}

// ===== OCULTAR UI DE ADMIN =====
function hideAdminUI() {
  localStorage.removeItem("adminLoggedIn");
  
  // Ocultar sección de subir APK
  document.getElementById("subir").style.display = "none";
  
  // Ocultar enlace en navbar
  if (navSubirAPK) navSubirAPK.style.display = "none";
  
  // Mostrar botón de admin, ocultar logout
  if (btnAdminNav) btnAdminNav.style.display = "flex";
  if (btnLogoutNav) btnLogoutNav.style.display = "none";
  
  console.log("❌ Admin UI desactivada");
}

// ===== VERIFICAR CONTRASEÑA =====
function checkPassword(password) {
  if (password === ADMIN_PASSWORD) {
    showAdminUI();
    closePasswordModal();
    
    // Mostrar notificación
    showNotification("✅ Acceso concedido", "success");
  } else {
    const errorEl = document.getElementById("passwordError");
    if (errorEl) {
      errorEl.style.display = "flex";
      setTimeout(() => {
        errorEl.style.display = "none";
      }, 3000);
    }
  }
}

// ===== ABRIR MODAL DE CONTRASEÑA =====
function openPasswordModal() {
  const modal = document.getElementById("passwordModal");
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

// ===== CERRAR MODAL DE CONTRASEÑA =====
function closePasswordModal() {
  const modal = document.getElementById("passwordModal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    if (passwordForm) passwordForm.reset();
  }
}

// ===== CARGAR APPS =====
async function loadApps() {
  try {
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
    updateStats(allApps.length, totalDescargas);
  } catch (error) {
    console.error("Error al cargar apps:", error);
    showNotification("❌ Error al cargar las aplicaciones", "error");
  }
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats(totalApps, totalDownloads) {
  const appsEl = document.getElementById("totalApps");
  const downloadsEl = document.getElementById("totalDownloads");
  
  if (appsEl) animateCounter(appsEl, totalApps);
  if (downloadsEl) animateCounter(downloadsEl, totalDownloads);
}

// ===== ANIMAR CONTADOR =====
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 20);
}

// ===== MOSTRAR APPS =====
function displayApps(apps) {
  const grid = document.getElementById("appsGrid");
  
  if (!grid) return;

  if (apps.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-inbox"></i>
        <p>No hay aplicaciones disponibles</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = apps.map(app => {
    const categoryIcons = {
      streaming: 'fa-tv',
      juegos: 'fa-gamepad',
      utilidades: 'fa-tools',
      otros: 'fa-box'
    };
    
    const icon = categoryIcons[app.categoria] || 'fa-mobile-alt';
    
    return `
      <div class="app-card" data-category="${app.categoria}">
        <div class="app-icon">
          <i class="fas ${icon}"></i>
        </div>
        <h3>${app.nombre}</h3>
        <p class="app-version">v${app.version}</p>
        <p class="app-description">${app.descripcion || "Sin descripción disponible"}</p>
        <div class="app-stats">
          <span><i class="fas fa-download"></i> ${app.descargas || 0} descargas</span>
          <span class="app-category">${app.categoria}</span>
        </div>
        <button class="btn-download" onclick="downloadApp('${app.id}', '${app.url}')">
          <i class="fas fa-download"></i>
          <span>Descargar</span>
        </button>
      </div>
    `;
  }).join("");
}

// ===== AGREGAR APP =====
async function uploadAPK(e) {
  e.preventDefault();

  const data = {
    nombre: appName.value.trim(),
    version: appVersion.value.trim(),
    categoria: appCategory.value,
    descripcion: appDescription.value.trim(),
    url: appURL.value.trim(),
    imagen1: image1.value.trim() || "",
    imagen2: image2.value.trim() || "",
    imagen3: image3.value.trim() || "",
    descargas: 0,
    fecha: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "apks"), data);
    showNotification("✅ Aplicación agregada correctamente", "success");
    uploadForm.reset();
    loadApps();
    
    // Scroll a la sección de apps
    document.getElementById("apps").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error al agregar app:", error);
    showNotification("❌ Error al agregar la aplicación", "error");
  }
}

// ===== DESCARGAR APP =====
async function downloadApp(id, url) {
  try {
    const ref = doc(db, "apks", id);
    await updateDoc(ref, { descargas: increment(1) });
    window.open(url, "_blank");
    
    // Actualizar vista sin recargar todo
    setTimeout(loadApps, 500);
  } catch (error) {
    console.error("Error al actualizar descargas:", error);
    window.open(url, "_blank");
  }
}

// Hacer downloadApp global
window.downloadApp = downloadApp;

// ===== BÚSQUEDA =====
function setupSearch() {
  if (!searchInput) return;
  
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // Mostrar/ocultar botón de limpiar
    if (searchClear) {
      searchClear.style.display = searchTerm ? "flex" : "none";
    }
    
    if (searchTerm === "") {
      displayApps(allApps);
      return;
    }
    
    const filtered = allApps.filter(app => 
      app.nombre.toLowerCase().includes(searchTerm) ||
      (app.descripcion && app.descripcion.toLowerCase().includes(searchTerm)) ||
      app.categoria.toLowerCase().includes(searchTerm)
    );
    
    displayApps(filtered);
  });
  
  // Botón para limpiar búsqueda
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchClear.style.display = "none";
      displayApps(allApps);
      searchInput.focus();
    });
  }
}

// ===== FILTROS DE CATEGORÍA =====
function setupCategoryFilters() {
  if (!categoryButtons) return;
  
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
      
      // Limpiar búsqueda
      if (searchInput) {
        searchInput.value = "";
        if (searchClear) searchClear.style.display = "none";
      }
    });
  });
}

// ===== CONFIGURAR NAVBAR =====
function setupNavbar() {
  // Menú móvil toggle
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuToggle.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
    
    // Cerrar menú al hacer click en un enlace
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });
  }
  
  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
  // Formulario de subida
  if (uploadForm) {
    uploadForm.addEventListener("submit", uploadAPK);
  }
  
  // Formulario de contraseña
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      checkPassword(adminPassword.value);
    });
  }
  
  // Botón de admin en navbar
  if (btnAdminNav) {
    btnAdminNav.addEventListener("click", openPasswordModal);
  }
  
  // Botón de logout
  if (btnLogoutNav) {
    btnLogoutNav.addEventListener("click", () => {
      if (confirm("¿Estás seguro de cerrar sesión como administrador?")) {
        hideAdminUI();
        showNotification("👋 Sesión cerrada", "info");
      }
    });
  }
  
  // Cerrar modal
  const closeBtn = document.getElementById("closePasswordModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closePasswordModal);
  }
  
  // Cerrar modal al hacer click en el overlay
  const overlay = document.getElementById("modalOverlay");
  if (overlay) {
    overlay.addEventListener("click", closePasswordModal);
  }
  
  // Toggle mostrar/ocultar contraseña
  if (togglePasswordBtn && adminPassword) {
    togglePasswordBtn.addEventListener("click", () => {
      const type = adminPassword.type === "password" ? "text" : "password";
      adminPassword.type = type;
      
      const icon = togglePasswordBtn.querySelector("i");
      if (icon) {
        icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
      }
    });
  }
  
  // Cerrar modal con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePasswordModal();
    }
  });
  
  // Setup búsqueda y filtros
  setupSearch();
  setupCategoryFilters();
}

// ===== MOSTRAR NOTIFICACIÓN =====
function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos inline (puedes moverlos al CSS)
  Object.assign(notification.style, {
    position: "fixed",
    top: "90px",
    right: "20px",
    padding: "15px 25px",
    background: type === "success" ? "#00E676" : type === "error" ? "#FF4081" : "#00D9FF",
    color: "#0A0E27",
    borderRadius: "12px",
    fontWeight: "600",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    zIndex: "9999",
    animation: "slideInRight 0.3s ease",
    maxWidth: "300px"
  });
  
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Agregar animaciones de notificación al CSS dinámicamente
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

console.log("🚀 APK Store inicializada correctamente");