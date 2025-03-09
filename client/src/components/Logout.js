import React, {Component} from "react"
import {Redirect} from "react-router-dom"
import axios from "axios"

import LinkInClass from "../components/LinkInClass"
import {SERVER_HOST} from "../config/global_constants"


export default class Logout extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoggedIn:true
        }
    }


    handleSubmit = (e) => {
        e.preventDefault()

        axios.post(`${SERVER_HOST}/users/logout`)
            .then(res => {
                if(res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        console.log("User logged out")

                        localStorage.clear();

                        // reload the page to reset Navbar state so user icon is updated
                        this.setState({isLoggedIn:false})
                        window.location.reload();
                    }
                } else {
                    console.log("Logout failed")
                }
            })
    }


    render()
    {
        return (
            <div>

                {!this.state.isLoggedIn ? <Redirect to="/"/> : null}

                <LinkInClass value="Log out" className="red-button" onClick={this.handleSubmit}/>
            </div>
        )
    }
}