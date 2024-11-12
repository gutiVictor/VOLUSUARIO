document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if ((username === 'admin' && password === '123') 
        || (username === 'usuario' && password === 'fenix')
        || (username === 'laura' && password === 'fenix')
        || (username === 'zora' && password === 'fenix')) {
        window.location.href = 'ini.html';
      } else {

        window.location.href = 'https://btoys.co/?gad_source=1&gclid=Cj0KCQiAire5BhCNARIsAM53K1ipYAmP0vU6F-iWy2d41IwxteGp30wQ73l97GnyQrnF8slIk5I7ZHIaAmzSEALw_wcB';
        /* document.getElementById('error-message').style.display = 'block'; */
      }
    });
  }
});

// Cargar productos del archivo JSON
let productos = [];

// Función para exportar a Excel
function exportarExcel() {
  const tablaResultados = document.getElementById("resultados");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(tablaResultados);
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");

  const volumenTotal = document.getElementById("volumen-total").innerText;
  const pesoTotal = document.getElementById("peso-total").innerText;
  const volumenTotalBolsa = document.getElementById("volumen-total-bolsa").innerText;
  const volumenTotalCajas = document.getElementById("volumen-total-cajas").innerText;
  const volumenConsolidadoCajasBolsas = document.getElementById("volumen-consolidado-cajas-bolsas").innerText;

  const range = XLSX.utils.decode_range(ws["!ref"]);
  const rowStart = range.e.r + 2;

  XLSX.utils.sheet_add_aoa(
    ws,
    [
      ["Resultados Totales:"],
      ["Peso Total (kg):", pesoTotal],
      ["Volumen Total Bolsa (m³):", volumenTotalBolsa],
      ["Volumen Total Cajas (m³):", volumenTotalCajas],
      ["Consolidado de Volumen cajas + bolsas (m³):", volumenConsolidadoCajasBolsas],
    ],
    { origin: "A" + rowStart }
  );

  XLSX.writeFile(wb, "resultados_fenix.xlsx");
}

// Función para recargar la página
function reiniciar() {
  location.reload();
}

fetch("productos.json")
  .then((response) => response.json())
  .then((data) => (productos = data))
  .catch((error) => console.error("Error cargando productos:", error));

// Función para procesar los datos ingresados
function procesarDatos() {
  const pedidoTexto = document.getElementById("pedido").value;
  const lineas = pedidoTexto.split("\n");
  const resultadosIndividuales = document.getElementById("resultado-individuales");
  const resultadoCamiones = document.getElementById("resultado-camiones");
  const volumenTotalElem = document.getElementById("volumen-total");
  const pesoTotalElem = document.getElementById("peso-total");
  const volumenCanastillaElem = document.getElementById("volumen-total-canastilla");
  const diferenciaVolumenElem = document.getElementById("diferencia-volumen");

  resultadosIndividuales.innerHTML = "";
  resultadoCamiones.innerHTML = "";
  volumenTotalElem.textContent = "";
  pesoTotalElem.textContent = "";
  volumenCanastillaElem.textContent = "";
  diferenciaVolumenElem.textContent = "";

  let volumenTotal = 0;
  let pesoTotal = 0;
  let totalCanastilla = 0;
  let volumenTotalBolsa = 0;
  let volumenTotalCajas = 0;

  const VOLUMEN_CANASTA = 2.89;

  lineas.forEach((linea) => {
    const datos = linea.includes("\t") ? linea.split("\t") : linea.split(/[\s,]+/);

    if (datos.length >= 2) {
      const codigo = datos[0].trim().toUpperCase();
      const cantidadStr = datos[1].trim();
      const cantidad = parseInt(cantidadStr);
      const producto = productos.find((p) => p.codigo.trim() === codigo.trim());

      if (producto) {
        const largo_m = producto.largo_m || 0;
        const alto_m = producto.alto_m || 0;
        const ancho_m = producto.ancho_m || 0;
        const volumenUnidad = largo_m * alto_m * ancho_m;
        const pesoUnidadGramos = producto.peso_unidad_empaque || 0;
        const volumenTotalProducto = volumenUnidad * cantidad;
        const pesoTotalProducto = pesoUnidadGramos * cantidad;

        const volumenConsolidadoCajasBolsas = volumenTotalBolsa + volumenTotalCajas;

        volumenTotal += volumenTotalProducto;
        pesoTotal += pesoTotalProducto;

        const volumenCanastillaUnidad = VOLUMEN_CANASTA / producto.empaque_canasta;
        const volumenTotalCanastilla = volumenCanastillaUnidad * cantidad;

        const cubicajeBolsa = producto.tipo === "Bolsa" ? parseFloat(volumenTotalCanastilla.toFixed(6)) : 0;
        const cubicajeCaja = producto.tipo === "Caja" ? parseFloat(volumenTotalProducto.toFixed(6)) : 0;

        volumenTotalBolsa += cubicajeBolsa;
        volumenTotalCajas += cubicajeCaja;
        totalCanastilla += volumenTotalCanastilla;

        const cubicajeTotal = (parseFloat(cubicajeBolsa) + parseFloat(cubicajeCaja)).toFixed(6);

        const fila = `<tr>
                      <td>${producto.codigo}</td>
                      <td>${producto.empaque || "N/A"}</td>
                      <td>${producto.unidad_empaque_gramos || "N/A"}</td>
                      <td>${(pesoUnidadGramos / 1000).toFixed(4)}</td>
                      <td>${producto.empaque_canasta || "N/A"}</td>
                      <td>${volumenUnidad.toFixed(6)}</td>
                      <td>${volumenCanastillaUnidad.toFixed(6)}</td>
                      <td>${cantidad}</td>
                      <td>${volumenTotalProducto.toFixed(6)}</td> 
                      <td>${volumenTotalCanastilla.toFixed(6)}</td>                 
                      <td>${(pesoTotalProducto / 1000).toFixed(2)}</td>
                      <td>${cubicajeBolsa}</td>                   
                      <td>${cubicajeCaja}</td>
                    </tr>`;

        resultadosIndividuales.insertAdjacentHTML("beforeend", fila);
      } else {
        const fila = `<tr>
                      <td>${codigo.trim()}</td>
                      <td colspan="10">Producto no encontrado</td>
                    </tr>`;
        resultadosIndividuales.insertAdjacentHTML("beforeend", fila);
      }
    }
  });

  const diferenciaVolumen = totalCanastilla - volumenTotal;

  volumenTotalElem.textContent = volumenTotal.toFixed(6);
  pesoTotalElem.textContent = (pesoTotal / 1000).toFixed(2);
  volumenCanastillaElem.textContent = totalCanastilla.toFixed(6);
  diferenciaVolumenElem.textContent = diferenciaVolumen.toFixed(6);

  document.getElementById("volumen-total-bolsa").textContent = volumenTotalBolsa.toFixed(6);
  document.getElementById("volumen-total-cajas").textContent = volumenTotalCajas.toFixed(6);

  const volumenConsolidadoCajasBolsas = volumenTotalBolsa + volumenTotalCajas;
  document.getElementById("volumen-consolidado-cajas-bolsas").textContent = volumenConsolidadoCajasBolsas.toFixed(6);

  const camiones = [
    { nombre: "Camión Placa WDL-969", capacidadVolumen: 16.75, capacidadPeso: 2100 },
    { nombre: "Camión Placa SQD-655", capacidadVolumen: 57.61, capacidadPeso: 7000 },
    { nombre: "Camión Placa SQD-563", capacidadVolumen: 57.88, capacidadPeso: 7000 },
    { nombre: "Camión Placa WCW-366", capacidadVolumen: 60.68, capacidadPeso: 6900 },
    { nombre: "Camión Placa TJB-056", capacidadVolumen: 58.73, capacidadPeso: 7000 },
    { nombre: "Camión Placa SZR-699", capacidadVolumen: 75.25, capacidadPeso: 24000 },
    { nombre: "Camión Placa SZR-652", capacidadVolumen: 75.25, capacidadPeso: 24000 },
    { nombre: "Contenedor 20 ST", capacidadVolumen: 33.2, capacidadPeso: 22180 },
    { nombre: "Contenedor 40 ST", capacidadVolumen: 77, capacidadPeso: 27750 },
    { nombre: "Contenedor 40 HC", capacidadVolumen: 75.25, capacidadPeso: 29600 },
  ];

  camiones.forEach((camion) => {
    const volumenUtilizado = (volumenConsolidadoCajasBolsas / camion.capacidadVolumen) * 100;
    const pesoUtilizado = (pesoTotal / 1000 / camion.capacidadPeso) * 100;
    const volumenMetros = camion.capacidadVolumen - totalCanastilla;
    const cabe = volumenUtilizado <= 100 && pesoUtilizado <= 100 ? "Sí" : "No";

    const filaCamion = document.createElement("tr");

    const nombreTd = document.createElement("td");
    nombreTd.textContent = camion.nombre;

    const capacidadVolumenTd = document.createElement("td");
    capacidadVolumenTd.textContent = camion.capacidadVolumen;

    const capacidadPesoTd = document.createElement("td");
    capacidadPesoTd.textContent = camion.capacidadPeso;

    const volumenTd = document.createElement("td");
    volumenTd.textContent = `${volumenUtilizado.toFixed(4)}%`;
    if (volumenUtilizado > 100) {
      volumenTd.classList.add("rojo");
    }

    const pesoTd = document.createElement("td");
    pesoTd.textContent = `${pesoUtilizado.toFixed(2)}%`;
    if (pesoUtilizado >= 100) {
      pesoTd.classList.add("rojo");
    }

    const volumenMetrosTd = document.createElement("td");
    volumenMetrosTd.textContent = `${volumenConsolidadoCajasBolsas.toFixed(2)}m³`;

    const cubicajeTotalCBTd = document.createElement("td");
    const cubicajeTotalCB = camion.capacidadVolumen - volumenConsolidadoCajasBolsas;
    cubicajeTotalCBTd.textContent = `${cubicajeTotalCB.toFixed(2)}m³`;

    const cabeTd = document.createElement("td");
    cabeTd.textContent = cabe;

    filaCamion.appendChild(nombreTd);
    filaCamion.appendChild(capacidadVolumenTd);
    filaCamion.appendChild(capacidadPesoTd);
    filaCamion.appendChild(volumenTd);
    filaCamion.appendChild(pesoTd);
    filaCamion.appendChild(volumenMetrosTd);
    filaCamion.appendChild(cubicajeTotalCBTd);
    filaCamion.appendChild(cabeTd);

    resultadoCamiones.appendChild(filaCamion);
  });
}