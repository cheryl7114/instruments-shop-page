import React, {Component} from "react"
import {Link, Route, Switch} from "react-router-dom"

import axios from "axios"

import Logout from "./Logout"

import {ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST} from "../config/global_constants"
import AccountDetails from "./AccountDetails"
import MyOrders from "./MyOrders"
import PurchaseHistory from "./PurchaseHistory"
import Returns from "./Returns"

export default class UserProfile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: {}
        }
    }

    componentDidMount() {    
        axios.get(`${SERVER_HOST}/users/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                console.log("User API response:", res.data);
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log("Error message:", res.data.errorMessage);
                    } else {
                        this.setState({ user: res.data });
                        console.log("User details retrieved:", res.data);
                    }
                } else {
                    console.log("User not found");
                }
            })
            .catch(err => {
                console.error("Error fetching user:", err);
                // Try to get response details if available
                if (err.response) {
                    console.error("Response data:", err.response.data);
                    console.error("Response status:", err.response.status);
                }
            });
    }

    render() {
        const { user } = this.state
        const { match } = this.props

        if (!user || !user.name) {
            return <div>Loading...</div>
        }

        return (
            <div className="body-container">
                <div className="sidebar-container">
                    <h1>User Profile</h1>
                    <div className="sidebar-with-content">
                        <div className="sidebar">
                            <h2>Hi, {user.name}!</h2>
                            <hr />
                            {/*<Link className="sidebar-choices" to={`${match.url}/account-details`}>Account Details</Link>*/}
                            {/*<Link className="sidebar-choices" to={`${match.url}/purchase-history`}>Purchase History</Link>*/}
                            {/*<Link className="sidebar-choices" to={`${match.url}/my-orders`}>My Orders</Link>*/}
                            {/*<Link className="sidebar-choices" to={`${match.url}/returns`}>Returns</Link>*/}
                            <Link className="sidebar-choices" to={`${match.url}/account-details`}>Account Details</Link>
                            {localStorage.accessLevel > ACCESS_LEVEL_GUEST && localStorage.accessLevel < ACCESS_LEVEL_ADMIN ? (
                                <>
                                    <Link className="sidebar-choices" to={`${match.url}/purchase-history`}>Purchase History</Link>
                                    <Link className="sidebar-choices" to={`${match.url}/my-orders`}>My Orders</Link>
                                    <Link className="sidebar-choices" to={`${match.url}/returns`}>Returns</Link>
                                </>
                            ) : null}
                            {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ? (
                                <>
                                    <Link className="sidebar-choices" to={`${match.url}/purchase-history`}>View Customers</Link>
                                    <Link className="sidebar-choices" to={`${match.url}/my-orders`}>My Orders</Link>
                                    <Link className="sidebar-choices" to={`${match.url}/returns`}>Returns</Link>
                                </>
                            ) : null}
                        </div>
                        {/*{localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ? <Link className="red-button" to={"/DeleteProduct/" + product._id}>Delete</Link> : null}*/}
                        <div className="content">
                            <Switch>
                                {localStorage.accessLevel > ACCESS_LEVEL_GUEST && localStorage.accessLevel < ACCESS_LEVEL_ADMIN ? (
                                    <>
                                        <Route path={`${match.url}/purchase-history`} component={PurchaseHistory} />
                                        <Route path={`${match.url}/my-orders`} component={MyOrders} />
                                        <Route path={`${match.url}/returns`} component={Returns} />
                                    </>
                                ) : null}
                                <Route path={`${match.url}/account-details`} render={(props) => <AccountDetails {...props} user={user} />} />
                                <Route path={`${match.url}`} exact render={(props) => <AccountDetails {...props} user={user} />} />
                            </Switch>
                            <Logout />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}