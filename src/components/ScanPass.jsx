import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  getParticipantById,
  updateParticipant,
} from "../firebase/helpers/firestoreHelpers";
import { getVenueAdmin } from "../venueAdmin/venueAuth";

export default function ScanPass({ mode = "admin" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [direction, setDirection] = useState("inside");
  const [switchCard, setSwitchCard] = useState(null);

  const venueAdmin = getVenueAdmin();

  /* ================= SECURITY REDIRECT ================= */
  useEffect(() => {
    if (mode === "venue" && !venueAdmin) {
      window.location.href = "/venue-login";
    }
  }, []);

  /* ================= CAMERA HANDLING ================= */
  useEffect(() => {
    let animationId;
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        await videoRef.current.play();

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const scanLoop = () => {
          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            canvas.height = videoRef.current.videoHeight;
            canvas.width = videoRef.current.videoWidth;

            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code) {
              handleScan(code.data);
              stopCamera();
              return;
            }
          }
          animationId = requestAnimationFrame(scanLoop);
        };

        animationId = requestAnimationFrame(scanLoop);
      } catch (err) {
        console.error(err);
        setCameraError("🚫 Unable to access camera");
      }
    };

    const stopCamera = () => {
      setScanning(false);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(animationId);
    };

    if (scanning) startCamera();

    return () => stopCamera();
  }, [scanning]);

  /* ================= QR SCAN LOGIC ================= */
  const handleScan = async (qrValue) => {
    try {
      const participant = await getParticipantById(qrValue);

      if (!participant) {
        setMessage("❌ Invalid QR Code");
        return;
      }

      /* 🔐 VENUE RESTRICTION */
      if (mode === "venue") {
        if (participant.venueId !== venueAdmin.venueId) {
          setMessage("❌ Pass does not belong to this venue");
          return;
        }
      }

      if (participant.isUsed) {
        setSwitchCard(participant);
        return;
      }

      const updates = { isUsed: true };

      if (
        typeof participant.paymentId === "string" &&
        participant.paymentId.trim().toUpperCase() === "NOT DONE YET"
      ) {
        updates.paymentId = "DONE - VIA CASH";
      }

      await updateParticipant(participant.participantId, updates);

      participant.isUsed = true;
      if (updates.paymentId) participant.paymentId = updates.paymentId;

      setDirection("inside");
      setScanResult(participant);
      setMessage("✅ Entry Allowed");

    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error verifying participant");
    }
  };

  /* ================= SWITCH INSIDE / OUTSIDE ================= */
  const handleSwitchDirection = async (participant, approve) => {
    if (!approve) {
      setMessage("❌ No changes made");
      setSwitchCard(null);
      return;
    }

    const newDirection = direction === "inside" ? "outside" : "inside";

    await updateParticipant(participant.participantId, {
      isUsed: newDirection === "inside",
    });

    participant.isUsed = newDirection === "inside";
    setDirection(newDirection);
    setScanResult(participant);
    setMessage(`✅ Status updated: ${newDirection.toUpperCase()}`);
    setSwitchCard(null);
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-[#800000] mb-4">
        {mode === "venue" ? "Venue Pass Scanner" : "Admin Pass Scanner"}
      </h1>

      <div className="relative w-full max-w-md h-80 border-4 border-dashed border-[#800000] rounded-lg mb-4">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!scanning && (
        <button
          onClick={() => {
            setMessage("");
            setScanResult(null);
            setScanning(true);
          }}
          className="px-6 py-3 bg-[#800000] text-white rounded"
        >
          Start Scanning
        </button>
      )}

      {cameraError && <p className="text-red-600 mt-3">{cameraError}</p>}
      {message && <p className="mt-4 font-bold">{message}</p>}

      {switchCard && (
        <div className="bg-yellow-100 p-4 mt-4 rounded">
          ⚠️ Ticket already used.
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => handleSwitchDirection(switchCard, true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Switch Direction
            </button>
            <button
              onClick={() => handleSwitchDirection(switchCard, false)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="bg-white shadow-lg rounded p-6 mt-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-3 text-[#800000]">
            Participant Details
          </h2>
          <p><b>Name:</b> {scanResult.name}</p>
          <p><b>Mobile:</b> {scanResult.mobile}</p>
          <p><b>Pass:</b> {scanResult.passType}</p>
          <p><b>People:</b> {scanResult.numberOfPeople}</p>
          <p><b>Payment:</b> {scanResult.paymentId}</p>
          <p>
            <b>Entered:</b>{" "}
            {scanResult.isUsed ? "Yes ✅" : "No ❌"}
          </p>
        </div>
      )}
    </div>
  );
}
