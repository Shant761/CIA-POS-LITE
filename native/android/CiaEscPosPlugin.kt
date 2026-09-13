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
import java.nio.charset.Charset
import java.util.concurrent.Executors

@CapacitorPlugin(name = "CiaEscPos")
class CiaEscPosPlugin : Plugin() {
    private val executor = Executors.newSingleThreadExecutor()
    private val cp866: Charset = Charset.forName("CP866")

    @PluginMethod
    fun printTest(call: PluginCall) {
        executor.execute {
            try {
                val host = call.getString("host") ?: throw IllegalArgumentException("Printer host is required")
                val port = call.getInt("port", 9100) ?: 9100
                val autoCut = call.getBoolean("autoCut", true) ?: true

                val lines = listOf(
                    "CIA POS LITE",
                    "ESC/POS TEST",
                    "Printer: $host:$port",
                    "Connection OK",
                    "------------------------------",
                    "TEST PRINT SUCCESS"
                )

                send(host, port, buildTicket(lines, autoCut))
                call.resolve(JSObject().put("ok", true))
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
                val autoCut = call.getBoolean("autoCut", true) ?: true
                val title = call.getString("title") ?: "CIA POS LITE"
                val items: JSArray = call.getArray("items") ?: JSArray()
                val total = call.getDouble("total", 0.0) ?: 0.0

                val lines = mutableListOf<String>()
                lines += title
                lines += "PRECHECK / NOT FISCAL"
                lines += "------------------------------"

                for (i in 0 until items.length()) {
                    val item = items.getJSONObject(i)
                    val name = item.optString("name", "Item")
                    val qty = item.optDouble("qty", 0.0)
                    val price = item.optDouble("price", 0.0)
                    lines += name
                    lines += "  ${formatQty(qty)} x ${formatMoney(price)} = ${formatMoney(qty * price)}"
                }

                lines += "------------------------------"
                lines += "TOTAL: ${formatMoney(total)} AMD"
                lines += "NOT A FISCAL RECEIPT"

                send(host, port, buildTicket(lines, autoCut))
                call.resolve(JSObject().put("ok", true))
            } catch (e: Exception) {
                call.reject(e.message ?: "Print failed", e)
            }
        }
    }

    private fun send(host: String, port: Int, payload: ByteArray) {
        Socket().use { socket ->
            socket.connect(InetSocketAddress(host, port), 3500)
            socket.soTimeout = 3500
            BufferedOutputStream(socket.getOutputStream()).use { out ->
                out.write(payload)
                out.flush()
            }
        }
    }

    private fun buildTicket(lines: List<String>, autoCut: Boolean): ByteArray {
        val bytes = ArrayList<Byte>()
        fun append(vararg values: Int) = values.forEach { bytes.add(it.toByte()) }
        fun text(value: String) = value.toByteArray(cp866).forEach { bytes.add(it) }

        append(0x1B, 0x40) // initialize
        append(0x1B, 0x61, 0x01) // center
        append(0x1B, 0x45, 0x01) // bold on
        text(lines.firstOrNull() ?: "CIA POS LITE")
        append(0x0A)
        append(0x1B, 0x45, 0x00)
        append(0x1B, 0x61, 0x00) // left

        lines.drop(1).forEach {
            text(it)
            append(0x0A)
        }

        append(0x0A, 0x0A, 0x0A)
        if (autoCut) append(0x1D, 0x56, 0x00)
        return bytes.toByteArray()
    }

    private fun formatMoney(value: Double): String = String.format("%.0f", value)
    private fun formatQty(value: Double): String = if (value % 1.0 == 0.0) String.format("%.0f", value) else String.format("%.2f", value)
}
