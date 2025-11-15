document.addEventListener('DOMContentLoaded', function() {
    // Elementos comunes
    const btnResetearTodo = document.getElementById('resetear-todo');
    const excluidosLista = document.getElementById('excluidos-lista');
    const historialSection = document.getElementById('historial-section');
    const historialDiv = document.getElementById('historial');
    
    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Ruleta
    const btnGenerarRuleta = document.getElementById('generar-ruleta');
    const inputPremioRuleta = document.getElementById('premio-ruleta');
    const inputMaximoRuleta = document.getElementById('maximo-ruleta');
    const ruletaContainer = document.getElementById('ruleta-container');
    const numeroRuleta = document.getElementById('numero-ruleta');
    const resultadoRuleta = document.getElementById('resultado-ruleta');
    const premioRuletaActualDiv = document.getElementById('premio-ruleta-actual');
    const ganadorRuletaDiv = document.getElementById('ganador-ruleta');
    
    // Múltiple
    const btnGenerarMultiple = document.getElementById('generar-multiple');
    const inputPremio = document.getElementById('premio');
    const inputCantidad = document.getElementById('cantidad');
    const inputMaximo = document.getElementById('maximo');
    const resultadoMultiple = document.getElementById('resultado-multiple');
    const premioActualDiv = document.getElementById('premio-actual');
    const numerosMultipleContainer = document.getElementById('numeros-multiple');
    
    let numerosExcluidos = [];
    let historialSorteos = [];
    let ruletaActiva = false;

    // Event Listeners
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
    });
    
    btnGenerarRuleta.addEventListener('click', iniciarRuleta);
    btnGenerarMultiple.addEventListener('click', generarSorteoMultiple);
    btnResetearTodo.addEventListener('click', resetearTodo);

    // Funciones de Tabs
    function cambiarTab(tabName) {
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    // RULETA
    function iniciarRuleta() {
        const premio = inputPremioRuleta.value.trim();
        const maximo = parseInt(inputMaximoRuleta.value);
        
        if (!premio) {
            alert('Por favor, ingresa el nombre del premio a sortear');
            inputPremioRuleta.focus();
            return;
        }
        
        if (!maximo || maximo < 1) {
            alert('Por favor, ingresa un número total de participantes válido');
            return;
        }
        
        const numerosDisponibles = [];
        for (let i = 1; i <= maximo; i++) {
            if (!numerosExcluidos.includes(i)) {
                numerosDisponibles.push(i);
            }
        }
        
        if (numerosDisponibles.length === 0) {
            alert('No quedan números disponibles. Resetea el sorteo para continuar.');
            return;
        }
        
        if (ruletaActiva) return;
        ruletaActiva = true;
        
        btnGenerarRuleta.disabled = true;
        resultadoRuleta.classList.add('hidden');
        ruletaContainer.classList.remove('hidden');
        
        let contador = 0;
        const duracion = 3000; // 3 segundos
        const intervalo = 50;
        const iteraciones = duracion / intervalo;
        
        const interval = setInterval(() => {
            const numeroAleatorio = numerosDisponibles[Math.floor(Math.random() * numerosDisponibles.length)];
            numeroRuleta.textContent = numeroAleatorio;
            contador++;
            
            if (contador >= iteraciones) {
                clearInterval(interval);
                const premio = inputPremioRuleta.value.trim();
                finalizarRuleta(numerosDisponibles, premio);
            }
        }, intervalo);
    }
    
    function finalizarRuleta(numerosDisponibles, premio) {
        const ganador = numerosDisponibles[Math.floor(Math.random() * numerosDisponibles.length)];
        numeroRuleta.textContent = ganador;
        
        setTimeout(() => {
            ruletaContainer.classList.add('hidden');
            premioRuletaActualDiv.innerHTML = `<strong>Premio:</strong> ${premio}`;
            ganadorRuletaDiv.textContent = `#${ganador}`;
            resultadoRuleta.classList.remove('hidden');
            
            // Agregar a excluidos
            numerosExcluidos.push(ganador);
            numerosExcluidos.sort((a, b) => a - b);
            
            // Agregar al historial
            historialSorteos.push({
                tipo: premio,
                ganadores: [ganador],
                fecha: new Date().toLocaleTimeString('es-ES')
            });
            
            actualizarExcluidos();
            actualizarHistorial();
            
            ruletaActiva = false;
            btnGenerarRuleta.disabled = false;
            
            resultadoRuleta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1000);
    }

    // SORTEO MÚLTIPLE
    function generarSorteoMultiple() {
        const premio = inputPremio.value.trim();
        const cantidad = parseInt(inputCantidad.value);
        const maximo = parseInt(inputMaximo.value);
        
        if (!premio) {
            alert('Por favor, ingresa el nombre del premio a sortear');
            inputPremio.focus();
            return;
        }
        
        if (!cantidad || cantidad < 1) {
            alert('Por favor, ingresa un número de ganadores válido');
            return;
        }
        
        if (!maximo || maximo < 1) {
            alert('Por favor, ingresa un número total de participantes válido');
            return;
        }
        
        const numerosDisponibles = [];
        for (let i = 1; i <= maximo; i++) {
            if (!numerosExcluidos.includes(i)) {
                numerosDisponibles.push(i);
            }
        }
        
        if (cantidad > numerosDisponibles.length) {
            alert(`Solo quedan ${numerosDisponibles.length} participantes disponibles. Reduce el número de ganadores o resetea el sorteo.`);
            return;
        }
        
        // Generar ganadores
        const ganadores = [];
        const pool = [...numerosDisponibles];
        
        for (let i = 0; i < cantidad; i++) {
            const indice = Math.floor(Math.random() * pool.length);
            ganadores.push(pool[indice]);
            pool.splice(indice, 1);
        }
        
        ganadores.sort((a, b) => a - b);
        
        // Agregar a excluidos
        numerosExcluidos.push(...ganadores);
        numerosExcluidos.sort((a, b) => a - b);
        
        // Agregar al historial
        historialSorteos.push({
            tipo: premio,
            ganadores: [...ganadores],
            fecha: new Date().toLocaleTimeString('es-ES')
        });
        
        mostrarResultadosMultiple(premio, ganadores);
        actualizarExcluidos();
        actualizarHistorial();
    }
    
    function mostrarResultadosMultiple(premio, ganadores) {
        premioActualDiv.innerHTML = `<strong>Premio:</strong> ${premio}`;
        numerosMultipleContainer.innerHTML = '';
        
        ganadores.forEach((numero, index) => {
            const numeroDiv = document.createElement('div');
            numeroDiv.className = 'numero';
            
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = `Ganador ${index + 1}`;
            
            const numeroSpan = document.createElement('span');
            numeroSpan.className = 'numero-valor';
            numeroSpan.textContent = `#${numero}`;
            
            numeroDiv.appendChild(badge);
            numeroDiv.appendChild(numeroSpan);
            numeroDiv.style.animationDelay = `${index * 0.15}s`;
            numerosMultipleContainer.appendChild(numeroDiv);
        });
        
        resultadoMultiple.classList.remove('hidden');
        
        setTimeout(() => {
            resultadoMultiple.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // FUNCIONES COMUNES
    function actualizarExcluidos() {
        excluidosLista.innerHTML = '';
        
        if (numerosExcluidos.length === 0) {
            const span = document.createElement('span');
            span.className = 'sin-excluidos';
            span.textContent = 'Ningún número excluido aún';
            excluidosLista.appendChild(span);
            return;
        }
        
        numerosExcluidos.forEach(numero => {
            const span = document.createElement('span');
            span.className = 'numero-excluido';
            span.textContent = `#${numero}`;
            excluidosLista.appendChild(span);
        });
    }
    
    function actualizarHistorial() {
        if (historialSorteos.length === 0) {
            historialSection.classList.add('hidden');
            return;
        }
        
        historialSection.classList.remove('hidden');
        historialDiv.innerHTML = '';
        
        historialSorteos.forEach(sorteo => {
            const sorteoDiv = document.createElement('div');
            sorteoDiv.className = 'historial-item';
            
            const titulo = document.createElement('div');
            titulo.className = 'historial-titulo';
            titulo.innerHTML = `<strong>${sorteo.tipo}</strong> <span class="historial-hora">${sorteo.fecha}</span>`;
            
            const ganadores = document.createElement('div');
            ganadores.className = 'historial-ganadores';
            ganadores.textContent = `Ganadores: ${sorteo.ganadores.map(n => `#${n}`).join(', ')}`;
            
            sorteoDiv.appendChild(titulo);
            sorteoDiv.appendChild(ganadores);
            historialDiv.appendChild(sorteoDiv);
        });
    }
    
    function resetearTodo() {
        if (numerosExcluidos.length === 0 && historialSorteos.length === 0) {
            alert('No hay nada que resetear');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres resetear todos los sorteos? Se perderá el historial y los números excluidos.')) {
            numerosExcluidos = [];
            historialSorteos = [];
            
            resultadoRuleta.classList.add('hidden');
            resultadoMultiple.classList.add('hidden');
            ruletaContainer.classList.add('hidden');
            historialSection.classList.add('hidden');
            
            actualizarExcluidos();
            actualizarHistorial();
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});
