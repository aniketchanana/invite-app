import { doc, getDoc, setDoc, Timestamp, type Timestamp as FirebaseTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  id: string;
  email: string | null;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileFormData {
  displayName: string;
  photoURL?: string;
  bio?: string;
}

const COLLECTION = "users";

function toDateOrUndefined(v: unknown): Date | undefined {
  // Firestore stores these as Timestamp; we defensively support missing fields
  // because the app currently creates users with only { uid, email } at signup.
  const ts = v as FirebaseTimestamp | undefined | null;
  return typeof ts?.toDate === "function" ? ts.toDate() : undefined;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTION, userId));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    email: (data.email ?? null) as string | null,
    displayName: (data.displayName ?? undefined) as string | undefined,
    photoURL: (data.photoURL ?? undefined) as string | undefined,
    bio: (data.bio ?? undefined) as string | undefined,
    createdAt: toDateOrUndefined(data.createdAt),
    updatedAt: toDateOrUndefined(data.updatedAt),
  };
}

export async function createUserProfile(
  userId: string,
  email: string,
  profileData: UserProfileFormData
): Promise<void> {
  const now = Timestamp.now();
  await setDoc(doc(db, COLLECTION, userId), {
    email,
    displayName: profileData.displayName,
    photoURL: profileData.photoURL || null,
    bio: profileData.bio || null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfileFormData>
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, userId),
    {
      ...profileData,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}