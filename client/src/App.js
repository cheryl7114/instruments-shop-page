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
            searchQuery: "",
            sortType: "none"
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

    handleSortChange = (sortType) => {
        this.setState({ sortType })
    }

    getFilteredAndSortedProducts = () => {
        const { searchQuery, products, sortType } = this.state;

        let result = products

        // removing leading and trailing spaces and converting to lowercase
        if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim()
            result = products.filter(product => {
                return product.name && product.name.toLowerCase().includes(query)
            })
        }

        if (sortType === "priceAsc") {
            return result.sort((a, b) => a.price - b.price)
        } else if (sortType === "priceDesc") {
            return result.sort((a, b) => b.price - a.price)
        } else if (sortType === "nameAsc") {
            return result.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortType === "nameDesc") {
            return result.sort((a, b) => b.name.localeCompare(a.name))
        } else {
            return result
        }
    }
    render() {
        const filteredProducts = this.getFilteredAndSortedProducts();
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
                            <DisplayAllProducts 
                            {...props} 
                            products={filteredProducts} 
                            sortType={this.state.sortType}
                            handleSortChange={this.handleSortChange}
                            />} />
                        <Route exact path="/Login" component={Login} />
                        <LoggedInRoute exact path="/Logout" component={Logout} />
                        <LoggedInRoute exact path="/AddProduct" component={AddProduct} />
                        <LoggedInRoute exact path="/EditProduct/:id" component={EditProduct} />
                        <LoggedInRoute exact path="/DeleteProduct/:id" component={DeleteProduct} />
                        <LoggedInRoute path="/UserProfile/:id" component={UserProfile} />
                        {/* passing filtered and sortedproducts to DisplayAllProducts */}
                        <Route exact path="/DisplayAllProducts" render={(props) =>
                            <DisplayAllProducts 
                            {...props} 
                            products={filteredProducts} 
                            sortType={this.state.sortType}
                            handleSortChange={this.handleSortChange}
                            />} />
                        <Route path="*" render={(props) =>
                            <DisplayAllProducts 
                            {...props} 
                            products={filteredProducts} 
                            sortType={this.state.sortType}
                            handleSortChange={this.handleSortChange}
                            />} />
                    </Switch>
                </div>
            </BrowserRouter>
        )
    }
}