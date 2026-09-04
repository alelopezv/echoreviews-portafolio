import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./components/HomePage";
import { ReviewDetailPage } from "./components/ReviewDetailPage";
import { WritePage } from "./components/WritePage";
import { HashtagPage } from "./components/HashtagPage";
import { AllHashtagsPage } from "./components/AllHashtagsPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { ProfilePage } from "./components/ProfilePage";
import { AllReviewsPage } from "./components/AllReviewsPage";
import { MediaPage } from "./components/MediaPage";
import { MediaDetailPage } from "./components/MediaDetailPage";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "profile", element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: "review/:id", element: <ReviewDetailPage /> },
      // Escribir y el perfil exigen sesión: sin token la API responde 401
      // y el usuario quedaría frente a una página que no puede usar.
      { path: "write", element: <RequireAuth><WritePage /></RequireAuth> },
      { path: "hashtag/:tag", element: <HashtagPage /> },
      { path: "hashtags", element: <AllHashtagsPage /> },
      { path: "all-reviews", element: <AllReviewsPage /> },
      { path: "media", element: <MediaPage /> },
      // La ruta con :id va DESPUÉS de la fija. React Router evalúa en
      // orden, y ":id" también casaría con la palabra "media" suelta.
      { path: "media/:id", element: <MediaDetailPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
