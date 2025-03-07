import React, { Component } from "react"
import { Link } from "react-router-dom"
import {CiCirclePlus} from "react-icons/ci";

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
            brands:{},
            dropDownOpen: false
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/products`)
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        console.log("Products fetched:", res.data)

                        const brandsObject = {}
                        res.data.forEach(product => {
                            brandsObject[product.brand] = true
                        })
                        this.setState({
                            products: res.data,
                            brands: brandsObject
                        })}
                } else {
                    console.log("No products found")
                }
            })
            .catch(err => console.log("Error fetching products", err))
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
        const { dropDownOpen, brands } = this.state
        const getSortIndicator = (dropDownOpen) => {
            if (dropDownOpen) {
                return <FaSortAmountUp />
            } else {
                return <FaSortAmountDown />
            }
            // return dropDownOpen ? <CiSquareChevUp /> : <CiSquareChevDown />
        }
        const productsToDisplay = this.props.products || this.state.products

        return (
            <div className="body-container">
                {localStorage.accessLevel > ACCESS_LEVEL_GUEST ?
                    <div className="logout">
                        <Logout />
                    </div>
                    :
                    <div>
                        <Link className="green-button" to={"/Login"}>Login</Link>
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
                                            checked={(this.props.selectedCategories || []).includes(category)}
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
                                {Object.keys(brands).map(brand => (
                                    <label key={brand} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            value={brand}
                                            checked={(this.props.selectedBrands || []).includes(brand)}
                                            onChange={this.handleBrandChange(brand)}
                                        />
                                        {brand}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="main-products-container">
                        <div className="sort-container">
                            <div className="sort-dropdown" onClick={this.toggleDropdown}>
                                <button className="sort-button">
                                    {getSortIndicator(dropDownOpen)}
                                    {/*<CiFilter size={20} /> */}
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
                        {/*{localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?*/}
                        {/*    <div className="add-new-product">*/}
                        {/*        <title>Add new product</title>*/}
                        {/*        <Link to={"/AddProduct"}>*/}
                        {/*            <CiCirclePlus size={30} />*/}
                        {/*        </Link>*/}
                        {/*    </div>*/}
                        {/*    :*/}
                        {/*    null*/}
                        {/*}*/}

                        <div className="products-container">
                            <div className="products-header">
                                <h2>Available Products</h2>
                                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN && (
                                    <div className="add-new-product">
                                        <Link to={"/AddProduct"}>
                                            <CiCirclePlus size={30} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div>
                                {productsToDisplay.length === 0 ? (
                                    <div className="no-products">No products available</div>
                                ) : (
                                    < div className="product-grid">
                                        <ProductGrid products={productsToDisplay} />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div >
        )
    }
}