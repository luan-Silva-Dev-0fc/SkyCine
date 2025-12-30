"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDz6mdcZQ_Z3815u50nJCjqy4GEOyndn5k",
  authDomain: "skycine-c59b0.firebaseapp.com",
  projectId: "skycine-c59b0",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function GroupInvites() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/");
        return;
      }

      setUser(u);

      const q = query(
        collection(db, "groupInvites"),
        where("to", "==", u.uid),
        where("status", "==", "pending")
      );

      onSnapshot(q, (snap) => {
        setInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    });

    return () => unsub();
  }, [router]);

  const aceitar = async (invite) => {
    await updateDoc(doc(db, "chats", invite.chatId), {
      members: arrayUnion(user.uid),
    });

    await deleteDoc(doc(db, "groupInvites", invite.id));
  };

  const recusar = async (inviteId) => {
    await deleteDoc(doc(db, "groupInvites", inviteId));
  };

  return (
    <div className="h-screen bg-[#0b141a] text-white p-4">
      <h1 className="text-xl font-semibold mb-4">Convites de grupo</h1>

      {invites.length === 0 && (
        <p className="text-gray-400">Nenhum convite pendente</p>
      )}

      {invites.map((invite) => (
        <div
          key={invite.id}
          className="bg-[#202c33] p-4 rounded-lg mb-3"
        >
          <p className="font-medium">{invite.groupName}</p>
          <p className="text-sm text-gray-400 mb-3">
            Você foi convidado para este grupo
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => aceitar(invite)}
              className="bg-green-500 text-black px-4 py-1 rounded"
            >
              Aceitar
            </button>
            <button
              onClick={() => recusar(invite.id)}
              className="bg-red-500 px-4 py-1 rounded"
            >
              Recusar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
