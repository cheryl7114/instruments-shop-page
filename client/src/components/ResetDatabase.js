import React, {Component} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios"

import {SERVER_HOST} from "../config/global_constants"


export default class ResetDatabase extends Component
{
    constructor(props)
    {
        super(props)
        
        this.state = {   
            isReset:false
        } 
    }
    
    
    handleChange = (e) => 
    {
        this.setState({[e.target.name]: e.target.value})
    }
    

    resetUsersModel = () =>
    {
        axios.post(`${SERVER_HOST}/users/reset_user_collection`)
        .then(res => 
        {     
            if(res.data)
            {
                if (res.data.errorMessage)
                {
                    console.log(res.data.errorMessage)    
                }
                else // user successfully reset the User collection
                { 
                    console.log("User collection reset")
                }        
            }
            else
            {
                console.log("Failed to reset User collection")
            }
            
            this.setState({isReset:true})
        })   
    }



    render() 
    { 
        return (
            <form className="form-container" noValidate = {true} id = "loginOrRegistrationForm">

               {this.state.isReset ? <Redirect to="/DisplayAllCars"/> : null} 

                <p>"Reset User Database" is only for testing purposes.<br/>All code on the client-side and server-side relating to resetting the database should be removed from any development release</p>
                <button value="Reset User Database" className="red-button" onClick={this.resetUsersModel}/> <br/><br/>

                <Link className="red-button" to={"/DisplayAllCars"}>Cancel</Link>
            </form>
        )
    }
}