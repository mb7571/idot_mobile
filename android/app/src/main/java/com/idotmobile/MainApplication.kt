package com.idotmobile

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.soloader.SoLoader
import java.net.Inet4Address
import java.net.InetAddress
import okhttp3.Dns
import okhttp3.OkHttpClient

/**
 * DNS resolver that prefers IPv4 (A) records.
 *
 * Some routers advertise IPv6 via RA/SLAAC but black-hole actual IPv6 traffic.
 * Android then prefers the broken IPv6 route for dual-stack hosts (e.g.
 * Cloudflare-fronted APIs), causing "Network Error" in the app while
 * desktops/browsers (Happy Eyeballs) still work. Returning only A records
 * when available forces IPv4 and avoids the issue.
 */
class Ipv4PreferredDns : Dns {
  override fun lookup(hostname: String): List<InetAddress> {
    val records = Dns.SYSTEM.lookup(hostname)
    val ipv4 = records.filterIsInstance<Inet4Address>()
    return if (ipv4.isNotEmpty()) ipv4 else records
  }
}

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }

    // Make all React Native networking (fetch/XHR/axios) resolve IPv4 first,
    // starting from RN's default client config (timeouts, TLS, cache).
    val builder = OkHttpClientProvider.createClientBuilder(this)
    OkHttpClientProvider.setOkHttpClientFactory(
        object : OkHttpClientFactory {
          override fun createNewNetworkModuleClient(): OkHttpClient =
              builder.dns(Ipv4PreferredDns()).build()
        })
  }
}
