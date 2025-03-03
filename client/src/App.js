import React, { Component } from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import axios from "axios"
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
import SortBy from "./components/SortBy"

import { SERVER_HOST, ACCESS_LEVEL_GUEST } from "./config/global_constants"

if (typeof localStorage.accessLevel === "undefined") {
    localStorage.name = "GUEST"
    localStorage.accessLevel = ACCESS_LEVEL_GUEST
    localStorage.token = null
    localStorage.profilePhoto = null
}

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            products: [],
            searchQuery: ""
        }
    }
    componentDidMount() {
        axios.get(`${SERVER_HOST}/products`)
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else {
                        console.log("Records read")
                        this.setState({ products: res.data })
                    }
                }
                else {
                    console.log("Record not found")
                }
            })
    }

    handleSearchChange = (e) => {
        // console.log("Search value: ", e.target.value) // test for search purposes
        this.setState({ searchQuery: e.target.value })
    }

    getFilteredProducts = () => {
        const { searchQuery, products } = this.state;

        if (!searchQuery || searchQuery.trim() === "") {
            return products;
        }

        return products.filter(product => {
            // Customize these fields based on your product structure
            return product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())
        })
    }
    render() {
        const filteredProducts = this.getFilteredProducts();
        return (
            <BrowserRouter>
                <div>
                    <Navbar
                        searchValue={this.state.searchQuery}
                        handleSearchChange={this.handleSearchChange}
                    />
                    <Switch>
                        <Route exact path="/ProductDetails/:id" component={ProductDetails} />
                        <Route exact path="/Register" component={Register} />
                        <Route exact path="/ResetDatabase" component={ResetDatabase} />
                        {/* Home route */}
                        <Route exact path="/" render={(props) =>
                            <DisplayAllProducts {...props} products={filteredProducts} />} />
                        <Route exact path="/Login" component={Login} />
                        <LoggedInRoute exact path="/Logout" component={Logout} />
                        <LoggedInRoute exact path="/AddProduct" component={AddProduct} />
                        <LoggedInRoute exact path="/EditProduct/:id" component={EditProduct} />
                        <LoggedInRoute exact path="/DeleteProduct/:id" component={DeleteProduct} />
                        <LoggedInRoute path="/UserProfile/:id" component={UserProfile} />
                        {/* passing filtered products to DisplayAllProducts */}
                        <Route exact path="/DisplayAllProducts" render={(props) =>
                            <DisplayAllProducts {...props} products={filteredProducts} />} />
                        <Route path="*" render={(props) =>
                            <DisplayAllProducts {...props} products={filteredProducts} />} />
                        <Route exact path="/SortBy" component={SortBy} />
                    </Switch>
                </div>
            </BrowserRouter>
        )
    }
}