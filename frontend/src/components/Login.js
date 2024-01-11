import React from "react";
import {Link, useNavigate} from 'react-router-dom'
//onClick={()=> navigate('home')}

export default function Login(){
    const navigate =useNavigate();
    
    function handleSubmit(event){
        event.preventDefault();
        navigate("home") 
    }
    
    return(
        <body>
            <div className="main-div">
                <h2 className="login-heading">Login branch 2</h2>
                <form onSubmit={handleSubmit}>
                    <label for="email" className="email-label">Email</label><br/>
                    <input type="email" id="email" className="email-input" required/>
                    <label for="password" className="email-label password-lable">Password</label><br/>
                    <input type="password" id="password" className="email-input" required/>
                    <p className="link-to-sign-up">Don't have an account?<Link to="sign-up">Sign Up</Link></p>
                    <button type="submit" >LOGIN</button>
                    <a href="./" className="anchor">Forgot Password?</a>
                    
                </form>
            </div>
        </body>
    )
}
