class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.onRemoteStream = null
    this.onIceCandidate = null
    this.onDataChannel = null
    this.dataChannel = null
    this.isInitiator = false
  }

  async init(config = {}) {
    const rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      ...config
    }

    this.peerConnection = new RTCPeerConnection(rtcConfig)

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate)
      }
    }

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream)
        }
      }
    }

    this.peerConnection.onconnectionstatechange = () => {
      //
    }
  }

  async getLocalStream(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      //
      throw error
    }
  }

  addLocalTracks() {
    if (this.localStream && this.peerConnection) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }
  }

  async createOffer() {
    this.isInitiator = true
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer() {
    this.isInitiator = false
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async setRemoteDescription(description) {
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(description)
    )
  }

  async addIceCandidate(candidate) {
    if (this.peerConnection && candidate) {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      )
    }
  }

  createDataChannel(label = 'chat', config = {}) {
    if (this.isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel(label, config)
      this.setupDataChannel()
    }
    return this.dataChannel
  }

  setupDataChannel() {
    if (this.dataChannel) {
      this.dataChannel.onopen = () => {
        //
      }

      this.dataChannel.onmessage = (event) => {
        if (this.onDataChannel) {
          this.onDataChannel(JSON.parse(event.data))
        }
      }

      this.dataChannel.onclose = () => {
        //
      }
    }
  }

  onDataChannelCallback(event) {
    this.dataChannel = event.channel
    this.setupDataChannel()
  }

  sendData(data) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data))
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }

  async replaceVideoTrack(newConstraints) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        const newStream = await navigator.mediaDevices.getUserMedia(newConstraints)
        const newVideoTrack = newStream.getVideoTracks()[0]
        
        const sender = this.peerConnection.getSenders().find(s => 
          s.track.kind === 'video'
        )
        
        if (sender) {
          await sender.replaceTrack(newVideoTrack)
        }
        
        videoTrack.stop()
        this.localStream.removeTrack(videoTrack)
        this.localStream.addTrack(newVideoTrack)
        
        return newStream
      }
    }
    return null
  }

  async shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      })

      const screenTrack = screenStream.getVideoTracks()[0]
      
      const sender = this.peerConnection.getSenders().find(s => 
        s.track.kind === 'video'
      )

      if (sender) {
        await sender.replaceTrack(screenTrack)
      }

      screenTrack.onended = () => {
        this.stopScreenShare()
      }

      return screenStream
    } catch (error) {
      //
      throw error
    }
  }

  async stopScreenShare() {
    const videoTrack = this.localStream?.getVideoTracks()[0]
    if (videoTrack) {
      const sender = this.peerConnection.getSenders().find(s => 
        s.track.kind === 'video'
      )
      
      if (sender) {
        await sender.replaceTrack(videoTrack)
      }
    }
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    this.remoteStream = null
    this.isInitiator = false
  }
}

// Singleton instance
const webrtcService = new WebRTCService()

export default webrtcService
