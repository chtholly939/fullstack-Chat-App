import { Phone, PhoneOff, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useRef } from "react";
import { createPeerConnection } from "../lib/webrtc";
import { useState, useEffect } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const peerRef = useRef(null);
  const audioRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const localStreamRef = useRef(null);
  
  //start call 
  const startCall = async () => {
    if (!selectedUser) return;
    if (!socket) return console.error("Socket not connected");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = stream;

      const peer = createPeerConnection(socket, selectedUser._id);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
      
          // 🔥 force play (fix for mobile browsers)
          audioRef.current
            .play()
            .then(() => console.log("Audio playing"))
            .catch((e) => console.log("Audio blocked:", e));
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        to: selectedUser._id,
        offer,
      });

      console.log("Calling:", selectedUser.fullName);
    } catch (error) {
      console.error("Call error:", error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ from, offer }) => {
      console.log("Incoming call from:", from);
      setIncomingCall({ from, offer });
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call-answered", async ({ answer }) => {
      console.log("Call answered!");

      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(answer);
      }
    });

    return () => socket.off("call-answered");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("ice-candidate", async (candidate) => {
      try {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error("ICE error:", error);
      }
    });

    return () => socket.off("ice-candidate");
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call-ended", () => {
      console.log("Other user ended the call");

      // 🔌 Close peer
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }

      // 🎙️ Stop mic
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // 🔇 Clear audio
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }

      setIncomingCall(null);
    });

    return () => socket.off("call-ended");
  }, [socket]);

  //accept call function
  const acceptCall = async () => {
    if (!incomingCall) return;

    console.log("Accepted call from:", incomingCall.from);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = stream;

      const peer = createPeerConnection(socket, incomingCall.from);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
      
          // 🔥 force play (fix for mobile browsers)
          audioRef.current
            .play()
            .then(() => console.log("Audio playing"))
            .catch((e) => console.log("Audio blocked:", e));
        }
      };

      await peer.setRemoteDescription(incomingCall.offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: incomingCall.from,
        answer,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("Accept call error:", error);
    }
  };

  //reject call
const rejectCall = () => {
  console.log("Call rejected");

  if (incomingCall && socket) {
    socket.emit("call-rejected", {
      to: incomingCall.from,
    });
  }

  setIncomingCall(null);
};

  //end call function
  const endCall = () => {
    console.log("Call ended");

    // 📤 Notify other user
    if (selectedUser && socket) {
      socket.emit("end-call", {
        to: selectedUser._id,
      });
    }

    // 🔌 Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    // 🎙️ Stop mic
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // 🔇 Clear audio
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }

    setIncomingCall(null);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="flex items-center gap-2">
          {/* 📞 Call Button */}
          <button
            onClick={startCall}
            className="btn btn-sm"
            disabled={!selectedUser || !onlineUsers.includes(selectedUser._id)}
          >
            <Phone />
          </button>

          {/* 🔴 End Call Button */}
          <button
            onClick={endCall}
            className="btn btn-sm btn-error"
          >
            <PhoneOff />
          </button>

          {/* Close */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
      {incomingCall && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-base-200 p-4 rounded-lg shadow-lg z-50">
          <p className="mb-2 font-medium">Incoming Call <Phone /></p>

          <div className="flex gap-2">
            <button onClick={acceptCall} className="btn btn-success btn-sm">
              Accept
            </button>
            <button onClick={rejectCall} className="btn btn-error btn-sm">
              Reject
            </button>
          </div>
        </div>
      )}
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
};
export default ChatHeader;
