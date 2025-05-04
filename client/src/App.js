import { Routes, Route } from "react-router-dom";
import {
  Home,
  About,
  Signup,
  Contact,
  NotFound,
  Login,
} from "./pages/publicPages";
import {
  JobSeekerDashboard,
  JobList,
  JobDetails,
  UserApplications,
  UserApplicationDetails,
  UserProfile,
} from "./pages/dashboards/jobSeeker";
import {
  RecruiterDashboard,
  NewJobPost,
  AllJobs,
  JobPostDetails,
  Applications,
  ResumeScreening,
  ScheduleInterview,
  SendFeedback,
  RecruiterProfile,
  CreateReferralPost,
} from "./pages/dashboards/recruiter";
import { RecruiterAuth, UserAuth } from "./pages/auth";
import JobListings from "./pages/dashboards/recruiter/JobListings";
import ApplyReferral from "./pages/dashboards/jobSeeker/ApplyReferral";
import CreateReferralPost from "./pages/publicPages/CreateReferralPost";

export default function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/">
        <Route index element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/contact" element={<Contact />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/create-new-account" element={<Signup />}></Route>
        <Route path="/recruiter" element={<RecruiterAuth />}></Route>
        <Route path="/user" element={<UserAuth />}></Route>
        <Route path="/create-referral" element={<CreateReferralPost />}></Route>
        <Route path="/referral/:id/apply" element={<ApplyReferral />}></Route>
      </Route>

      {/* Job Seeker routes */}
      <Route path="user-dashboard" element={<JobSeekerDashboard />}>
        <Route path="find-job" element={<JobList />} />
        <Route path="job-details/:id" element={<JobDetails />} />
        <Route path="applications" element={<UserApplications />} />
        <Route path="applications/:id" element={<UserApplicationDetails />} />
        <Route path="user-profile" element={<UserProfile />} />
      </Route>

      {/* Recruiter routes */}
      <Route path="recruiter-dashboard" element={<RecruiterDashboard />}>
        <Route path="create-new-job" element={<NewJobPost />} />
        <Route path="all-jobs" element={<JobListings />} />
        <Route path="jobs/:id" element={<JobPostDetails />} />
        <Route path="jobs/:jobId/applications" element={<Applications />} />
        <Route path="profile" element={<RecruiterProfile />} />
        <Route path="create-referral" element={<CreateReferralPost />} />
      </Route>

      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
}
