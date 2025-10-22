const { printer: ThermalPrinter, types: PrinterTypes } = require('node-thermal-printer');

(async () => {
  try {
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'printer:POS80',
    });

    printer.alignCenter();
    printer.bold(true);
    printer.println("🖨️ TEST DE IMPRESIÓN");
    printer.bold(false);
    printer.println("POS80 USB funcionando correctamente.");
    printer.newLine();
    printer.cut();

    const success = await printer.execute();
    console.log(success ? "✅ Impresión exitosa" : "❌ Falló la impresión");
  } catch (err) {
    console.error("⚠️ Error al imprimir:", err);
  }
})();
