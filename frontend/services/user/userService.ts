export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
};

const API_BASE_URL = "http://localhost:8000";

export async function loginUser(credentials: LoginRequest): Promise<AuthToken> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorMessage = "Failed to log in.";

    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") {
        errorMessage = errorBody.detail;
      }
    } catch {
      // Ignore JSON parsing errors and use the default message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function registerUser(userData: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    let errorMessage = "Failed to sign up.";

    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") {
        errorMessage = errorBody.detail;
      }
    } catch {
      // Ignore JSON parsing errors and use the default message.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
