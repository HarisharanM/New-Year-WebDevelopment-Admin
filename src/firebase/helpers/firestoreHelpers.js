import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const participantCollection = collection(db, 'participants');

/* ================= SAVE PARTICIPANT ================= */
export const saveParticipant = async (formData, paymentData = null) => {
  try {
    const participantId = `P${Date.now()}`;

    const finalData = {
      participantId,
      ...formData,

      // ✅ ALWAYS use Firestore timestamp going forward
      createdAt: serverTimestamp(),

      ...(paymentData ? { payment: paymentData } : {}),
    };

    await setDoc(doc(db, 'participants', participantId), finalData);

    console.log('Participant saved with ID:', participantId);
    return participantId;
  } catch (e) {
    console.error('Error saving participant:', e);
    throw e;
  }
};

/* ================= GET ALL PARTICIPANTS (LATEST FIRST, SAFE) ================= */
export const getAllParticipants = async () => {
  try {
    const q = query(
      participantCollection,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // 🛡️ SAFETY SORT (handles old/broken records)
    data.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return data;
  } catch (e) {
    console.error('Error fetching participants:', e);
    throw e;
  }
};

/* ================= UPDATE PARTICIPANT ================= */
export const updateParticipant = async (participantId, updatedData) => {
  try {
    const docRef = doc(db, 'participants', participantId);
    await updateDoc(docRef, updatedData);
    console.log(`Participant ${participantId} updated successfully.`);
  } catch (e) {
    console.error('Error updating participant:', e);
    throw e;
  }
};

/* ================= DELETE PARTICIPANT ================= */
export const deleteParticipant = async (participantId) => {
  try {
    const docRef = doc(db, 'participants', participantId);
    await deleteDoc(docRef);
    console.log(`Participant ${participantId} deleted successfully.`);
  } catch (e) {
    console.error('Error deleting participant:', e);
    throw e;
  }
};

/* ================= GET PARTICIPANT BY ID ================= */
export const getParticipantById = async (id) => {
  try {
    const docRef = doc(db, "participants", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { participantId: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (e) {
    console.error("Error fetching participant:", e);
    return null;
  }
};
