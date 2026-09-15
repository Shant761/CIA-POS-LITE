package am.ciasoft.poslite

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.BufferedOutputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.Executors

@CapacitorPlugin(name = "CiaEscPos")
class CiaEscPosPlugin : Plugin() {
    private val executor = Executors.newSingleThreadExecutor()

    @PluginMethod
    fun discoverPrinters(call: PluginCall) {
        executor.execute {
            try {
                val port = call.getInt("port", 9100) ?: 9100
                val timeoutMs = call.getInt("timeoutMs", 220) ?: 220
                val service = PrinterDiscoveryService(context)
                val found = service.scan(port = port, timeoutMs = timeoutMs.coerceIn(100, 1000))
                val devices = JSArray()
                found.forEach { printer ->
                    devices.put(
                        JSObject()
                            .put("name", "ESC/POS")
                            .put("host", printer.host)
                            .put("port", printer.port)
                            .put("transport", printer.transport)
                            .put("protocol", printer.protocol)
                            .put("verified", false)
                    )
                }
                call.resolve(JSObject().put("devices", devices).put("count", found.size))
            } catch (e: Exception) {
                call.reject(e.message ?: "Printer discovery failed", e)
            }
        }
    }

    @PluginMethod
    fun printTest(call: PluginCall) {
        executor.execute {
            try {
                val host = call.getString("host") ?: throw IllegalArgumentException("Printer host is required")
                val port = call.getInt("port", 9100) ?: 9100
                val paper = call.getInt("paper", 80) ?: 80
                val autoCut = call.getBoolean("autoCut", true) ?: true

                val bitmap = ReceiptBitmapRenderer.renderTest(
                    paperMm = paper,
                    printerAddress = "$host:$port"
                )
                send(host, port, EscPosRasterEncoder.encode(bitmap, autoCut))
                bitmap.recycle()

                call.resolve(JSObject().put("ok", true).put("mode", "raster"))
            } catch (e: Exception) {
                call.reject(e.message ?: "Print failed", e)
            }
        }
    }

    @PluginMethod
    fun printPrecheck(call: PluginCall) {
        executor.execute {
            try {
                val host = call.getString("host") ?: throw IllegalArgumentException("Printer host is required")
                val port = call.getInt("port", 9100) ?: 9100
                val paper = call.getInt("paper", 80) ?: 80
                val autoCut = call.getBoolean("autoCut", true) ?: true
                val title = call.getString("title") ?: "CIA POS LITE"
                val subtitle = call.getString("subtitle") ?: "ПРЕЧЕК · НЕ ФИСКАЛЬНЫЙ"
                val receiptNo = call.getString("receiptNo") ?: ""
                val cashier = call.getString("cashier") ?: ""
                val dateTime = call.getString("dateTime") ?: ""
                val items: JSArray = call.getArray("items") ?: JSArray()
                val subtotal = call.getDouble("subtotal", 0.0) ?: 0.0
                val discount = call.getDouble("discount", 0.0) ?: 0.0
                val serviceAmount = call.getDouble("serviceAmount", 0.0) ?: 0.0
                val total = call.getDouble("total", 0.0) ?: 0.0
                val footer = call.getString("footer") ?: "Շնորհակալություն · Спасибо"

                val receiptItems = mutableListOf<ReceiptBitmapRenderer.ReceiptItem>()
                for (i in 0 until items.length()) {
                    val item = items.getJSONObject(i)
                    receiptItems += ReceiptBitmapRenderer.ReceiptItem(
                        name = item.optString("name", "Товар"),
                        qty = item.optDouble("qty", 0.0),
                        price = item.optDouble("price", 0.0)
                    )
                }

                val bitmap = ReceiptBitmapRenderer.renderPrecheck(
                    paperMm = paper,
                    title = title,
                    subtitle = subtitle,
                    receiptNo = receiptNo,
                    cashier = cashier,
                    dateTime = dateTime,
                    items = receiptItems,
                    subtotal = subtotal,
                    discount = discount,
                    serviceAmount = serviceAmount,
                    total = total,
                    footer = footer
                )
                send(host, port, EscPosRasterEncoder.encode(bitmap, autoCut))
                bitmap.recycle()

                call.resolve(JSObject().put("ok", true).put("mode", "raster"))
            } catch (e: Exception) {
                call.reject(e.message ?: "Print failed", e)
            }
        }
    }

    private fun send(host: String, port: Int, payload: ByteArray) {
        Socket().use { socket ->
            socket.connect(InetSocketAddress(host, port), 4000)
            socket.soTimeout = 4000
            BufferedOutputStream(socket.getOutputStream()).use { out ->
                out.write(payload)
                out.flush()
            }
        }
    }
}
