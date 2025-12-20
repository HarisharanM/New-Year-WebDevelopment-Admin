import React, { useEffect, useRef, useState } from "react";  
import jsQR from "jsqr";
import {
  getParticipantById,
  updateParticipant,
} from "../firebase/helpers/firestoreHelpers";

export default function Scan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [direction, setDirection] = useState("inside"); 
  const [switchCard, setSwitchCard] = useState(null);

  useEffect(() => {
  const venueAdmin = sessionStorage.getItem("venueAdmin");
  if (venueAdmin) {
    window.location.href = "/venue-dashboard";
  }
}, []);


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
            const code = jsQR(imageData.data, imageData.width, imageData.height);

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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(animationId);
    };

    if (scanning) startCamera();

    return () => {
      stopCamera();
    };
  }, [scanning]);

  const handleScan = async (data) => {
    try {
      const participant = await getParticipantById(data);
      if (!participant) {
        setMessage("❌ No participant found with this QR!");
        return;
      }

      if (participant.isUsed) {
        setSwitchCard(participant);
      } else {
        // --- Minimal change starts here ---
        // When scanning first time: set isUsed true.
        // If paymentId equals "DONE DONE YET" (case-insensitive, trimmed),
        // update it to "DONE - VIA CASH" as well.
        const updates = { isUsed: true };
        const paymentIdRaw = participant.paymentId;
        if (
          typeof paymentIdRaw === "string" &&
          paymentIdRaw.trim().toUpperCase() === "NOT DONE YET"
        ) {
          updates.paymentId = "DONE - VIA CASH";
        }

        await updateParticipant(participant.participantId, updates);

        // reflect updates in local object for UI
        participant.isUsed = true;
        if (updates.paymentId) participant.paymentId = updates.paymentId;
        // --- Minimal change ends here ---

        setDirection("inside");
        setMessage("✅ Participant verified successfully (INSIDE)");
      }

      setScanResult(participant);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error verifying participant!");
    }
  };

  const handleSwitchDirection = async (participant, approve) => {
    if (approve) {
      const newDirection = direction === "inside" ? "outside" : "inside";
      await updateParticipant(participant.participantId, {
        isUsed: newDirection === "inside",
      });
      participant.isUsed = newDirection === "inside";
      setDirection(newDirection);
      setMessage(`✅ Participant status updated: now ${newDirection.toUpperCase()}`);
      setScanResult(participant);
    } else {
      setMessage("❌ No changes made.");
    }
    setSwitchCard(null);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#800000] mb-4 sm:mb-6 text-center">
        QR Code Scanner
      </h1>

      <p className="text-base sm:text-lg lg:text-xl font-semibold text-[#800000] mb-4 text-center">
        Entry Pass Scanner
      </p>

      {/* Camera Container */}
      <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md h-64 sm:h-80 lg:h-96 border-4 border-dashed border-[#800000] rounded-lg mb-4 flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
        {!scanning && (
          <p className="text-gray-600 z-10 text-sm sm:text-base">[Camera Preview Here]</p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {!scanning && (
          <button
            onClick={() => {
              setScanResult(null);
              setMessage("");
              setCameraError("");
              setScanning(true);
            }}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-[#800000] text-white rounded-lg shadow hover:bg-[#a83232] text-sm sm:text-base"
          >
            {scanResult ? "Scan Another QR" : "Start Scanning"}
          </button>
        )}
        {scanning && (
          <button
            onClick={() => setScanning(false)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-700 text-sm sm:text-base"
          >
            Back
          </button>
        )}
      </div>

      {/* Camera Error */}
      {cameraError && (
        <p className="mt-2 text-sm sm:text-base text-red-600 font-semibold text-center">
          {cameraError}
        </p>
      )}

      {/* Message Card */}
      {message && (
        <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md p-4 mb-2 rounded-lg shadow bg-white border-l-4 border-green-600 text-green-800 font-semibold text-sm sm:text-base">
          {message}
        </div>
      )}

      {/* Switch Direction Card */}
      {switchCard && (
        <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md p-4 mb-2 rounded-lg shadow bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 font-semibold text-sm sm:text-base">
          ⚠️ Ticket already {direction === "inside" ? "entered" : "exited"}!
          <div className="mt-2 flex flex-wrap gap-2 sm:gap-4 justify-center">
            <button
              onClick={() => handleSwitchDirection(switchCard, true)}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-sm sm:text-base"
            >
              Switch Direction
            </button>
            <button
              onClick={() => handleSwitchDirection(switchCard, false)}
              className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Participant Details */}
      {scanResult && (
        <div className="mt-4 sm:mt-6 bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-[#800000] text-center">
            Participant Details
          </h2>
          <div className="text-sm sm:text-base space-y-1">
            <p><strong>ID:</strong> {scanResult.participantId}</p>
            <p><strong>Name:</strong> {scanResult.name}</p>
            <p><strong>Pass Type:</strong> {scanResult.passType}</p> {/* updated */}
            <p><strong>Mobile:</strong> {scanResult.mobile}</p>
            <p><strong>Number of People:</strong> {scanResult.numberOfPeople}</p> {/* updated */}
            <p><strong>Payment ID:</strong> {scanResult.paymentId}</p>
            <p>
              <strong>Direction:</strong>{" "}
              {direction === "inside" ? (
                <span className="text-green-600">OUTSIDE ➡️ INSIDE</span>
              ) : (
                <span className="text-red-600">INSIDE ➡️ OUTSIDE</span>
              )}
            </p>
            <p>
              <strong>Entered:</strong>{" "}
              {scanResult.isUsed ? (
                <span className="text-green-600">Yes</span>
              ) : (
                <span className="text-red-600">No</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
