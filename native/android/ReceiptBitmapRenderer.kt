package am.ciasoft.poslite

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import kotlin.math.ceil
import kotlin.math.max

object ReceiptBitmapRenderer {
    data class ReceiptItem(val name: String, val qty: Double, val price: Double)

    private const val WIDTH_80 = 576
    private const val WIDTH_58 = 384

    private fun widthForPaper(paperMm: Int) = if (paperMm <= 58) WIDTH_58 else WIDTH_80

    fun renderTest(paperMm: Int, printerAddress: String): Bitmap {
        val width = widthForPaper(paperMm)
        val b = Builder(width)
        b.center("CIA POS LITE", 32f, bold = true)
        b.center("RASTER / BITMAP TEST", 24f, bold = true)
        b.space(10)
        b.line()
        b.center("Русский · Հայերեն · English", 24f)
        b.left("Принтер: $printerAddress", 22f)
        b.left("Бумага: $paperMm мм", 22f)
        b.left("Режим: ESC/POS GS v 0", 22f)
        b.line()
        b.center("ПЕЧАТЬ РАБОТАЕТ", 28f, bold = true)
        b.center("ՏՊԱԳՐՈՒԹՅՈՒՆԸ ԱՇԽԱՏՈՒՄ Է", 22f, bold = true)
        b.space(28)
        return b.build()
    }

    fun renderPrecheck(
        paperMm: Int,
        title: String,
        subtitle: String,
        receiptNo: String,
        cashier: String,
        dateTime: String,
        items: List<ReceiptItem>,
        subtotal: Double,
        discount: Double,
        total: Double,
        footer: String
    ): Bitmap {
        val width = widthForPaper(paperMm)
        val b = Builder(width)

        b.center(title, 34f, bold = true)
        b.center(subtitle, 22f, bold = true)
        b.space(8)
        b.line()
        if (receiptNo.isNotBlank()) b.keyValue("Чек", receiptNo, 21f)
        if (dateTime.isNotBlank()) b.keyValue("Дата", dateTime, 21f)
        if (cashier.isNotBlank()) b.keyValue("Кассир", cashier, 21f)
        if (receiptNo.isNotBlank() || dateTime.isNotBlank() || cashier.isNotBlank()) b.line()

        items.forEach { item ->
            b.left(item.name, 23f, bold = true)
            b.keyValue(
                "${formatQty(item.qty)} × ${formatMoney(item.price)}",
                formatMoney(item.qty * item.price),
                21f
            )
            b.space(5)
        }

        b.line()
        if (subtotal > 0.0) b.keyValue("Сумма", formatMoney(subtotal), 22f)
        if (discount > 0.0) b.keyValue("Скидка", "-${formatMoney(discount)}", 22f)
        b.space(4)
        b.keyValue("ИТОГО", formatMoney(total), 32f, bold = true)
        b.center("AMD / ֏", 20f)
        b.line()
        b.center("НЕ ФИСКАЛЬНЫЙ ЧЕК", 21f, bold = true)
        b.center("ՈՉ ՖԻՍԿԱԼ ՉԵԿ", 21f, bold = true)
        b.space(10)
        b.center(footer, 22f)
        b.space(30)
        return b.build()
    }

    private fun formatMoney(v: Double) = String.format("%,.0f", v).replace(',', ' ')
    private fun formatQty(v: Double) = if (v % 1.0 == 0.0) String.format("%.0f", v) else String.format("%.2f", v)

    private class Builder(private val width: Int) {
        private val padding = if (width <= WIDTH_58) 14 else 20
        private val commands = mutableListOf<(Canvas, Int) -> Int>()
        private var estimatedHeight = 30

        private fun paint(size: Float, bold: Boolean = false): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = size
            typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
        }

        fun space(px: Int) {
            estimatedHeight += px
            commands += { _, y -> y + px }
        }

        fun line() {
            estimatedHeight += 18
            commands += { canvas, y ->
                val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.BLACK; strokeWidth = 2f }
                canvas.drawLine(padding.toFloat(), (y + 8).toFloat(), (width - padding).toFloat(), (y + 8).toFloat(), p)
                y + 18
            }
        }

        fun center(text: String, size: Float, bold: Boolean = false) {
            addWrapped(text, size, bold, Alignment.CENTER)
        }

        fun left(text: String, size: Float, bold: Boolean = false) {
            addWrapped(text, size, bold, Alignment.LEFT)
        }

        fun keyValue(left: String, right: String, size: Float, bold: Boolean = false) {
            val p = paint(size, bold)
            val lineHeight = ceil(size * 1.35f).toInt()
            estimatedHeight += lineHeight
            commands += { canvas, y ->
                val baseline = y - p.ascent().toInt()
                canvas.drawText(left, padding.toFloat(), baseline.toFloat(), p)
                canvas.drawText(right, (width - padding - p.measureText(right)).coerceAtLeast(padding.toFloat()), baseline.toFloat(), p)
                y + lineHeight
            }
        }

        private enum class Alignment { LEFT, CENTER }

        private fun addWrapped(text: String, size: Float, bold: Boolean, alignment: Alignment) {
            val p = paint(size, bold)
            val maxWidth = width - padding * 2
            val lines = wrap(text, p, maxWidth.toFloat())
            val lineHeight = ceil(size * 1.35f).toInt()
            estimatedHeight += max(1, lines.size) * lineHeight
            commands += { canvas, startY ->
                var y = startY
                lines.forEach { line ->
                    val baseline = y - p.ascent().toInt()
                    val x = when (alignment) {
                        Alignment.LEFT -> padding.toFloat()
                        Alignment.CENTER -> ((width - p.measureText(line)) / 2f).coerceAtLeast(padding.toFloat())
                    }
                    canvas.drawText(line, x, baseline.toFloat(), p)
                    y += lineHeight
                }
                y
            }
        }

        private fun wrap(text: String, p: Paint, maxWidth: Float): List<String> {
            if (text.isBlank()) return listOf("")
            val words = text.trim().split(Regex("\\s+"))
            val lines = mutableListOf<String>()
            var current = ""
            words.forEach { word ->
                val candidate = if (current.isEmpty()) word else "$current $word"
                if (p.measureText(candidate) <= maxWidth) {
                    current = candidate
                } else {
                    if (current.isNotEmpty()) lines += current
                    if (p.measureText(word) <= maxWidth) {
                        current = word
                    } else {
                        var part = ""
                        word.forEach { ch ->
                            val next = part + ch
                            if (p.measureText(next) > maxWidth && part.isNotEmpty()) {
                                lines += part
                                part = ch.toString()
                            } else part = next
                        }
                        current = part
                    }
                }
            }
            if (current.isNotEmpty()) lines += current
            return lines
        }

        fun build(): Bitmap {
            val height = estimatedHeight + 24
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.WHITE)
            var y = 12
            commands.forEach { y = it(canvas, y) }
            return bitmap
        }
    }
}
