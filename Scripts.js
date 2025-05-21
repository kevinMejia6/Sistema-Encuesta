
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                secondary: {
                    50: '#f8fafc',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
            },
            boxShadow: {
                card: '0 0 25px 0 rgba(0, 0, 0, 0.05)',
                input: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            },
        },
    },
}
// Configuración de Firebase PARA TENER PERMISOS A LA CONEXION
const firebaseConfig = {
    apiKey: "AIzaSyCXHzK22QMOBusCterW4VwPj1ItF_ME7g4",
    authDomain: "prueba-vupioh.firebaseapp.com",
    projectId: "prueba-vupioh",
    storageBucket: "prueba-vupioh.firebasestorage.app",
    messagingSenderId: "1022149703484",
    appId: "1:1022149703484:web:c73ef30d04ae7afdb8d039",
    measurementId: "G-FMDC0D1S0H"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a Firestore
const db = firebase.firestore();
const evaluacionesRef = db.collection('evaluaciones');

// Variables globales para charts
let chartManejoOferta = null;
let chartPresenciaEjecutivo = null;

// Manejo del formulario
const form = document.getElementById('evaluationForm');
const presenciaEjecutivoSelect = document.getElementById('presenciaEjecutivo');
const manejoOfertaDiv = document.querySelector('#manejoOferta').parentElement;
const ofreciendoMarcaDiv = document.querySelector('#ofreciendoMarca').parentElement;
const supervisorConocedorDiv = document.getElementById('supervisorConocedorDiv');

presenciaEjecutivoSelect.addEventListener('change', function () {
    if (this.value === 'No') {
        manejoOfertaDiv.style.display = 'none';
        ofreciendoMarcaDiv.style.display = 'none';
        supervisorConocedorDiv.classList.remove('hidden');
        supervisorConocedor.value = ''; // 👈 Asigna el valor aquí


        // Quitar el atributo required
        document.getElementById('manejoOferta').removeAttribute('required');
        document.getElementById('ofreciendoMarca').removeAttribute('required');
        document.getElementById('supervisorConocedor').setAttribute('required', 'required');
    } else {
        manejoOfertaDiv.style.display = 'block';
        ofreciendoMarcaDiv.style.display = 'block';

        // Agregar nuevamente el atributo required si es necesario
        document.getElementById('manejoOferta').setAttribute('required', 'required');
        document.getElementById('ofreciendoMarca').setAttribute('required', 'required');

        supervisorConocedorDiv.classList.add('hidden');
        document.getElementById('supervisorConocedor').removeAttribute('required');
    }
});


// ========================== TOOD ESTO ES PARA EDITAR =================================== 

// Manejadores para cerrar el modal de edición
 document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('editModal').classList.add('hidden');
 });

//  FUNCION PARA CERRAR EL MODAL

 document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editModal').classList.add('hidden');
 });

// Control de visibilidad para los campos condicionales en el formulario de edición
document.getElementById('editPresenciaEjecutivo').addEventListener('change', function () {
    const editManejoOfertaDiv = document.getElementById('editManejoOfertaDiv');
    const editOfreciendoMarcaDiv = document.getElementById('editOfreciendoMarcaDiv');
    const editSupervisorConocedorDiv = document.getElementById('editSupervisorConocedorDiv');

    if (this.value === 'No') {
        // Si no hay ejecutivo, ocultar campos de manejo de oferta y marca
        editManejoOfertaDiv.style.display = 'none';
        editOfreciendoMarcaDiv.style.display = 'none';
        editSupervisorConocedorDiv.style.display = 'block';

        // Quitar required y asignar valor vacío
        document.getElementById('editManejoOferta').removeAttribute('required');
        document.getElementById('editOfreciendoMarca').removeAttribute('required');
        document.getElementById('editSupervisorConocedor').setAttribute('required', 'required');
    } else {
        // Si hay ejecutivo, mostrar campos de manejo de oferta y marca
        editManejoOfertaDiv.style.display = 'block';
        editOfreciendoMarcaDiv.style.display = 'block';
        editSupervisorConocedorDiv.style.display = 'none';

        // Restaurar required
        document.getElementById('editManejoOferta').setAttribute('required', 'required');
        document.getElementById('editOfreciendoMarca').setAttribute('required', 'required');
        document.getElementById('editSupervisorConocedor').removeAttribute('required');
    }
});


// TRBAJANDO EN ESTE EDITAR 

// Función al hacer clic en "Editar": Abre modal y carga datos
function abrirModalEdicion(id) {
    evaluacionesRef.doc(id).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            // Llenar campos del formulario
            document.getElementById('editNombre').value = data.nombre;
            document.getElementById('editFecha').value = data.fecha;
            document.getElementById('editSucursal').value = data.sucursal;
            document.getElementById('editCanal').value = data.canal;
            document.getElementById('editManejoOferta').value = data.manejoOferta;
            document.getElementById('editPresenciaEjecutivo').value = data.presenciaEjecutivo;
            document.getElementById('editOfreciendoMarca').value = data.ofreciendoMarca;
            document.getElementById('editSupervisorConocedor').value = data.supervisorConocedor || '';
            document.getElementById('editAuditor').value = data.auditor;
            document.getElementById('editObservaciones').value = data.observaciones;

            // Actualizar campos condicionales
            const event = new Event('change');
            document.getElementById('editPresenciaEjecutivo').dispatchEvent(event);

            // Mostrar el modal
            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editRecordId').value = id;
        } else {
            showToast('Registro no encontrado', 'error');
        }
    }).catch(error => {
        console.error("Error al obtener el documento: ", error);
        showToast('Error al cargar los datos', 'error');
    });
}

// Esta funcion guarda los cambios editados
function handleEditSubmit(event) {
    event.preventDefault();
    const recordId = document.getElementById('editRecordId').value;
    const form = event.target;

    const data = {
        nombre: form.editNombre.value.trim(),
        fecha: form.editFecha.value,
        sucursal: form.editSucursal.value,
        canal: form.editCanal.value,
        manejoOferta: form.editManejoOferta.value,
        presenciaEjecutivo: form.editPresenciaEjecutivo.value,
        ofreciendoMarca: form.editOfreciendoMarca.value,
        supervisorConocedor: form.editSupervisorConocedor.value || '',
        auditor: form.editAuditor.value,
        observaciones: form.editObservaciones.value.trim(),
        updatedAt: firebase.firestore.Timestamp.now()
    };

    evaluacionesRef.doc(recordId).update(data)
        .then(() => {
            showToast('¡Actualizado!', 'success');
            document.getElementById('editModal').classList.add('hidden');
            cargarYMostrarDatos();
        })
        .catch(error => {
            showToast('Error: ' + error.message, 'error');
        });
}

//Funcion PARA GUARDAR DATOS EN BASE
form.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
        nombre: form.nombre.value.trim(),
        fecha: form.fecha.value,
        sucursal: form.sucursal.value,
        canal: form.canal.value,
        manejoOferta: form.manejoOferta.value,
        presenciaEjecutivo: form.presenciaEjecutivo.value,
        ofreciendoMarca: form.ofreciendoMarca.value,
        supervisorConocedor: form.supervisorConocedor.value || '',
        auditor: form.auditor.value,
        observaciones: form.observaciones.value.trim(),
        createdAt: firebase.firestore.Timestamp.now()
    };

  
        // Guardar un nuevo registro
        evaluacionesRef.add(data)
            .then(() => {
                showToast('Evaluación guardada exitosamente!', 'success');
                form.reset();
                cargarYMostrarDatos();
            })
            .catch(error => {
                console.error("Error al guardar la evaluación: ", error);
                showToast('Error al guardar la evaluación. Inténtalo de nuevo.', 'error');
            });
    
});


// Función para cargar datos desde Firebase con filtros
function cargarYMostrarDatos() {
    const fechaDesde = document.getElementById('filterFechaDesde').value;
    const fechaHasta = document.getElementById('filterFechaHasta').value;
    const sucursalFiltro = document.getElementById('filterSucursal').value;
    const canalFiltro = document.getElementById('filterCanal').value;
    const nombreFiltro = document.getElementById('filterNombre').value.trim().toLowerCase();

    // Construir la consulta base
    let query = evaluacionesRef;

    // Aplicar filtros de fecha
    if (fechaDesde && fechaHasta) {
        query = query.where('fecha', '>=', fechaDesde).where('fecha', '<=', fechaHasta);
    } else if (fechaDesde) {
        query = query.where('fecha', '>=', fechaDesde);
    } else if (fechaHasta) {
        query = query.where('fecha', '<=', fechaHasta);
    }

    // Aplicar filtro de sucursal
    if (sucursalFiltro !== 'all') {
        query = query.where('sucursal', '==', sucursalFiltro);
    }

    // Aplicar filtro de canal
    if (canalFiltro !== 'all') {
        query = query.where('canal', '==', canalFiltro);
    }

    // Ejecutar la consulta
    query.get()
        .then(snapshot => {
            let docs = [];
            snapshot.forEach(doc => {
                // Agregar los datos del documento con su ID
                docs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Aplicar filtro de nombre (debe hacerse en memoria porque Firestore no soporta búsqueda parcial)
            if (nombreFiltro.length > 0) {
                docs = docs.filter(d => d.nombre.toLowerCase().includes(nombreFiltro));
            }

            mostrarGraficas(docs);
            mostrarTabla(docs);
        })
        .catch(error => {
            console.error("Error al obtener las evaluaciones:", error);
            showToast('Error al cargar los datos. Inténtalo de nuevo.', 'error');
        });
}

// Mostrar gráfica con Chart.js
function mostrarGraficas(docs) {
    const manejoOptions = ['Excelente', 'Bueno', 'Regular', 'Malo', 'No respondió'];
    const manejoCounts = manejoOptions.map(opt => docs.filter(d => d.manejoOferta === opt).length);

    const presenciaOptions = ['Sí', 'No'];
    const presenciaCounts = presenciaOptions.map(opt => docs.filter(d => d.presenciaEjecutivo === opt).length);

    // Gráfico Manejo Oferta Comercial
    const ctxManejo = document.getElementById('chartManejoOferta').getContext('2d');
    if (chartManejoOferta) chartManejoOferta.destroy();
    chartManejoOferta = new Chart(ctxManejo, {
        type: 'doughnut',
        data: {
            labels: manejoOptions,
            datasets: [{
                label: 'Manejo de Oferta Comercial',
                data: manejoCounts,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.85)', // Excelente - verde
                    'rgba(59, 130, 246, 0.85)', // Bueno - azul
                    'rgba(250, 204, 21, 0.85)', // Regular - amarillo
                    'rgba(239, 68, 68, 0.85)',  // Malo - rojo
                    'rgba(156, 163, 175, 0.85)' // No respondió - gris
                ],
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 2,
                hoverOffset: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 14, weight: '600' },
                        color: '#334155'
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: context => `${context.label}: ${context.parsed} (${((context.parsed / docs.length) * 100).toFixed(1)}%)`
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });

    // Gráfico Presencia Ejecutivo
    const ctxPresencia = document.getElementById('chartPresenciaEjecutivo').getContext('2d');
    if (chartPresenciaEjecutivo) chartPresenciaEjecutivo.destroy();
    chartPresenciaEjecutivo = new Chart(ctxPresencia, {
        type: 'bar',
        data: {
            labels: presenciaOptions,
            datasets: [{
                label: 'Presencia del Ejecutivo',
                data: presenciaCounts,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.85)', // Sí verde
                    'rgba(239, 68, 68, 0.85)'   // No rojo
                ],
                borderColor: [
                    'rgba(5, 150, 105, 1)',
                    'rgba(220, 38, 38, 1)'
                ],
                borderWidth: 2,
                borderRadius: 6,
                maxBarThickness: 60
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 13, weight: '600' } },
                    grid: { display: false }
                },
                y: {
                    ticks: { font: { size: 14, weight: '700' } },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.parsed.x} (${((ctx.parsed.x / docs.length) * 100).toFixed(1)}%)`
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}


// ================================= FUNCION PARA MOSTARLO LOS DATOS EN LA TABLA ===============
function mostrarTabla(docs) {
    const tbody = document.querySelector('#tablaEvaluaciones tbody');
    tbody.innerHTML = '';
    if (docs.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 10; // Ajustado para incluir todas las columnas
        td.classList.add('px-6', 'py-4', 'text-center', 'text-sm', 'text-gray-500');
        td.textContent = 'No hay registros que mostrar.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    docs.forEach(d => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-50');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.nombre)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.fecha)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.sucursal)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.canal)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.manejoOferta)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.presenciaEjecutivo)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.ofreciendoMarca)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.supervisorConocedor)}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${escapeHtml(d.observaciones)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.auditor)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
            <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="abrirModalEdicion('${d.id}')">Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}



// Escape HTML para evitar XSS en la tabla
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

// ESTO ES PARA LOS FILTROS
document.getElementById('btnFiltrar').addEventListener('click', e => {
    e.preventDefault();
    cargarYMostrarDatos();
});

// ESTO ES PARA LIMPIAR LOS FILTROS


document.getElementById('btnLimpiar').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('filterFechaDesde').value = '';
    document.getElementById('filterFechaHasta').value = '';
    document.getElementById('filterSucursal').value = 'all';
    document.getElementById('filterCanal').value = 'all';
    document.getElementById('filterNombre').value = '';
    cargarYMostrarDatos();
});

// ESTO ES PARA MOSTRAR LOS MENSAJES
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `p-4 mb-4 text-sm text-white rounded-lg shadow-md ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.innerText = message;

    // Agregar el toast al contenedor
    document.getElementById('toastContainer').appendChild(toast);

    // Eliminar el toast después de 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Inicializar fecha actual en formulario y cargar datos
window.onload = () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = today;
    cargarYMostrarDatos();
};
