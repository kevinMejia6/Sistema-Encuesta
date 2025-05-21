import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

const evaluacionesRef = collection(db, 'evaluaciones');

if (evaluacionesRef) {
    console.log('Colección de evaluaciones conectada correctamente');
} else {
    console.log('Error al conectar con la colección');
}

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
        document.getElementById('supervisorConocedor').value = '';

        // Quitar el atributo required
        document.getElementById('manejoOferta').removeAttribute('required');
        document.getElementById('ofreciendoMarca').removeAttribute('required');
        document.getElementById('supervisorConocedor').setAttribute('required', 'required');
    } else {
        manejoOfertaDiv.style.display = 'block';
        ofreciendoMarcaDiv.style.display = 'block';

        // Agregar nuevamente el atributo required
        document.getElementById('manejoOferta').setAttribute('required', 'required');
        document.getElementById('ofreciendoMarca').setAttribute('required', 'required');

        supervisorConocedorDiv.classList.add('hidden');
        document.getElementById('supervisorConocedor').removeAttribute('required');
    }
});

// ========================== FUNCIONES PARA EDITAR ===========================

// Manejadores para cerrar el modal de edición
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('editModal').classList.add('hidden');
});

// Función para cerrar el modal
document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.getElementById('editModal').classList.add('hidden');
});

// Control de visibilidad para campos condicionales en formulario de edición
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

// Función para abrir modal de edición y cargar datos
window.abrirModalEdicion = async function (id) {
    try {
        const docRef = doc(db, 'evaluaciones', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Llenar campos del formulario
            document.getElementById('editNombre').value = data.nombre;
            document.getElementById('editFecha').value = data.fecha;
            document.getElementById('editSucursal').value = data.sucursal;
            document.getElementById('editCanal').value = data.canal;
            document.getElementById('editPresenciaEjecutivo').value = data.presenciaEjecutivo;
            document.getElementById('editManejoOferta').value = data.manejoOferta || '';
            document.getElementById('editOfreciendoMarca').value = data.ofreciendoMarca || '';
            document.getElementById('editSupervisorConocedor').value = data.supervisorConocedor || '';
            document.getElementById('editAuditor').value = data.auditor;
            document.getElementById('editObservaciones').value = data.observaciones || '';

            // Actualizar campos condicionales
            document.getElementById('editPresenciaEjecutivo').dispatchEvent(new Event('change'));

            // Mostrar el modal
            document.getElementById('editModal').classList.remove('hidden');
            document.getElementById('editRecordId').value = id;
        } else {
            showToast('Registro no encontrado', 'error');
        }
    } catch (error) {
        console.error("Error al obtener el documento: ", error);
        showToast('Error al cargar los datos', 'error');
    }
};

// Función para guardar cambios editados
window.handleEditSubmit = async function (event) {
    event.preventDefault();
    const recordId = document.getElementById('editRecordId').value;
    const form = event.target;

    try {
        const docRef = doc(db, 'evaluaciones', recordId);

        const data = {
            nombre: form.editNombre.value.trim(),
            fecha: form.editFecha.value,
            sucursal: form.editSucursal.value,
            canal: form.editCanal.value,
            presenciaEjecutivo: form.editPresenciaEjecutivo.value,
            auditor: form.editAuditor.value,
            observaciones: form.editObservaciones.value.trim(),
            updatedAt: serverTimestamp()
        };

        // Añadir campos condicionales según la presencia del ejecutivo
        if (form.editPresenciaEjecutivo.value === 'Sí') {
            data.manejoOferta = form.editManejoOferta.value;
            data.ofreciendoMarca = form.editOfreciendoMarca.value;
            data.supervisorConocedor = '';
        } else {
            data.manejoOferta = '';
            data.ofreciendoMarca = '';
            data.supervisorConocedor = form.editSupervisorConocedor.value;
        }

        await updateDoc(docRef, data);
        showToast('¡Registro actualizado correctamente!', 'success');
        document.getElementById('editModal').classList.add('hidden');
        cargarYMostrarDatos();
    } catch (error) {
        console.error("Error al actualizar: ", error);
        showToast('Error: ' + error.message, 'error');
    }
};

// Función para guardar datos en la base
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: form.nombre.value.trim(),
        fecha: form.fecha.value,
        sucursal: form.sucursal.value,
        canal: form.canal.value,
        presenciaEjecutivo: form.presenciaEjecutivo.value,
        auditor: form.auditor.value,
        observaciones: form.observaciones.value.trim(),
        createdAt: serverTimestamp()
    };

    // Añadir campos condicionales según la presencia del ejecutivo
    if (form.presenciaEjecutivo.value === 'Sí') {
        data.manejoOferta = form.manejoOferta.value;
        data.ofreciendoMarca = form.ofreciendoMarca.value;
        data.supervisorConocedor = '';
    } else {
        data.manejoOferta = '';
        data.ofreciendoMarca = '';
        data.supervisorConocedor = form.supervisorConocedor.value;
    }

    try {
        await addDoc(evaluacionesRef, data);
        showToast('Evaluación guardada exitosamente!', 'success');
        form.reset();
        // Establecer la fecha actual después de resetear el formulario
        document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
        cargarYMostrarDatos();
    } catch (error) {
        console.error("Error al guardar la evaluación: ", error);
        showToast('Error al guardar la evaluación. Inténtalo de nuevo.', 'error');
    }
});

// Función para cargar datos desde Firebase con filtros
async function cargarYMostrarDatos() {
    const fechaDesde = document.getElementById('filterFechaDesde').value;
    const fechaHasta = document.getElementById('filterFechaHasta').value;
    const sucursalFiltro = document.getElementById('filterSucursal').value;
    const canalFiltro = document.getElementById('filterCanal').value;
    const nombreFiltro = document.getElementById('filterNombre').value.trim().toLowerCase();

    try {
        // Construir la consulta base
        let q = collection(db, 'evaluaciones');
        let constraints = [];

        // Crear un array de condiciones para la consulta
        if (sucursalFiltro !== 'all') {
            constraints.push(where('sucursal', '==', sucursalFiltro));
        }

        if (canalFiltro !== 'all') {
            constraints.push(where('canal', '==', canalFiltro));
        }

        // Firebase no permite múltiples condiciones sobre diferentes campos
        // así que hacemos una consulta simple y filtramos los demás en memoria
        if (constraints.length > 0) {
            // Usamos solo la primera restricción para la consulta
            q = query(q, constraints[0]);
        }

        const querySnapshot = await getDocs(q);
        let docs = [];

        querySnapshot.forEach((doc) => {
            // Añadir documento a la lista si cumple con todas las restricciones
            const data = doc.data();
            let incluir = true;

            // Comprobar restricciones de fecha
            if (fechaDesde && data.fecha < fechaDesde) incluir = false;
            if (fechaHasta && data.fecha > fechaHasta) incluir = false;

            // Comprobar las restricciones adicionales que no pudimos aplicar en la consulta
            if (constraints.length > 1) {
                // Omitimos la primera restricción porque ya la usamos en la consulta
                for (let i = 1; i < constraints.length; i++) {
                    const constraint = constraints[i];
                    if (constraint.type === 'where') {
                        if (data[constraint.field] !== constraint.value) {
                            incluir = false;
                            break;
                        }
                    }
                }
            }

            // Comprobar filtro por nombre
            if (nombreFiltro && !data.nombre.toLowerCase().includes(nombreFiltro)) {
                incluir = false;
            }

            if (incluir) {
                docs.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        mostrarGraficas(docs);
        mostrarTabla(docs);
    } catch (error) {
        console.error("Error al obtener las evaluaciones:", error);
        showToast('Error al cargar los datos. Inténtalo de nuevo.', 'error');
    }
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

// Función para mostrar datos en la tabla
// Agregar variables globales para la paginación
let currentPage = 1;
let rowsPerPage = 10;
let totalPages = 1;
let currentData = [];

// Modificar la función mostrarTabla para incluir paginación
function mostrarTabla(docs) {
    // Guardar los datos para uso en la paginación
    currentData = docs;

    // Calcular el número total de páginas
    totalPages = Math.ceil(docs.length / rowsPerPage);

    // Asegurarse que la página actual es válida
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }

    const tbody = document.querySelector('#tablaEvaluaciones tbody');
    tbody.innerHTML = '';

    // Si no hay registros
    if (docs.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 11;
        td.classList.add('px-6', 'py-4', 'text-center', 'text-sm', 'text-gray-500');
        td.textContent = 'No hay registros que mostrar.';
        tr.appendChild(td);
        tbody.appendChild(tr);

        // Ocultar paginador
        document.getElementById('tablePagination').classList.add('hidden');
        return;
    }

    // Calcular índices para la página actual
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, docs.length);

    // Mostrar solo los registros de la página actual
    for (let i = startIndex; i < endIndex; i++) {
        const d = docs[i];
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-50');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.nombre)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.fecha)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.sucursal)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.canal)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.manejoOferta || '')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.presenciaEjecutivo)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.ofreciendoMarca || '')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.supervisorConocedor || '')}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${escapeHtml(d.observaciones || '')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHtml(d.auditor)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="abrirModalEdicion('${d.id}')">Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    // Mostrar y actualizar paginador
    actualizarPaginador();
}

// Función para actualizar la interfaz del paginador
function actualizarPaginador() {
    const paginationContainer = document.getElementById('tablePagination');
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');

    // Mostrar paginador
    paginationContainer.classList.remove('hidden');

    // Actualizar información de paginación
    paginationInfo.textContent = `Mostrando ${currentData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, currentData.length)} de ${currentData.length} registros`;

    // Actualizar controles de paginación
    paginationControls.innerHTML = '';

    // Botón Anterior
    const prevButton = document.createElement('button');
    prevButton.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
    </svg>`;
    prevButton.className = `px-2 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:bg-primary-50'}`;
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            mostrarTabla(currentData);
        }
    };
    paginationControls.appendChild(prevButton);

    // Generar botones de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Primera página siempre visible
    if (startPage > 1) {
        const firstButton = createPageButton(1);
        paginationControls.appendChild(firstButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'px-3 py-1 text-gray-500';
            paginationControls.appendChild(ellipsis);
        }
    }

    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i);
        paginationControls.appendChild(pageButton);
    }

    // Última página siempre visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'px-3 py-1 text-gray-500';
            paginationControls.appendChild(ellipsis);
        }

        const lastButton = createPageButton(totalPages);
        paginationControls.appendChild(lastButton);
    }

    // Botón Siguiente
    const nextButton = document.createElement('button');
    nextButton.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
    </svg>`;
    nextButton.className = `px-2 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:bg-primary-50'}`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            mostrarTabla(currentData);
        }
    };
    paginationControls.appendChild(nextButton);

    // Control de filas por página
    actualizarSelectorRegistrosPorPagina();
}

// Función para crear botones de página numerados
function createPageButton(pageNum) {
    const button = document.createElement('button');
    button.textContent = pageNum;
    button.className = pageNum === currentPage
        ? 'px-3 py-1 rounded-md bg-primary-600 text-white'
        : 'px-3 py-1 rounded-md text-primary-600 hover:bg-primary-50';
    button.onclick = () => {
        currentPage = pageNum;
        mostrarTabla(currentData);
    };
    return button;
}

// Función para actualizar el selector de registros por página
function actualizarSelectorRegistrosPorPagina() {
    const selector = document.getElementById('rowsPerPageSelector');
    if (selector) {
        selector.value = rowsPerPage;
    }
}

// Cambiar número de registros por página
function cambiarRegistrosPorPagina(newValue) {
    rowsPerPage = parseInt(newValue);
    currentPage = 1; // Reiniciar a la primera página
    mostrarTabla(currentData);
}

// Añadir el control de registros por página y el cambio de página a las funciones globales
window.cambiarRegistrosPorPagina = cambiarRegistrosPorPagina;
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

// Manejo de filtros
document.getElementById('btnFiltrar').addEventListener('click', e => {
    e.preventDefault();
    cargarYMostrarDatos();
});

// Limpieza de filtros
document.getElementById('btnLimpiar').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('filterFechaDesde').value = '';
    document.getElementById('filterFechaHasta').value = '';
    document.getElementById('filterSucursal').value = 'all';
    document.getElementById('filterCanal').value = 'all';
    document.getElementById('filterNombre').value = '';
    cargarYMostrarDatos();
});

// Mostrar mensajes toast
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
