import React, { Component } from "react"
import axios from "axios";
import {SERVER_HOST} from "../config/global_constants";

export default class ViewCustomers extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: []
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/users`)
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else {
                        console.log("Records read")
                        this.setState({ users: res.data })
                    }
                }
                else {
                    console.log("Record not found")
                }
            })
    }

    render() {
        const users = this.state.users
        return(
            <div>
                <h2>View Customers</h2>
                {/*<p>`{users[0].name}`</p>*/}
            </div>
        )
    }
}
