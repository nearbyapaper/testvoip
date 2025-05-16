package com.myapp

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class VoipModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "VoipModule"

    @ReactMethod
    fun createVoipEvent(name: String, mobileNumber: String) {
        Log.d("VoipModule", "createVoipEvent $name - $mobileNumber")
    }

    @ReactMethod
    fun callVoip(mobileNumber: String) {
        Log.d("VoipModule", "Calling $mobileNumber")
    }

    @ReactMethod
    fun endCall(){
        Log.d("VoipModule", "cancelCall")
    }
}