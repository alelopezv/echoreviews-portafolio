const API_URL = "http://127.0.0.1:5173/api";

export async function getReviews() {
  const res = await fetch(`${API_URL}/reviews/?status=approved`);
  return res.json();
}

export async function getReviewById(id: string) {
  const res = await fetch(`${API_URL}/reviews/${id}/`);
  return res.json();
}

export async function getReviewsByCategory(category: string) {
  const res = await fetch(`${API_URL}/media/?type=${category}`);
  return res.json();
}