import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
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
let isAdminLoggedIn = false; // Variable temporal (no persiste al recargar)

// ===== ELEMENTOS DEL DOM =====
let uploadForm, passwordForm, adminPassword, togglePasswordBtn;
let appName, appVersion, appCategory, appDescription, appURL;
let image1, image2, image3;
let btnAdminNav, btnLogoutNav, navSubirAPK;
let searchInput, searchClear, categoryButtons;
let mobileMenuToggle, navLinks;

// Elementos para actualizar APKs
let tabNueva, tabActualizar;
let tabContentNueva, tabContentActualizar;
let apkSelector, updateForm, updateFormContainer;
let updateAppId, updateAppName, updateAppVersion, updateAppCategory;
let updateAppDescription, updateAppURL, updateImage1, updateImage2, updateImage3;
let btnDeleteApp;

// Elementos para confirmación de contraseña
let confirmPasswordModal, confirmPasswordForm, confirmAdminPassword;
let toggleConfirmPassword, closeConfirmPasswordBtn, confirmModalOverlay;

// Variable para guardar la acción pendiente
let pendingAction = null;

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
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
  
  // Tabs y actualización
  tabNueva = document.getElementById("tabNueva");
  tabActualizar = document.getElementById("tabActualizar");
  tabContentNueva = document.getElementById("tabContentNueva");
  tabContentActualizar = document.getElementById("tabContentActualizar");
  apkSelector = document.getElementById("apkSelector");
  updateForm = document.getElementById("updateForm");
  updateFormContainer = document.getElementById("updateFormContainer");
  btnDeleteApp = document.getElementById("btnDeleteApp");
  
  // Campos del formulario de actualización
  updateAppId = document.getElementById("updateAppId");
  updateAppName = document.getElementById("updateAppName");
  updateAppVersion = document.getElementById("updateAppVersion");
  updateAppCategory = document.getElementById("updateAppCategory");
  updateAppDescription = document.getElementById("updateAppDescription");
  updateAppURL = document.getElementById("updateAppURL");
  updateImage1 = document.getElementById("updateImage1");
  updateImage2 = document.getElementById("updateImage2");
  updateImage3 = document.getElementById("updateImage3");
  
  // Modal de confirmación
  confirmPasswordModal = document.getElementById("confirmPasswordModal");
  confirmPasswordForm = document.getElementById("confirmPasswordForm");
  confirmAdminPassword = document.getElementById("confirmAdminPassword");
  toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
  closeConfirmPasswordBtn = document.getElementById("closeConfirmPasswordModal");
  confirmModalOverlay = document.getElementById("confirmModalOverlay");
}

// ===== MOSTRAR UI DE ADMIN =====
function showAdminUI() {
  isAdminLoggedIn = true; // Variable temporal (se pierde al cerrar/recargar)
  
  // Mostrar sección de subir APK
  document.getElementById("subir").style.display = "block";
  
  // Mostrar enlace en navbar
  if (navSubirAPK) navSubirAPK.style.display = "flex";
  
  // Ocultar botón de admin, mostrar logout
  if (btnAdminNav) btnAdminNav.style.display = "none";
  if (btnLogoutNav) btnLogoutNav.style.display = "flex";
  
  console.log("✅ Admin UI activada (sesión temporal)");
}

// ===== OCULTAR UI DE ADMIN =====
function hideAdminUI() {
  isAdminLoggedIn = false;
  
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

// ===== MODAL DE CONFIRMACIÓN DE CONTRASEÑA =====
function openConfirmPasswordModal(action, title, message, icon = "fa-lock") {
  if (!confirmPasswordModal) return;
  
  // Guardar la acción pendiente
  pendingAction = action;
  
  // Personalizar el modal
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmIcon").innerHTML = `<i class="fas ${icon}"></i>`;
  
  // Mostrar modal
  confirmPasswordModal.classList.add("active");
  confirmPasswordModal.style.display = "flex";
  document.body.style.overflow = "hidden";
  
  // Enfocar input de contraseña
  if (confirmAdminPassword) {
    setTimeout(() => confirmAdminPassword.focus(), 300);
  }
}

function closeConfirmPasswordModal() {
  if (!confirmPasswordModal) return;
  
  confirmPasswordModal.classList.remove("active");
  confirmPasswordModal.style.display = "none";
  document.body.style.overflow = "auto";
  
  // Limpiar
  if (confirmPasswordForm) confirmPasswordForm.reset();
  pendingAction = null;
  
  // Ocultar error si estaba visible
  const errorEl = document.getElementById("confirmPasswordError");
  if (errorEl) errorEl.style.display = "none";
}

function verifyPasswordAndExecute(password) {
  if (password !== ADMIN_PASSWORD) {
    // Contraseña incorrecta
    const errorEl = document.getElementById("confirmPasswordError");
    if (errorEl) {
      errorEl.style.display = "flex";
      setTimeout(() => {
        errorEl.style.display = "none";
      }, 3000);
    }
    return;
  }
  
  // Contraseña correcta - ejecutar acción pendiente
  closeConfirmPasswordModal();
  
  if (pendingAction) {
    pendingAction();
    pendingAction = null;
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
    loadApkSelector(); // Cargar selector de APKs para actualizar
  } catch (error) {
    console.error("Error al cargar apps:", error);
    showNotification("❌ Error al cargar las aplicaciones", "error");
  }
}

// ===== CARGAR SELECTOR DE APKs =====
function loadApkSelector() {
  if (!apkSelector) return;
  
  // Limpiar opciones anteriores
  apkSelector.innerHTML = '<option value="">Selecciona una aplicación...</option>';
  
  // Agregar cada app como opción
  allApps.forEach(app => {
    const option = document.createElement("option");
    option.value = app.id;
    option.textContent = `${app.nombre} (v${app.version})`;
    apkSelector.appendChild(option);
  });
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats(totalApps, totalDownloads) {
  const appsEl = document.getElementById("totalApps");
  const downloadsEl = document.getElementById("totalDownloads");
  
  if (appsEl) animateCounter(appsEl, totalApps);
  if (downloadsEl) animateCounter(downloadsEl, totalDownloads);
}

// ===== ACTUALIZAR CONTADOR DE RESULTADOS =====
function updateSearchResults(count, searchTerm = "", category = "") {
  const searchResultsEl = document.getElementById("searchResults");
  if (!searchResultsEl) return;
  
  let text = "";
  
  if (searchTerm) {
    text = `Encontradas ${count} aplicación${count !== 1 ? 'es' : ''} para "${searchTerm}"`;
    searchResultsEl.classList.add("active");
  } else if (category && category !== "todas") {
    const categoryNames = {
      streaming: "Streaming",
      juegos: "Juegos",
      utilidades: "Utilidades",
      otros: "Otros"
    };
    text = `${count} aplicación${count !== 1 ? 'es' : ''} en ${categoryNames[category]}`;
    searchResultsEl.classList.add("active");
  } else {
    text = `Mostrando todas las aplicaciones (${count})`;
    searchResultsEl.classList.remove("active");
  }
  
  searchResultsEl.textContent = text;
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
function displayApps(apps, searchTerm = "", category = "") {
  const grid = document.getElementById("appsGrid");
  
  if (!grid) return;

  // Actualizar contador de resultados
  updateSearchResults(apps.length, searchTerm, category);

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
        <div class="app-buttons">
          <button class="btn-downloader-code" onclick="showDownloaderCode('${app.id}', '${app.nombre}', '${app.url}')">
            <i class="fas fa-code"></i>
            <span>Ver Código</span>
          </button>
          <button class="btn-download" onclick="downloadApp('${app.id}', '${app.url}')">
            <i class="fas fa-download"></i>
            <span>Descargar</span>
          </button>
        </div>
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

// ===== CARGAR DATOS DE APK PARA ACTUALIZAR =====
function loadApkData() {
  const selectedId = apkSelector.value;
  
  if (!selectedId) {
    updateFormContainer.style.display = "none";
    return;
  }
  
  // Buscar la app seleccionada
  const app = allApps.find(a => a.id === selectedId);
  
  if (!app) {
    showNotification("❌ No se encontró la aplicación", "error");
    return;
  }
  
  // Llenar el formulario con los datos
  updateAppId.value = app.id;
  updateAppName.value = app.nombre;
  updateAppVersion.value = app.version;
  updateAppCategory.value = app.categoria;
  updateAppDescription.value = app.descripcion || "";
  updateAppURL.value = app.url;
  updateImage1.value = app.imagen1 || "";
  updateImage2.value = app.imagen2 || "";
  updateImage3.value = app.imagen3 || "";
  
  // Mostrar el formulario
  updateFormContainer.style.display = "block";
  
  // Scroll al formulario
  updateFormContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ===== ACTUALIZAR APK (con confirmación de contraseña) =====
async function updateAPK(e) {
  e.preventDefault();
  
  const appId = updateAppId.value;
  
  if (!appId) {
    showNotification("❌ Error: ID de aplicación no encontrado", "error");
    return;
  }
  
  // Buscar nombre de la app
  const app = allApps.find(a => a.id === appId);
  const appName = app ? app.nombre : "esta aplicación";
  
  // Pedir confirmación de contraseña
  openConfirmPasswordModal(
    () => executeUpdate(), // Acción a ejecutar
    "Actualizar Aplicación", // Título
    `Confirma tu contraseña para actualizar "${appName}"`, // Mensaje
    "fa-edit" // Ícono
  );
}

// Función que ejecuta la actualización (llamada después de verificar contraseña)
async function executeUpdate() {
  const appId = updateAppId.value;
  
  const data = {
    nombre: updateAppName.value.trim(),
    version: updateAppVersion.value.trim(),
    categoria: updateAppCategory.value,
    descripcion: updateAppDescription.value.trim(),
    url: updateAppURL.value.trim(),
    imagen1: updateImage1.value.trim() || "",
    imagen2: updateImage2.value.trim() || "",
    imagen3: updateImage3.value.trim() || ""
  };
  
  try {
    const ref = doc(db, "apks", appId);
    await updateDoc(ref, data);
    
    showNotification("✅ Aplicación actualizada correctamente", "success");
    updateForm.reset();
    updateFormContainer.style.display = "none";
    apkSelector.value = "";
    loadApps();
    
    // Scroll a la sección de apps
    document.getElementById("apps").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error al actualizar app:", error);
    showNotification("❌ Error al actualizar la aplicación", "error");
  }
}

// ===== ELIMINAR APK (con confirmación de contraseña) =====
async function deleteAPK() {
  const appId = updateAppId.value;
  
  if (!appId) {
    showNotification("❌ Error: ID de aplicación no encontrado", "error");
    return;
  }
  
  // Buscar el nombre de la app
  const app = allApps.find(a => a.id === appId);
  const appName = app ? app.nombre : "esta aplicación";
  
  // Pedir confirmación de contraseña
  openConfirmPasswordModal(
    () => executeDelete(appId, appName), // Acción a ejecutar
    "Eliminar Aplicación", // Título
    `Confirma tu contraseña para eliminar "${appName}"`, // Mensaje
    "fa-trash" // Ícono
  );
}

// Función que ejecuta la eliminación (llamada después de verificar contraseña)
async function executeDelete(appId, appName) {
  // Pedir confirmación final
  if (!confirm(`¿Estás SEGURO de eliminar "${appName}"? Esta acción NO se puede deshacer.`)) {
    return;
  }
  
  try {
    const ref = doc(db, "apks", appId);
    await deleteDoc(ref);
    
    showNotification("✅ Aplicación eliminada correctamente", "success");
    updateForm.reset();
    updateFormContainer.style.display = "none";
    apkSelector.value = "";
    loadApps();
    
    // Scroll a la sección de apps
    document.getElementById("apps").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error al eliminar app:", error);
    showNotification("❌ Error al eliminar la aplicación", "error");
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

// ===== MODAL DE CÓDIGO DOWNLOADER =====
function showDownloaderCode(id, nombre, url) {
  const modal = document.getElementById("downloaderModal");
  const appNameEl = document.getElementById("downloaderAppName");
  const codeDisplayEl = document.getElementById("downloaderCodeDisplay");
  
  if (!modal || !appNameEl || !codeDisplayEl) return;
  
  // Establecer nombre de la app
  appNameEl.textContent = nombre;
  
  // Establecer código (URL)
  codeDisplayEl.textContent = url;
  
  // Mostrar modal
  modal.classList.add("active");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeDownloaderModal() {
  const modal = document.getElementById("downloaderModal");
  if (!modal) return;
  
  modal.classList.remove("active");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  
  // Resetear botón de copiar
  const btnCopy = document.getElementById("btnCopyCode");
  if (btnCopy) {
    btnCopy.classList.remove("copied");
    btnCopy.innerHTML = '<i class="fas fa-copy"></i><span>Copiar Código</span>';
  }
}

async function copyDownloaderCode() {
  const codeDisplayEl = document.getElementById("downloaderCodeDisplay");
  const btnCopy = document.getElementById("btnCopyCode");
  
  if (!codeDisplayEl || !btnCopy) return;
  
  const code = codeDisplayEl.textContent;
  
  try {
    // Copiar al portapapeles
    await navigator.clipboard.writeText(code);
    
    // Cambiar apariencia del botón
    btnCopy.classList.add("copied");
    btnCopy.innerHTML = '<i class="fas fa-check"></i><span>¡Copiado!</span>';
    
    showNotification("✅ Código copiado al portapapeles", "success");
    
    // Restaurar botón después de 3 segundos
    setTimeout(() => {
      btnCopy.classList.remove("copied");
      btnCopy.innerHTML = '<i class="fas fa-copy"></i><span>Copiar Código</span>';
    }, 3000);
  } catch (error) {
    console.error("Error al copiar:", error);
    showNotification("❌ Error al copiar código", "error");
  }
}

// Hacer funciones globales
window.showDownloaderCode = showDownloaderCode;

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
    
    displayApps(filtered, searchTerm);
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
        displayApps(filtered, "", category);
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
  
  // === MODAL DE CONFIRMACIÓN DE CONTRASEÑA ===
  
  // Formulario de confirmación
  if (confirmPasswordForm) {
    confirmPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      verifyPasswordAndExecute(confirmAdminPassword.value);
    });
  }
  
  // Cerrar modal de confirmación
  if (closeConfirmPasswordBtn) {
    closeConfirmPasswordBtn.addEventListener("click", closeConfirmPasswordModal);
  }
  
  // Cerrar al hacer click en overlay
  if (confirmModalOverlay) {
    confirmModalOverlay.addEventListener("click", closeConfirmPasswordModal);
  }
  
  // Toggle mostrar/ocultar contraseña del modal de confirmación
  if (toggleConfirmPassword && confirmAdminPassword) {
    toggleConfirmPassword.addEventListener("click", () => {
      const type = confirmAdminPassword.type === "password" ? "text" : "password";
      confirmAdminPassword.type = type;
      
      const icon = toggleConfirmPassword.querySelector("i");
      if (icon) {
        icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
      }
    });
  }
  
  // Tabs de subir/actualizar
  if (tabNueva && tabActualizar && tabContentNueva && tabContentActualizar) {
    tabNueva.addEventListener("click", () => {
      tabNueva.classList.add("active");
      tabActualizar.classList.remove("active");
      tabContentNueva.classList.add("active");
      tabContentActualizar.classList.remove("active");
    });
    
    tabActualizar.addEventListener("click", () => {
      tabActualizar.classList.add("active");
      tabNueva.classList.remove("active");
      tabContentActualizar.classList.add("active");
      tabContentNueva.classList.remove("active");
    });
  }
  
  // Selector de APK para actualizar
  if (apkSelector) {
    apkSelector.addEventListener("change", loadApkData);
  }
  
  // Formulario de actualización
  if (updateForm) {
    updateForm.addEventListener("submit", updateAPK);
  }
  
  // Botón de eliminar
  if (btnDeleteApp) {
    btnDeleteApp.addEventListener("click", deleteAPK);
  }
  
  // === MODAL DE DOWNLOADER ===
  
  // Botón de copiar código
  const btnCopyCode = document.getElementById("btnCopyCode");
  if (btnCopyCode) {
    btnCopyCode.addEventListener("click", copyDownloaderCode);
  }
  
  // Cerrar modal de Downloader
  const closeDownloaderBtn = document.getElementById("closeDownloaderModal");
  if (closeDownloaderBtn) {
    closeDownloaderBtn.addEventListener("click", closeDownloaderModal);
  }
  
  // Cerrar al hacer click en overlay
  const downloaderOverlay = document.getElementById("downloaderModalOverlay");
  if (downloaderOverlay) {
    downloaderOverlay.addEventListener("click", closeDownloaderModal);
  }
  
  // Cerrar con Escape (actualizar el listener existente)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePasswordModal();
      closeConfirmPasswordModal();
      closeDownloaderModal();
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
