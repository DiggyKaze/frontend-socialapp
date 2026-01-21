import './App.css'
import LoginForm from "./components/LoginForm.jsx";
import {Navigate, Route, Routes} from "react-router-dom";
import Feed from "./components/Feed.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Wall from "./components/Wall.jsx";
import Layout from "./components/Layout.jsx";
import RegisterForm from "./components/RegisterForm.jsx";

/*
 * App
 *
 * Innehåller applikationens routing.
 * Definierar vilka sidor som finns och vilka som är skyddade
 * med hjälp av ProtectedRoute.
 */

function App() {


    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="/" element={<Layout/>}>

                <Route path="/login" element={<LoginForm/>}/>
                <Route path="/register" element={<RegisterForm/>}/>

                {/* Skyddad sektion */}
                <Route element={<ProtectedRoute/>}>
                    <Route path="/feed" element={<Feed/>}/>
                    <Route path="/wall/:userId" element={<Wall/>}/>
                </Route>
            </Route>

        </Routes>

    )
}

export default App;
