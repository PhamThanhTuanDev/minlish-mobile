import { API_BASE_URL } from "../config";
import { clearSession, getAccessToken, saveAccessToken, saveUserEmail } from "../storage/authStorage";
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile, VocabularySet, VocabularyWord, LearningStats } from "../types/api";

async function request<T>(path: string, init?: RequestInit, includeAuth = true): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (includeAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401 || response.status === 403) {
      await clearSession();
    }
    throw new Error(`Request failed ${response.status}: ${errorText || response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

export async function login(payload: LoginRequest): Promise<void> {
  const result = await request<AuthResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false
  );

  const token = result.accessToken ?? result.token;
  if (!token) {
    throw new Error("Login succeeded but token is missing.");
  }

  await saveAccessToken(token);
  if (result.email) {
    await saveUserEmail(result.email);
  }
}

export async function register(payload: RegisterRequest): Promise<void> {
  const result = await request<AuthResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false
  );

  const token = result.accessToken ?? result.token;
  if (!token) {
    throw new Error("Register succeeded but token is missing.");
  }

  await saveAccessToken(token);
  if (result.email) {
    await saveUserEmail(result.email);
  }
}

export async function loginWithGoogle(payload: { idToken?: string; accessToken?: string }): Promise<void> {
  const result = await request<AuthResponse>(
    "/api/auth/google",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false
  );

  const token = result.accessToken ?? result.token;
  if (!token) {
    throw new Error("Google login succeeded but token is missing.");
  }

  await saveAccessToken(token);
  if (result.email) {
    await saveUserEmail(result.email);
  }
}

export async function getMyProfile(): Promise<UserProfile> {
  const raw = await request<any>("/api/users/profile");
  return {
    userId: String(raw?.id ?? raw?.userId ?? ""),
    email: String(raw?.email ?? ""),
    fullName: String(raw?.fullName ?? ""),
    learningGoal: raw?.learningGoal ? String(raw.learningGoal) : undefined,
    level: raw?.level ? String(raw.level) : undefined,
  };
}

// Vocabulary APIs
export async function fetchVocabularySets(): Promise<VocabularySet[]> {
  const raw = await request<any[]>("/api/vocabulary/sets");
  return raw.map(parseIsoSet);
}

export async function fetchVocabularySet(id: string): Promise<VocabularySet> {
  const raw = await request<any>(`/api/vocabulary/sets/${id}`);
  return parseIsoSet(raw);
}

export async function saveVocabularySet(set: VocabularySet): Promise<VocabularySet> {
  const raw = await request<any>("/api/vocabulary/sets", {
    method: "POST",
    body: JSON.stringify(set),
  });
  return parseIsoSet(raw);
}

export async function updateVocabularySet(id: string, set: Partial<VocabularySet>): Promise<VocabularySet> {
  const raw = await request<any>(`/api/vocabulary/sets/${id}`, {
    method: "PUT",
    body: JSON.stringify(set),
  });
  return parseIsoSet(raw);
}

export async function fetchLearningStats(): Promise<LearningStats> {
  return request<LearningStats>("/api/learning/stats");
}

export async function submitQuizAnswer(
  wordId: string,
  setId: string,
  isCorrect: boolean,
  timeSpent: number
): Promise<{ nextReview: Date; easeFactor: number }> {
  const raw = await request<any>("/api/learning/submit", {
    method: "POST",
    body: JSON.stringify({ wordId, setId, isCorrect, timeSpent }),
  });
  return {
    nextReview: new Date(raw.nextReview),
    easeFactor: raw.easeFactor,
  };
}

// Helper functions
function parseIsoSet(set: any): VocabularySet {
  return {
    id: String(set.id ?? ""),
    name: String(set.name ?? ""),
    description: String(set.description ?? ""),
    tags: Array.isArray(set.tags) ? set.tags : [],
    createdAt: new Date(set.createdAt ?? Date.now()),
    updatedAt: new Date(set.updatedAt ?? Date.now()),
    words: Array.isArray(set.words) ? set.words.map(parseIsoWord) : [],
  };
}

function parseIsoWord(word: any): VocabularyWord {
  return {
    id: String(word.id ?? ""),
    setId: word.setId ? String(word.setId) : undefined,
    word: String(word.word ?? ""),
    pronunciation: String(word.pronunciation ?? ""),
    meaning: String(word.meaning ?? ""),
    description: String(word.description ?? ""),
    descriptionVi: word.descriptionVi ? String(word.descriptionVi) : undefined,
    example: String(word.example ?? ""),
    exampleVi: word.exampleVi ? String(word.exampleVi) : undefined,
    collocation: String(word.collocation ?? ""),
    relatedWords: String(word.relatedWords ?? ""),
    note: String(word.note ?? ""),
    type: word.type ? String(word.type) : undefined,
    level: word.level ? String(word.level) : undefined,
    easeFactor: Number(word.easeFactor ?? 2.5),
    interval: Number(word.interval ?? 0),
    repetitions: Number(word.repetitions ?? 0),
    nextReview: new Date(word.nextReview ?? Date.now()),
    lastReviewed: word.lastReviewed ? new Date(word.lastReviewed) : undefined,
    correctCount: Number(word.correctCount ?? 0),
    incorrectCount: Number(word.incorrectCount ?? 0),
  };
}
