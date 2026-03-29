import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import Profile from "./pages/Profile";
import ProfileDetails from "./pages/ProfileDetails";
import Exams from "./pages/Exams";
import Courses from "./pages/Courses";
import Feed from "./pages/Feed";
import Notices from "./pages/Notices";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Schedule from "./pages/Schedule";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chats/:id" element={<ChatRoom />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/details" element={<ProfileDetails />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/academics" element={<Courses />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/results" element={<Results />} />
        {/* Default redirect to login for now */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
