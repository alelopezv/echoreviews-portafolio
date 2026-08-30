import { ReviewForm } from "./ReviewForm";

export function WritePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <ReviewForm onClose={() => window.history.back()} />
      </div>
    </div>
  );
}