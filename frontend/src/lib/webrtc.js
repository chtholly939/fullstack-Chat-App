export const createPeerConnection = (socket, targetUserId) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
    
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  });

  // 🔁 Send ICE candidates to other user
  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        to: targetUserId,
        candidate: event.candidate,
      });
    }
  };

  return peer;
};
