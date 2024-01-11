import React from "react";
import {Routes, Route} from 'react-router-dom'
import Login from "./components/Login";
import "./styles/app.css"
import Home from './components/Home.js';
import SignUp from "./components/SignUp";
 

export default function App(){
  return(
      <Routes>
        <Route path="/" element ={<Login/>}/>
        <Route path="sign-up" element ={<SignUp/>}/>
        <Route path ='home' element={<Home/>}/>
      </Routes>
     )
}
