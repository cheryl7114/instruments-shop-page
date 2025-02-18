import React, { Component } from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import "./css/App.css"

import Navbar from "./components/Navbar"
// import Register from "./components/Register"
import ResetDatabase from "./components/ResetDatabase"
import Login from "./components/Login"
import Logout from "./components/Logout"
import AddProduct from "./components/AddProduct"
// import EditCar from "./components/EditCar"
// import DeleteCar from "./components/DeleteCar"
import DisplayAllProducts from "./components/DisplayAllProducts"
import LoggedInRoute from "./components/LoggedInRoute"

import { ACCESS_LEVEL_GUEST } from "./config/global_constants"

if (typeof localStorage.accessLevel === "undefined") {
    localStorage.name = "GUEST"
    localStorage.accessLevel = ACCESS_LEVEL_GUEST
    localStorage.token = null
}


export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Navbar />
                    <Switch>
                        {/*<Route exact path="/Register" component={Register} />*/}
                        <Route exact path="/ResetDatabase" component={ResetDatabase} />
                        <Route exact path="/" component={DisplayAllProducts} />
                        <Route exact path="/Login" component={Login} />
                        <LoggedInRoute exact path="/Logout" component={Logout} />
                        <LoggedInRoute exact path="/AddProduct" component={AddProduct} />
                        {/*<LoggedInRoute exact path="/EditCar/:id" component={EditCar} />*/}
                        {/*<LoggedInRoute exact path="/DeleteCar/:id" component={DeleteCar} />*/}
                        <Route exact path="/DisplayAllProducts" component={DisplayAllProducts} />
                        <Route path="*" component={DisplayAllProducts} />
                    </Switch>
                </div>
            </BrowserRouter>
        )
    }
}