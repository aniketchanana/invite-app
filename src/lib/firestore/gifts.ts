import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
} from "firebase/firestore";

export interface Gift {
  id: string;
  itemName: string;
  link: string | null;
  isClaimed: boolean;
  claimedBy: string | null;
}

export interface GiftInput {
  name: string;
  link: string;
}

function giftsRef(inviteId: string) {
  return collection(db, "invites", inviteId, "gifts");
}

export async function addGift(
  inviteId: string,
  itemName: string,
  link?: string
): Promise<string> {
  const docRef = await addDoc(giftsRef(inviteId), {
    itemName,
    link: link?.trim() || null,
    isClaimed: false,
    claimedBy: null,
  });
  return docRef.id;
}

export async function addGifts(
  inviteId: string,
  items: GiftInput[]
): Promise<void> {
  const ref = giftsRef(inviteId);
  await Promise.all(
    items.map((item) =>
      addDoc(ref, {
        itemName: item.name,
        link: item.link?.trim() || null,
        isClaimed: false,
        claimedBy: null,
      })
    )
  );
}

export async function getGifts(inviteId: string): Promise<Gift[]> {
  const snap = await getDocs(giftsRef(inviteId));
  return snap.docs.map((s) => {
    const d = s.data();
    return {
      id: s.id,
      itemName: d.itemName,
      link: d.link ?? null,
      isClaimed: d.isClaimed,
      claimedBy: d.claimedBy,
    };
  });
}

export async function getAvailableGifts(inviteId: string): Promise<Gift[]> {
  const q = query(giftsRef(inviteId));
  const snap = await getDocs(q);
  return snap.docs.map((s) => {
    const d = s.data();
    return {
      id: s.id,
      itemName: d.itemName,
      link: d.link ?? null,
      isClaimed: d.isClaimed,
      claimedBy: d.claimedBy,
    };
  });
}

export async function claimGifts(
  inviteId: string,
  giftIds: string[],
  claimedBy: string
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const refs = giftIds.map((gid) =>
      doc(db, "invites", inviteId, "gifts", gid)
    );
    const snaps = await Promise.all(refs.map((r) => transaction.get(r)));

    for (const snap of snaps) {
      if (!snap.exists()) throw new Error("Gift no longer exists");
      if (snap.data().isClaimed) throw new Error("Gift already claimed");
    }

    for (const ref of refs) {
      transaction.update(ref, { isClaimed: true, claimedBy });
    }
  });
}

export async function removeGift(
  inviteId: string,
  giftId: string
): Promise<void> {
  await deleteDoc(doc(db, "invites", inviteId, "gifts", giftId));
}
