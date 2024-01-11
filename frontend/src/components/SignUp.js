import { Link } from "react-router-dom";

export default function SignUp(){
    
    return(
        <body>
            <div className="main-div-sign-up main-div">
                <h2 className="login-heading">Sign Up</h2>
                <form >
                <label for="first-name" className="email-label">First Name</label><br/>
                    <input type="text" id="first-name" className="email-input" required/>

                    <label for="last-name" className="email-label">Last Name</label><br/>
                    <input type="text" id="last-name" className="email-input" required/>

                    <label for="email" className="email-label">Email</label><br/>
                    <input type="email" id="email" className="email-input" required/>

                    <label for="password" className="email-label password-lable">Password</label><br/>
                    <input type="password" id="password" className="email-input" required/>
                    <p className="sign-up-paragraph">Already a member? <Link to='/'>Log In</Link></p>
                    <button type="submit" >SIGN UP</button>
                
                    
                    
                </form>
            </div>
        </body>
    )
}