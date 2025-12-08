export type GenerateVideoRequest = {
  userId: number;
  positivePrompt: string;
  negativePrompt?: string;
  image?: File | null;
};

export type GeneratedVideo = {
  id: number;
  user_id: number;
  input_image?: string | null;
  positive_prompt?: string | null;
  negative_prompt?: string | null;
  duration?: number | null;
  resolution?: string | null;
  width?: number | string | null;
  height?: number | string | null;
  fps?: number | string | null;
  localpath?: string | null;
  filename?: string | null;
  format?: string | null;
  source_video?: string | null;
  created_at?: string;
};

const API_BASE_URL = "http://localhost:8000";

export async function generateVideo(
  payload: GenerateVideoRequest,
): Promise<GeneratedVideo> {
  const formData = new FormData();
  formData.append("user_id", payload.userId.toString());
  formData.append("positive_prompt", payload.positivePrompt);

  if (payload.negativePrompt) {
    formData.append("negative_prompt", payload.negativePrompt);
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/videos/generate`, {
    method: "POST",
    body: formData,
  });

  console.log({ formData });

  if (!response.ok) {
    let errorMessage = `Failed to trigger video generation (status ${response.status})`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") {
        errorMessage = errorBody.detail;
      } else if (
        errorBody?.detail &&
        typeof (errorBody.detail as { message?: unknown }).message === "string"
      ) {
        errorMessage = (errorBody.detail as { message: string }).message;
      } else if (typeof errorBody.message === "string") {
        errorMessage = errorBody.message;
      }
    } catch {
      try {
        const fallbackText = await response.text();
        if (fallbackText) {
          errorMessage = fallbackText;
        }
      } catch {
        // Ignore parsing errors and keep the default message
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getCurrentUserId(): Promise<number | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as { id?: number };
    return typeof user.id === "number" ? user.id : null;
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return null;
  }
}
