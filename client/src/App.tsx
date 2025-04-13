import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "./components/home/Home";
import Login from "./components/account/login";
import Register from "./components/account/register";
import PublicRoutes from "./routes/public-routes";
import PrivateRoutes from "./routes/private-routes";
import ErrorPage from "./components/ui/error";
import TripDetails from "./components/trips/trip-details";
import BagDetails from "./components/bags/bag-details";
import ArticleMain from "./components/pages/article-main";
import ResetPassword from "./components/account/reset-password";
import ArticleInner from "./components/pages/article-inner";
import Community from "./components/pages/community";
import Settings from "./components/pages/settings";
import ChangeLog from "./components/pages/change-log";
import ReportBug from "./components/pages/report-bug";
import AdminPanel from "./components/admin/admin-panel";
import ShareMain from "./components/pages/share/share-main";
import VerifyAccount from "./components/pages/verify-account";
import NewPassword from "./components/account/steps/new-password";
import Welcome from "./components/pages/welcome";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Routes>
           <Route path="/share/:id" element={<ShareMain/>}/>
           <Route path="/verify-account/:id" element={<VerifyAccount/>}/>
           <Route path="/new-password/:token" element={<NewPassword/>}/>
           <Route path="/register" element={<Register/>}/>
           <Route path="/reset-password" element={<ResetPassword/>}/>
           <Route path="/welcome" element={<Welcome/>}/>
           <Route element={<PrivateRoutes/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/error" element={<ErrorPage/>}/>
            <Route path="/trip/:id" element={<TripDetails/>}/>
            <Route path="/bag/:id" element={<BagDetails/>} />
            <Route path="/articles" element={<ArticleMain/>}/>
            <Route path="/article/:id" element={<ArticleInner/>}/>
            <Route path="/community" element={<Community/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/changelog" element={<ChangeLog/>}/>
            <Route path="/bug-report" element={<ReportBug/>}/>
            <Route path="/admin" element={<AdminPanel/>}/>
            </Route>
         
            <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login/>}/>
            </Route>
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
