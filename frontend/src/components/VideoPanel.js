// "use client";

// import { useRef, useEffect, useState } from "react";

// export default function VideoPanel({ socket, roomId, role }) {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerRef = useRef(null);
//   const streamRef = useRef(null);

//   const [ready, setReady] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         const constraints =
//           role === "mentor"
//             ? { video: true, audio: true }
//             : {
//                 video: true, // 👈 try video
//                 audio: true,
//               };

//         const stream = await navigator.mediaDevices.getUserMedia(constraints);

//         streamRef.current = stream;
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }

//         setReady(true);
//       } catch (err) {
//         try {
//           const stream = await navigator.mediaDevices.getUserMedia({
//             video: false,
//             audio: true,
//           });

//           streamRef.current = stream;
//           if (localVideoRef.current) {
//             localVideoRef.current.srcObject = stream;
//           }

//           setReady(true);
//         } catch (e) {
//           alert("Camera/Mic not accessible");
//         }
//       }
//     };

//     init();

//     return () => {
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       peerRef.current?.close();
//     };
//   }, [role]);

//   const createPeer = () => {
//     const peer = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     peerRef.current = peer;

//     streamRef.current?.getTracks().forEach((track) => {
//       peer.addTrack(track, streamRef.current);
//     });

//     peer.ontrack = (e) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = e.streams[0];
//       }
//     };

//     peer.onicecandidate = (e) => {
//       if (e.candidate) {
//         socket.current.emit("ice-candidate", {
//           roomId,
//           candidate: e.candidate,
//         });
//       }
//     };

//     return peer;
//   };

//   useEffect(() => {
//     if (!socket.current) return;

//     const handleOffer = async ({ offer }) => {
//       const peer = createPeer();

//       await peer.setRemoteDescription(new RTCSessionDescription(offer));

//       const answer = await peer.createAnswer();
//       await peer.setLocalDescription(answer);

//       socket.current.emit("answer", { roomId, answer });
//     };

//     const handleAnswer = async ({ answer }) => {
//       const peer = peerRef.current;

//       if (!peer || peer.signalingState !== "have-local-offer") return;

//       try {
//         await peer.setRemoteDescription(new RTCSessionDescription(answer));
//       } catch (err) {}
//     };

//     const handleIce = async ({ candidate }) => {
//       const peer = peerRef.current;
//       if (!peer || !peer.remoteDescription) return;

//       try {
//         await peer.addIceCandidate(candidate);
//       } catch (err) {}
//     };

//     socket.current.on("offer", handleOffer);
//     socket.current.on("answer", handleAnswer);
//     socket.current.on("ice-candidate", handleIce);

//     return () => {
//       socket.current.off("offer", handleOffer);
//       socket.current.off("answer", handleAnswer);
//       socket.current.off("ice-candidate", handleIce);
//     };
//   }, [socket]);

//   const startCall = async () => {
//     if (role !== "mentor") {
//       alert("Only mentor can start call");
//       return;
//     }

//     if (!ready) {
//       alert("Device not ready");
//       return;
//     }

//     const peer = createPeer();

//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);

//     socket.current.emit("offer", { roomId, offer });
//   };

//   const endCall = () => {
//     peerRef.current?.close();
//     peerRef.current = null;

//     streamRef.current?.getTracks().forEach((t) => t.stop());

//     window.location.href = "/";
//   };

//   const toggleMute = () => {
//     streamRef.current?.getAudioTracks().forEach((track) => {
//       track.enabled = isMuted;
//     });

//     setIsMuted(!isMuted);
//   };

//   const toggleVideo = () => {
//     streamRef.current?.getVideoTracks().forEach((track) => {
//       track.enabled = isVideoOff;
//     });

//     setIsVideoOff(!isVideoOff);
//   };

//   return (
//     <div className="h-1/2 bg-gray-300 p-3">
//       <div className="flex gap-2 mb-2">
//         <button
//           onClick={startCall}
//           className="bg-green-600 text-white px-3 py-1 rounded text-sm"
//         >
//           Start
//         </button>

//         <button
//           onClick={endCall}
//           className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//         >
//           End Call
//         </button>

//         <button
//           onClick={toggleMute}
//           className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
//         >
//           {isMuted ? "Unmute" : "Mute"}
//         </button>

//         <button
//           onClick={toggleVideo}
//           className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
//         >
//           {isVideoOff ? "Video On" : "Video Off"}
//         </button>
//       </div>

//       <div className="flex gap-2 h-full">
//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           className="w-1/2 bg-black h-85  border rounded-lg object-cover"
//         />

//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           className="w-1/2 bg-black object-cover border rounded-lg h-85"
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import { useRef, useEffect, useState } from "react";

export default function VideoPanel({ socket, roomId, role }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const iceQueueRef = useRef([]);

  const [ready, setReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // 🎥 Get user media
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setReady(true);
      } catch (err) {
        alert("Camera/Mic not accessible");
      }
    };

    init();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.close();
    };
  }, []);

  // 🔗 Create Peer
  const createPeer = () => {
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

    peerRef.current = peer;

    // add tracks
    streamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, streamRef.current);
    });

    // remote stream
    peer.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // ICE
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current.emit("ice-candidate", {
          roomId,
          candidate: e.candidate,
        });
      }
    };

    return peer;
  };

  // 📡 Socket listeners
  useEffect(() => {
    if (!socket.current) return;

    const handleOffer = async ({ offer }) => {
      const peer = createPeer();

      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      // 🔥 process queued ICE
      for (const c of iceQueueRef.current) {
        try {
          await peer.addIceCandidate(c);
        } catch {}
      }
      iceQueueRef.current = [];

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.current.emit("answer", { roomId, answer });
    };

    const handleAnswer = async ({ answer }) => {
      const peer = peerRef.current;
      if (!peer) return;

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));

        // 🔥 process queued ICE
        for (const c of iceQueueRef.current) {
          try {
            await peer.addIceCandidate(c);
          } catch {}
        }
        iceQueueRef.current = [];
      } catch {}
    };

    const handleIce = async ({ candidate }) => {
      const peer = peerRef.current;
      if (!peer) return;

      if (peer.remoteDescription) {
        try {
          await peer.addIceCandidate(candidate);
        } catch {}
      } else {
        iceQueueRef.current.push(candidate);
      }
    };

    socket.current.on("offer", handleOffer);
    socket.current.on("answer", handleAnswer);
    socket.current.on("ice-candidate", handleIce);

    return () => {
      socket.current.off("offer", handleOffer);
      socket.current.off("answer", handleAnswer);
      socket.current.off("ice-candidate", handleIce);
    };
  }, []);

  // ▶️ Start Call
  const startCall = async () => {
    if (role !== "mentor") {
      alert("Only mentor can start call");
      return;
    }

    if (!ready || !streamRef.current) {
      alert("Device not ready");
      return;
    }

    const peer = createPeer();

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.current.emit("offer", { roomId, offer });
  };

  // ❌ End Call
  const endCall = () => {
    peerRef.current?.close();
    peerRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());

    window.location.href = "/";
  };

  // 🔇 Mute
  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(!isMuted);
  };

  // 🎥 Video toggle
  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = isVideoOff;
    });

    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="h-1/2 bg-gray-300 p-3">
      <div className="flex gap-2 mb-2">
        <button
          onClick={startCall}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          Start
        </button>

        <button
          onClick={endCall}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          End Call
        </button>

        <button
          onClick={toggleMute}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleVideo}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          {isVideoOff ? "Video On" : "Video Off"}
        </button>
      </div>

      <div className="flex gap-2 h-full">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-1/2 bg-black h-85 border rounded-lg object-cover"
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-1/2 bg-black object-cover border rounded-lg h-85"
        />
      </div>
    </div>
  );
}
