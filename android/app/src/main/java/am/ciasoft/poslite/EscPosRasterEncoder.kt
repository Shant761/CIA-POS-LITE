package am.ciasoft.poslite

import android.graphics.Bitmap
import android.graphics.Color
import java.io.ByteArrayOutputStream

object EscPosRasterEncoder {
    fun encode(bitmap: Bitmap, autoCut: Boolean): ByteArray {
        val width = bitmap.width
        val height = bitmap.height
        val widthBytes = (width + 7) / 8
        val out = ByteArrayOutputStream()

        // ESC @ : initialize printer
        out.write(byteArrayOf(0x1B, 0x40))

        // GS v 0 m xL xH yL yH : raster bitmap, normal density
        out.write(byteArrayOf(0x1D, 0x76, 0x30, 0x00))
        out.write(widthBytes and 0xFF)
        out.write((widthBytes shr 8) and 0xFF)
        out.write(height and 0xFF)
        out.write((height shr 8) and 0xFF)

        val pixels = IntArray(width)
        for (y in 0 until height) {
            bitmap.getPixels(pixels, 0, width, 0, y, width, 1)
            for (byteX in 0 until widthBytes) {
                var value = 0
                for (bit in 0 until 8) {
                    val x = byteX * 8 + bit
                    if (x < width && isBlack(pixels[x])) {
                        value = value or (0x80 shr bit)
                    }
                }
                out.write(value)
            }
        }

        // Feed before cutter so receipt clears the print head.
        out.write(byteArrayOf(0x0A, 0x0A, 0x0A))
        if (autoCut) {
            // GS V 66 0: partial cut, commonly supported by ESC/POS printers.
            out.write(byteArrayOf(0x1D, 0x56, 0x42, 0x00))
        }
        return out.toByteArray()
    }

    private fun isBlack(color: Int): Boolean {
        val alpha = Color.alpha(color)
        if (alpha < 128) return false
        val gray = (Color.red(color) * 299 + Color.green(color) * 587 + Color.blue(color) * 114) / 1000
        return gray < 170
    }
}
