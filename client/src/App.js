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
import DeleteCustomer from "./components/DeleteCustomer"
import Cart from "./components/Cart"
import DisplayAllProducts from "./components/DisplayAllProducts"
import ProductDetails from "./components/ProductDetails"
import UserProfile from "./components/UserProfile"
import ViewCustomers from "./components/ViewCustomers"
import ReturnForm from "./components/ReturnForm"
import LoggedInRoute from "./components/LoggedInRoute"
import Checkout from "./components/Checkout"

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
            sortType: "none",
            selectedCategories: [],
            selectedBrands: [],
            cartItems: JSON.parse(localStorage.getItem('cartItems') || "[]")
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

    // cart management
    addToCart = (product) => {
        // Check if product is out of stock
        if (!product.stock || product.stock <= 0) {
            alert("Sorry, this product is out of stock")
            return false
        }
        
        // Create a new cartItems array to avoid direct state mutation
        let cartItems = [...this.state.cartItems]
        
        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(item => item._id === product._id)
        
        if (existingItemIndex >= 0) {
            // Item exists in cart, check if we can add more
            const updatedQuantity = cartItems[existingItemIndex].quantity + 1
            
            // Check against available stock
            if (updatedQuantity > product.stock) {
                alert(`Sorry, you can't add more of this item. Only ${product.stock} available in stock.`)
                return false
            }
            
            // Update quantity
            cartItems[existingItemIndex].quantity = updatedQuantity
        } else {
            // Item doesn't exist in cart, add it with quantity 1
            cartItems.push({
                ...product,
                quantity: 1
            })
        }
        
        // Update state and localStorage
        this.setState({ cartItems }, () => {
            localStorage.setItem('cartItems', JSON.stringify(cartItems))
        })
        
        return true
    }

    removeFromCart = (productId) => {
        this.setState(prevState => {
            const updatedCart = prevState.cartItems.filter(item => item._id !== productId)
            localStorage.setItem('cartItems', JSON.stringify(updatedCart))
            return { cartItems: updatedCart }
        })
    }

    updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            return
        }
        this.setState(prevState => {
            const updatedCart = prevState.cartItems.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
            localStorage.setItem('cartItems', JSON.stringify(updatedCart))
            return { cartItems: updatedCart }
        })
    }

    clearCart = () => {
        localStorage.setItem('cartItems', JSON.stringify([]))
        this.setState({ cartItems: [] })
    }


    handleSearchChange = (e) => {
        console.log("Search value: ", e.target.value) // test for search purposes
        this.setState({ searchQuery: e.target.value })
    }

    handleSortChange = (sortType) => {
        this.setState({ sortType })
    }

    handleCategoryFilter = (category, isChecked) => {
        this.setState(prevState => {
            if (isChecked) {
                return { selectedCategories: [...prevState.selectedCategories, category] }
            } else {
                return { selectedCategories: prevState.selectedCategories.filter(c => c !== category) }
            }
        })
    }

    handleBrandFilter = (brand, isChecked) => {
        this.setState(prevState => {
            if (isChecked) {
                return { selectedBrands: [...prevState.selectedBrands, brand] }
            } else {
                return { selectedBrands: prevState.selectedBrands.filter(b => b !== brand) }
            }
        })
    }

    getFilteredAndSortedProducts = () => {
        const { searchQuery, products, sortType, selectedCategories, selectedBrands } = this.state

        let result = products

        // apply search filter first
        if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim()
            result = products.filter(product => {
                return product.name && product.name.toLowerCase().includes(query)
            })
        }

        // apply category filter
        if (selectedCategories.length > 0) {
            result = result.filter(product => {
                return selectedCategories.some(category =>
                    product.category &&
                    product.category.toLowerCase() === category.toLowerCase()
                )
            })
        }

        // apply brand filter
        if (selectedBrands.length > 0) {
            result = result.filter(product => {
                return selectedBrands.some(brand =>
                    product.brand &&
                    product.brand.toLowerCase() === brand.toLowerCase()
                )
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
        const filteredProducts = this.getFilteredAndSortedProducts()
        return (
            <BrowserRouter>
                <div>
                    <Navbar
                        searchValue={this.state.searchQuery}
                        handleSearchChange={this.handleSearchChange}
                        cartItemCount={this.state.cartItems.reduce((total, item) => total + item.quantity, 0)}
                    />
                    <Switch>
                        <Route exact path="/ProductDetails/:id" render={(props) =>
                            <ProductDetails
                                {...props}
                                addToCart={this.addToCart}
                            />
                        } />
                        <Route exact path="/Register" component={Register} />
                        <Route exact path="/ResetDatabase" component={ResetDatabase} />
                        {/* Home route */}
                        <Route exact path="/" render={(props) =>
                            <DisplayAllProducts
                                {...props}
                                products={filteredProducts}
                                sortType={this.state.sortType}
                                handleSortChange={this.handleSortChange}
                                handleCategoryFilter={this.handleCategoryFilter}
                                handleBrandFilter={this.handleBrandFilter}
                                selectedCategories={this.state.selectedCategories}
                                selectedBrands={this.state.selectedBrands}
                            />} />
                        <Route exact path="/Login" component={Login} />
                        <LoggedInRoute exact path="/Logout" component={Logout} />
                        <LoggedInRoute exact path="/AddProduct" component={AddProduct} />
                        <LoggedInRoute exact path="/EditProduct/:id" component={EditProduct} />
                        <LoggedInRoute exact path="/DeleteProduct/:id" component={DeleteProduct} />
                        <LoggedInRoute exact path="/DeleteCustomer/:id" component={DeleteCustomer} />
                        <Route exact path="/Cart" render={(props) =>
                            <Cart
                                {...props}
                                cartItems={this.state.cartItems}
                                removeFromCart={this.removeFromCart}
                                updateQuantity={this.updateQuantity}
                                clearCart={this.clearCart}
                            />
                        } />
                        <Route exact path="/Checkout" render={(props) =>
                            <Checkout
                                {...props}
                                clearCart={this.clearCart}
                            />
                        } />
                        <LoggedInRoute path="/UserProfile/:id" component={UserProfile} />
                        <LoggedInRoute path="/ViewCustomers/" component={ViewCustomers} />
                        <LoggedInRoute path="/ReturnForm/:id" component={ReturnForm} />
                        {/* passing filtered and sortedproducts to DisplayAllProducts */}
                        <Route exact path="/DisplayAllProducts" render={(props) =>
                            <DisplayAllProducts
                                {...props}
                                products={filteredProducts}
                                sortType={this.state.sortType}
                                handleSortChange={this.handleSortChange}
                                handleCategoryFilter={this.handleCategoryFilter}
                                handleBrandFilter={this.handleBrandFilter}
                                selectedCategories={this.state.selectedCategories}
                                selectedBrands={this.state.selectedBrands}
                            />} />
                        <Route path="*" render={(props) =>
                            <DisplayAllProducts
                                {...props}
                                products={filteredProducts}
                                sortType={this.state.sortType}
                                handleSortChange={this.handleSortChange}
                                handleCategoryFilter={this.handleCategoryFilter}
                                handleBrandFilter={this.handleBrandFilter}
                                selectedCategories={this.state.selectedCategories}
                                selectedBrands={this.state.selectedBrands}
                            />} />
                    </Switch>
                </div>
            </BrowserRouter>
        )
    }
}