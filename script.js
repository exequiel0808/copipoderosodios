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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ===== VARIABLES GLOBALES =====
let allApps = [];
let currentCategory = 'todas';

// ===== CARGAR APLICACIONES DESDE FIREBASE =====
async function loadApps() {
  try {
    const appsQuery = query(collection(db, "apks"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(appsQuery);
    
    allApps = [];
    querySnapshot.forEach((doc) => {
      allApps.push({ id: doc.id, ...doc.data() });
    });
    
    displayApps(allApps);
    updateStats();
  } catch (error) {
    console.error("Error cargando apps:", error);
    document.getElementById('appsGrid').innerHTML = `
      <div class="loading">
        <i class="fas fa-exclamation-circle"></i>
        <p>Error al cargar las aplicaciones. Por favor, recarga la página.</p>
      </div>
    `;
  }
}

// ===== MOSTRAR APLICACIONES EN LA GRID =====
function displayApps(apps) {
  const appsGrid = document.getElementById('appsGrid');
  
  if (apps.length === 0) {
    appsGrid.innerHTML = `
      <div class="loading">
        <i class="fas fa-inbox"></i>
        <p>No hay aplicaciones disponibles en esta categoría</p>
      </div>
    `;
    return;
  }
  
  appsGrid.innerHTML = apps.map(app => `
    <div class="app-card" onclick="showAppDetails('${app.id}')">
      <div class="app-header">
        <div class="app-icon">
          <i class="fas fa-mobile-alt"></i>
        </div>
        <div class="app-info">
          <h3>${app.nombre}</h3>
          <span class="app-version">v${app.version}</span>
        </div>
      </div>
      <span class="app-category">${getCategoryName(app.categoria)}</span>
      <p class="app-description">${app.descripcion || 'Sin descripción'}</p>
      <div class="app-footer">
        <span class="app-downloads">
          <i class="fas fa-download"></i>
          ${app.descargas || 0} descargas
        </span>
        <button class="btn-download" onclick="event.stopPropagation(); downloadApp('${app.id}', '${app.url}', '${app.nombre}')">
          <i class="fas fa-download"></i>
          Descargar
        </button>
      </div>
    </div>
  `).join('');
}

// ===== OBTENER NOMBRE DE CATEGORÍA =====
function getCategoryName(category) {
  const categories = {
    streaming: 'Streaming',
    juegos: 'Juegos',
    utilidades: 'Utilidades',
    otros: 'Otros'
  };
  return categories[category] || 'Otros';
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats() {
  const totalApps = allApps.length;
  const totalDownloads = allApps.reduce((sum, app) => sum + (app.descargas || 0), 0);
  
  document.getElementById('totalApps').textContent = totalApps;
  document.getElementById('totalDownloads').textContent = totalDownloads;
}

// ===== FILTRAR POR CATEGORÍA =====
function filterByCategory(category) {
  currentCategory = category;
  
  // Actualizar botones activos
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.category-btn').classList.add('active');
  
  // Filtrar apps
  if (category === 'todas') {
    displayApps(allApps);
  } else {
    const filtered = allApps.filter(app => app.categoria === category);
    displayApps(filtered);
  }
}

// ===== BUSCAR APLICACIONES =====
function searchApps(searchTerm) {
  const term = searchTerm.toLowerCase();
  const filtered = allApps.filter(app => 
    app.nombre.toLowerCase().includes(term) ||
    (app.descripcion && app.descripcion.toLowerCase().includes(term))
  );
  
  if (currentCategory !== 'todas') {
    const categoryFiltered = filtered.filter(app => app.categoria === currentCategory);
    displayApps(categoryFiltered);
  } else {
    displayApps(filtered);
  }
}

// ===== SUBIR APK =====
async function uploadAPK(event) {
  event.preventDefault();
  
  const appName = document.getElementById('appName').value;
  const appVersion = document.getElementById('appVersion').value;
  const appCategory = document.getElementById('appCategory').value;
  const appDescription = document.getElementById('appDescription').value;
  const apkFile = document.getElementById('apkFile').files[0];
  
  if (!apkFile) {
    alert('❌ Por favor selecciona un archivo APK');
    return;
  }
  
  // Validar extensión
  if (!apkFile.name.endsWith('.apk')) {
    alert('❌ El archivo debe ser un APK');
    return;
  }
  
  // Mostrar progreso
  const progressDiv = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  progressDiv.style.display = 'block';
  
  try {
    // Subir archivo a Firebase Storage
    const fileName = `${Date.now()}_${apkFile.name}`;
    const storageRef = ref(storage, `apks/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, apkFile);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
      },
      (error) => {
        console.error('Error subiendo archivo:', error);
        alert('❌ Error al subir el archivo');
        progressDiv.style.display = 'none';
      },
      async () => {
        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Guardar información en Firestore
        await addDoc(collection(db, "apks"), {
          nombre: appName,
          version: appVersion,
          categoria: appCategory,
          descripcion: appDescription,
          url: downloadURL,
          nombreArchivo: fileName,
          tamano: apkFile.size,
          descargas: 0,
          fecha: serverTimestamp()
        });
        
        alert('✅ APK subida exitosamente!');
        
        // Resetear formulario
        document.getElementById('uploadForm').reset();
        progressDiv.style.display = 'none';
        progressFill.style.width = '0%';
        
        // Recargar lista de apps
        loadApps();
        
        // Scroll a la sección de apps
        document.getElementById('apps').scrollIntoView({ behavior: 'smooth' });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al procesar la subida');
    progressDiv.style.display = 'none';
  }
}

// ===== DESCARGAR APK =====
async function downloadApp(appId, url, appName) {
  try {
    // Incrementar contador de descargas
    const appRef = doc(db, "apks", appId);
    await updateDoc(appRef, {
      descargas: increment(1)
    });
    
    // Descargar archivo
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appName}.apk`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Actualizar UI
    loadApps();
    
    // Mostrar notificación
    showNotification(`✅ Descargando ${appName}...`);
  } catch (error) {
    console.error('Error al descargar:', error);
    showNotification('❌ Error al descargar el archivo');
  }
}

// ===== MOSTRAR DETALLES DE LA APP =====
function showAppDetails(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;
  
  const modal = document.getElementById('appModal');
  const modalBody = document.getElementById('modalBody');
  
  const fileSize = formatFileSize(app.tamano);
  const fecha = app.fecha ? new Date(app.fecha.seconds * 1000).toLocaleDateString() : 'Desconocida';
  
  modalBody.innerHTML = `
    <div style="text-align: center;">
      <div class="app-icon" style="width: 80px; height: 80px; font-size: 2.5rem; margin: 0 auto 20px;">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <h2 style="color: var(--white); margin-bottom: 10px;">${app.nombre}</h2>
      <span class="app-version" style="font-size: 1rem;">Versión ${app.version}</span>
      <span class="app-category" style="margin: 15px auto; display: inline-block;">${getCategoryName(app.categoria)}</span>
      
      <div style="margin: 30px 0; text-align: left;">
        <h4 style="color: var(--primary); margin-bottom: 10px;">
          <i class="fas fa-info-circle"></i> Descripción
        </h4>
        <p style="color: var(--text-dark); line-height: 1.6;">
          ${app.descripcion || 'Sin descripción disponible'}
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px 0;">
        <div style="background: var(--dark); padding: 15px; border-radius: 10px;">
          <i class="fas fa-download" style="color: var(--primary);"></i>
          <div style="margin-top: 5px;">
            <strong style="color: var(--white); display: block;">${app.descargas || 0}</strong>
            <small style="color: var(--text-dark);">Descargas</small>
          </div>
        </div>
        <div style="background: var(--dark); padding: 15px; border-radius: 10px;">
          <i class="fas fa-hdd" style="color: var(--primary);"></i>
          <div style="margin-top: 5px;">
            <strong style="color: var(--white); display: block;">${fileSize}</strong>
            <small style="color: var(--text-dark);">Tamaño</small>
          </div>
        </div>
      </div>
      
      <div style="background: var(--dark); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <i class="fas fa-calendar" style="color: var(--primary);"></i>
        <span style="color: var(--text-dark); margin-left: 10px;">Subida el ${fecha}</span>
      </div>
      
      <button class="btn-download" style="width: 100%; padding: 15px;" 
              onclick="downloadApp('${app.id}', '${app.url}', '${app.nombre}'); closeModal();">
        <i class="fas fa-download"></i>
        Descargar APK
      </button>
    </div>
  `;
  
  modal.style.display = 'block';
}

// ===== CERRAR MODAL =====
function closeModal() {
  document.getElementById('appModal').style.display = 'none';
}

// ===== FORMATEAR TAMAÑO DE ARCHIVO =====
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== MOSTRAR NOTIFICACIÓN =====
function showNotification(message) {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--card-bg);
    color: var(--white);
    padding: 20px 30px;
    border-radius: 10px;
    border: 2px solid var(--primary);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===== ACTUALIZAR NOMBRE DE ARCHIVO SELECCIONADO =====
document.getElementById('apkFile').addEventListener('change', function(e) {
  const fileName = e.target.files[0]?.name || 'Seleccionar archivo APK';
  const display = document.querySelector('.file-input-display span');
  display.textContent = fileName;
  
  if (e.target.files[0]) {
    display.style.color = 'var(--primary)';
  }
});

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // Cargar apps al inicio
  loadApps();
  
  // Formulario de subida
  document.getElementById('uploadForm').addEventListener('submit', uploadAPK);
  
  // Búsqueda
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchApps(e.target.value);
  });
  
  // Filtros de categoría
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterByCategory(btn.dataset.category);
    });
  });
  
  // Cerrar modal
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target.id === 'appModal') {
      closeModal();
    }
  });
});

// ===== HACER FUNCIONES GLOBALES =====
window.downloadApp = downloadApp;
window.showAppDetails = showAppDetails;
window.closeModal = closeModal;

// ===== ANIMACIONES CSS =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);
