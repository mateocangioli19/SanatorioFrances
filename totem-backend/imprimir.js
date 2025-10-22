// backend/imprimir.js
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function imprimirTurno(turno, especialidad) {
  console.log(`🖨️ Iniciando impresión para: ${turno}`);
  
  // Timeout más corto para respuesta rápida
  const timeoutMs = 1500; // 1.5 segundos en lugar de 3
  
  // Crear una promesa con timeout
  const impresionConTimeout = new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout: Impresora no responde'));
    }, timeoutMs);

    try {
      // CONFIGURACIÓN RÁPIDA - ELIGE TU CONEXIÓN
      const printerConfig = {
        type: PrinterTypes.EPSON, // compatible con POS80
        interface: 'printer:POS80', // ← nombre exacto de tu impresora en Windows
      };

      let printer = new ThermalPrinter({
        ...printerConfig,
        width: 48,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
      });

      // CONTENIDO MÍNIMO PARA PRUEBA RÁPIDA
      printer.alignCenter();
      printer.bold(true);
      printer.setTextDoubleHeight();
      printer.setTextDoubleWidth();
      printer.println(turno);
      printer.setTextNormal();
      printer.bold(false);
      printer.newLine();
      printer.println("SANATORIO FRANCES");
      printer.newLine();
      printer.println("Espere a ser llamado");
      printer.cut();

      const success = await printer.execute();
      clearTimeout(timeoutId);
      
      if (success) {
        resolve({
          success: true,
          mensaje: 'Impreso correctamente',
          metodo: 'Impresora térmica'
        });
      } else {
        reject(new Error('Error en ejecución'));
      }

    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });

  try {
    // Intentar impresión térmica con timeout
    const resultado = await impresionConTimeout;
    console.log(`✅ Impresión térmica exitosa: ${turno}`);
    return resultado;
    
  } catch (error) {
    console.log(`⚠️ Falló impresión térmica: ${error.message}`);
    
    // FALLBACK RÁPIDO A PDF
    try {
      console.log('🔄 Generando PDF rápidamente...');
      const resultadoPDF = await generarPDFRapido(turno, especialidad);
      return {
        success: true,
        mensaje: 'PDF generado (fallback)',
        archivo: resultadoPDF.archivo,
        metodo: 'PDF',
        advertencia: error.message
      };
    } catch (pdfError) {
      throw new Error(`Error completo: ${pdfError.message}`);
    }
  }
}

// PDF MÁS RÁPIDO Y SIMPLE
async function generarPDFRapido(turno, especialidad) {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(__dirname, 'tickets');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `ticket_${turno}_${Date.now()}.pdf`);
      const doc = new PDFDocument({ size: [200, 300], margin: 10 });

      doc.pipe(fs.createWriteStream(filePath));

      // CONTENIDO MÍNIMO
      doc.fontSize(14).text(turno, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text('SANATORIO FRANCES', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).text('Espere a ser llamado', { align: 'center' });
      doc.text(new Date().toLocaleString('es-AR'), { align: 'center' });

      doc.end();

      doc.on('end', () => {
        resolve({ archivo: filePath });
      });

      doc.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
}

function getNombreEspecialidad(codigo) {
  const especialidades = {
    'R': 'RECEPCION',
    'L': 'LABORATORIO', 
    'C': 'CONSULTORIOS'
  };
  return especialidades[codigo] || codigo;
}

module.exports = imprimirTurno;