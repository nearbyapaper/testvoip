package com.myapp

import android.os.Bundle // ✅ ต้อง import เพิ่ม
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MyApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
          DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // ✅ Add this method to prevent crash with react-navigation/native-stack
  // เพราะเมื่อใช้ New Architecture (Fabric) + Kotlin → template ไม่ใส่ onCreate() ให้แล้ว
  // แต่หากใช้ react-native-screens + @react-navigation/native-stack → จำเป็นต้องใส่ เพื่อป้องกัน
  // crash
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
