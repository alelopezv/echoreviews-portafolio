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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "review/:id", element: <ReviewDetailPage /> },
      { path: "write", element: <WritePage /> },
      { path: "hashtag/:tag", element: <HashtagPage /> },
      { path: "hashtags", element: <AllHashtagsPage /> },
      { path: "all-reviews", element: <AllReviewsPage /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "media", element: <MediaPage /> },
    ],
  },
]);
