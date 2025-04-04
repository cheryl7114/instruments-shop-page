import React, { Component } from "react"
import { Link } from "react-router-dom"
import {CiCirclePlus} from "react-icons/ci"

import axios from "axios"

import ProductGrid from "./ProductGrid"

import {ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants"

import { FaSortAmountDown } from "react-icons/fa"
import { FaSortAmountUp } from "react-icons/fa"

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
        this.fetchProducts()
    }

    fetchProducts = () => {
        axios.get(`${SERVER_HOST}/products`)
            .then(res => {
                if (res.data && !res.data.errorMessage) {
                    const brandsObject = {}
                    res.data.forEach(product => {
                        brandsObject[product.brand] = true
                    })
                    this.setState({
                        products: res.data,
                        brands: brandsObject
                    })
                }
            })
            .catch(err => console.log("Error fetching products", err))
    }

    handleProductDeleted = () => {
        this.fetchProducts()  
    }

    toggleDropdown = () => {
        console.log("Toggling dropdown:", !this.state.dropDownOpen)
        this.setState(prevState => ({
            dropDownOpen: !prevState.dropDownOpen
        }))
    }

    handleSortChange = (sortType) => {
        console.log("Sorting by:", sortType)
        this.props.handleSortChange(sortType)
    }

    handleCategoryChange = (category) => (e) => {
        console.log(`Category changed to ${category}`)
        this.props.handleCategoryFilter(category, e.target.checked)
    }

    handleBrandChange = (brand) => (e) => {
        console.log(`Category changed to ${brand}`)
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
        }
        const productsToDisplay = this.props.products || this.state.products

        return (
            <div className="body-container">
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
                        <button className="sort-button" onClick={this.toggleDropdown}>
                            <span className="sort-content">
                                <span className="sort-icon">
                                    {getSortIndicator(dropDownOpen)}
                                </span>
                                Sort By
                            </span>
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
                        </button>

                        <div className="products-container">
                            <div className="products-header">
                                <h2>Products</h2>
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
                                    <div className="product-grid">
                                        <ProductGrid products={productsToDisplay} onProductDeleted={this.handleProductDeleted} />
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