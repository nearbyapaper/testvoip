package com.myapp

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.webrtc.MediaConstraints
import org.webrtc.MediaStream
import org.webrtc.PeerConnectionFactory

class VoipModule(private val reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "VoipModule"

//    private lateinit var peerConnectionFactory: PeerConnectionFactory
//    private var localStream: MediaStream? = null
//
//    init {
//        initWebRTC()
//    }
//
//    private fun initWebRTC() {
//        val initializationOptions = PeerConnectionFactory.InitializationOptions.builder(reactContext)
//            .setEnableInternalTracer(true).createInitializationOptions()
//        PeerConnectionFactory.initialize(initializationOptions)
//
//        val options = PeerConnectionFactory.Options()
//        peerConnectionFactory = PeerConnectionFactory.builder().setOptions(options).createPeerConnectionFactory()
//
//        Log.d("VoipModule", "WebRTC Initialized")
//    }

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

//    @ReactMethod
//    fun createLocalMediaStream(){
//        val audioSource = peerConnectionFactory.createAudioSource(MediaConstraints())
//        val audioTrack= peerConnectionFactory.createAudioTrack("ARDAMSa0",audioSource)
//
//        localStream = peerConnectionFactory.createLocalMediaStream("ARDAMS")
//        localStream?.addTrack(audioTrack)
//
//        Log.d("VoipModule", "Local MediaStream created")
//    }

    @ReactMethod
    fun callWithUser(userId: String){
        // TODO: Integrate signaling and start PeerConnection
        Log.d("VoipModule", "Calling user: $userId")
    }

    @ReactMethod
    fun callWithNumber(number: String){
        // TODO: Integrate signaling and start PeerConnection
        Log.d("VoipModule", "Calling user: $number")
    }
}