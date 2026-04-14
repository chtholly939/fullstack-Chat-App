export const createPeerConnection = (socket, targetUserId) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
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