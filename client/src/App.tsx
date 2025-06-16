import { Routes, Route } from "react-router-dom";
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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/lib/websocketService";
import Cookies from "js-cookie";
import { initGA, trackPage, setUserId} from "./analytics";
import { useLocation } from 'react-router-dom';
// import ProductPage from "./product-page";
// import CartPage from "./components/products/cart-page";


function App() {

  const [liveUsers, setLiveUsers] = useState(0);
  const location = useLocation();

 useEffect(() => {
  initGA();

  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user && user._id) {
        setUserId(user._id);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }
}, []);

   useEffect(() => {
    trackPage(location.pathname + location.search);
  }, [location]);


  
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const socket = getSocket();
    if (!socket) return;

    socket.on("liveUsers", (count: number) => {
      setLiveUsers(count);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Layout>
          <Routes>
           <Route path="/share/:id" element={<ShareMain/>}/>
           <Route element={<PrivateRoutes/>}>
            <Route path="/" element={<Home/>}/>
            <Route path="/error" element={<ErrorPage/>}/>
            <Route path="/trip/:id" element={<TripDetails/>}/>
            <Route path="/bag/:id" element={ <DndProvider backend={HTML5Backend}><BagDetails/></DndProvider>} />
            <Route path="/articles" element={<ArticleMain/>}/>
            <Route path="/article/:id" element={<ArticleInner/>}/>
            <Route path="/community" element={<Community/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/changelog" element={<ChangeLog/>}/>
            <Route path="/contact-us" element={<ReportBug/>}/>
            <Route path="/admin" element={<AdminPanel liveUsers={liveUsers} />}/>
           
            
            </Route>
            <Route element={<PublicRoutes />}>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/new-password/:token" element={<NewPassword/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>
            <Route path="/verify-account/:id" element={<VerifyAccount/>}/>
            <Route path="/welcome" element={ <DndProvider backend={HTML5Backend}><Welcome/> </DndProvider> }/>
            </Route>
          </Routes>
        </Layout>
    </ThemeProvider>
  );
}

export default App;
