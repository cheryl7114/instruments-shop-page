import React, {Component} from "react"
import {Link} from "react-router-dom"

import axios from "axios"

import ProductGrid from "./ProductGrid"
import Logout from "./Logout"

import { ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants"

import { FaSortAmountDown } from "react-icons/fa";
import { FaSortAmountUp } from "react-icons/fa";

export default class DisplayAllProducts extends Component {
    constructor(props) {
        super(props)

        this.state = {
            products: [],
            dropDownOpen: false
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/products`)
            .then(res => {
                if(res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else {
                        console.log("Records read")
                        this.setState({products: res.data})
                    }
                }
                else {
                    console.log("Record not found")
                }
            })
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            dropDownOpen: !prevState.dropDownOpen
        }))
    }

    handleSortChange = (sortType) => {
        this.props.handleSortChange(sortType)
    }

    handleCategoryChange = (category) => (e) => {
        this.props.handleCategoryFilter(category, e.target.checked)
    }

    handleBrandChange = (brand) => (e) => {
        this.props.handleBrandFilter(brand, e.target.checked)
    }

    render() {
        const { dropDownOpen } = this.state
        const getSortIndicator = (dropDownOpen) => {
            if (dropDownOpen) {
                return <FaSortAmountUp />
            } else {
                return <FaSortAmountDown />
            }
        }
        const productsToDisplay = this.props.products || this.state.products
        return (
            <div className="body-container">
                {localStorage.accessLevel > ACCESS_LEVEL_GUEST ?
                    <div className="logout">
                        <Logout/>
                    </div>
                    :
                    <div>

                        <Link className="green-button" to={"/Login"}>
                            <svg id="profile" viewBox="0 0 20 24" width="20" height="20">
                                <title>Login or Signup</title>
                                <g fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="2">
                                    <path d="M19 20.5 15.63 16H4.38L1 20.5"></path>
                                    <circle cx="10" cy="8.5" r="4.5"></circle>
                                </g>
                            </svg>
                        </Link>
                        <Link className="red-button" to={"/ResetDatabase"}>Reset Database</Link>  <br /><br /><br />
                    </div>
                }
                <div className="products-page-layout">
                    <div className="filter-container">
                        <div className="filter-section">
                            <h4>Categories</h4>
                            <div className="filter-options">
                                {['Guitar', 'Piano', 'Drums', 'Violin', 'Saxophone', 'Trumpet'].map(category => (
                                    <label key={category} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            value={category}
                                            checked={this.props.selectedCategories.includes(category)}
                                            onChange={this.handleCategoryChange(category)}
                                        />
                                        {category}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="filter-section">
                            <h4>Brands</h4>
                            <div className="filter-options">
                                {['Fender', 'Yamaha', 'Roland', 'Pearl', 'Selmer'].map(brand => (
                                    <label key={brand} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            value={brand}
                                            checked={this.props.selectedBrands.includes(brand)}
                                            onChange={this.handleBrandChange(brand)}
                                        />
                                        {brand}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="sort-container">
                        <div className="sort-dropdown" onClick={this.toggleDropdown}>
                            <button className="sort-button">
                                {getSortIndicator(dropDownOpen)}
                                Sort By
                            </button>
                        </div>
                        {dropDownOpen && (
                            <div className="sort-dropdown-content">
                                <div
                                    className="sort-option"
                                    onClick={() => { this.handleSortChange("priceAsc"); this.toggleDropdown() }}
                                >
                                    Price: Low to High
                                </div>
                                <div
                                    className="sort-option"
                                    onClick={() => { this.handleSortChange("priceDesc"); this.toggleDropdown() }}
                                >
                                    Price: High to Low
                                </div>
                                <div
                                    className="sort-option"
                                    onClick={() => { this.handleSortChange("nameAsc"); this.toggleDropdown() }}
                                >
                                    Name: A to Z
                                </div>
                                <div
                                    className="sort-option"
                                    onClick={() => { this.handleSortChange("nameDesc"); this.toggleDropdown() }}
                                >
                                    Name: Z to A
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="products-container">
                        <h2>Available Products</h2>
                        {productsToDisplay.length === 0 ? (
                            <div className="no-products">No products available</div>
                        ) : (
                            < div className="product-grid">
                                <ProductGrid products={productsToDisplay} />

                                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                                    <div className="add-new-product">
                                        <Link className="blue-button" to={"/AddProduct"}>Add New Product</Link>
                                    </div>
                                    :
                                    null
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div >
        )
    }
}