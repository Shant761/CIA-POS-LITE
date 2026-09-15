package am.ciasoft.poslite

import android.content.Context
import android.net.ConnectivityManager
import android.net.LinkAddress
import android.net.NetworkCapabilities
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.Socket
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class PrinterDiscoveryService(private val context: Context) {
    data class Candidate(
        val host: String,
        val port: Int = 9100,
        val transport: String = "LAN",
        val protocol: String = "ESC/POS"
    )

    fun scan(port: Int = 9100, timeoutMs: Int = 220): List<Candidate> {
        val link = currentIpv4Link() ?: return emptyList()
        val local = link.address.hostAddress ?: return emptyList()

        // Most POS networks are /24. For broader networks we intentionally scan only
        // the current /24 to avoid probing thousands of hosts from a checkout device.
        val prefix = local.substringBeforeLast('.')
        val localLast = local.substringAfterLast('.').toIntOrNull()
        val hosts = (1..254).filter { it != localLast }.map { "$prefix.$it" }

        val found = Collections.synchronizedList(mutableListOf<Candidate>())
        val pool = Executors.newFixedThreadPool(32)
        val latch = CountDownLatch(hosts.size)

        hosts.forEach { host ->
            pool.execute {
                try {
                    Socket().use { socket ->
                        socket.connect(InetSocketAddress(host, port), timeoutMs)
                        found += Candidate(host = host, port = port)
                    }
                } catch (_: Exception) {
                    // Closed/unreachable ports are expected during discovery.
                } finally {
                    latch.countDown()
                }
            }
        }

        latch.await(12, TimeUnit.SECONDS)
        pool.shutdownNow()
        return found.sortedBy { addressToInt(it.host) }
    }

    private fun currentIpv4Link(): LinkAddress? {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return null
        val caps = cm.getNetworkCapabilities(network) ?: return null
        if (!caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) &&
            !caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) return null

        return cm.getLinkProperties(network)
            ?.linkAddresses
            ?.firstOrNull { it.address is Inet4Address && !it.address.isLoopbackAddress }
    }

    private fun addressToInt(host: String): Long = host.split('.').fold(0L) { acc, part ->
        (acc shl 8) + (part.toLongOrNull() ?: 0L)
    }
}
