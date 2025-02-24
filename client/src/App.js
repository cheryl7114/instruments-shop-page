import React, { Component } from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import "./css/App.css"

import Navbar from "./components/Navbar"
import Register from "./components/Register"
import ResetDatabase from "./components/ResetDatabase"
import Login from "./components/Login"
import Logout from "./components/Logout"
import AddProduct from "./components/AddProduct"
import EditProduct from "./components/EditProduct"
import DeleteProduct from "./components/DeleteProduct"
import DisplayAllProducts from "./components/DisplayAllProducts"
import ProductDetails from "./components/ProductDetails"
import UserProfile from "./components/UserProfile"
import LoggedInRoute from "./components/LoggedInRoute"

import { ACCESS_LEVEL_GUEST } from "./config/global_constants"

if (typeof localStorage.accessLevel === "undefined") {
    localStorage.name = "GUEST"
    localStorage.accessLevel = ACCESS_LEVEL_GUEST
    localStorage.token = null
    localStorage.profilePhoto = null
}

export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
            <div>
                <Navbar />
                <Switch>
                    <Route exact path="/ProductDetails/:id" component={ProductDetails} />
                    <Route exact path="/Register" component={Register} />
                    <Route exact path="/ResetDatabase" component={ResetDatabase} />
                    <Route exact path="/" component={DisplayAllProducts} />
                    <Route exact path="/Login" component={Login} />
                    <LoggedInRoute exact path="/Logout" component={Logout} />
                    <LoggedInRoute exact path="/AddProduct" component={AddProduct} />
                    <LoggedInRoute exact path="/EditProduct/:id" component={EditProduct} />
                    <LoggedInRoute exact path="/DeleteProduct/:id" component={DeleteProduct} />
                    <LoggedInRoute path="/UserProfile/:id" component={UserProfile} />
                    <Route exact path="/DisplayAllProducts" component={DisplayAllProducts}/>
                    <Route path="*" component={DisplayAllProducts}/>
                </Switch>
                </div>
            </BrowserRouter>
        )
    }
}