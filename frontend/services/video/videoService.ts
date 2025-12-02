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
  duration?: number | string | null;
  resolution?: string | null;
  width?: number | string | null;
  height?: number | string | null;
  fps?: number | string | null;
  localpath?: string | null;
  filename?: string | null;
  format?: string | null;
  created_at?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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

  if (!response.ok) {
    let errorMessage = "Failed to trigger video generation.";

    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") {
        errorMessage = errorBody.detail;
      }
    } catch {
      // Ignore JSON parsing issues and use the default message
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
