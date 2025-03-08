import React, { Component } from "react"
import { Redirect, Link } from "react-router-dom"
import {CiCircleRemove, CiCircleChevDown} from "react-icons/ci"

import axios from "axios"

import LinkInClass from "../components/LinkInClass"

import { ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants"

export default class AddProduct extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: "",
            brand: "",
            brands: {},
            colour: "",
            category: "",
            stock: "",
            price: "",
            selectedFiles: [],
            previewImages: [],
            errors: {},
            redirectToDisplayAllProducts: localStorage.accessLevel < ACCESS_LEVEL_ADMIN
        }
    }

    componentDidMount() {
        //console.log("Component Mounted. Initial State:", this.state)
        this.inputToFocus.focus()

        axios.get(`${SERVER_HOST}/brands`, {headers: {"authorization": localStorage.token}})
            .then(res => {
                if (res.data) {
                    //console.log("Fetched brands from API:", res.data)
                    this.setState({ brands: res.data })
                }
            })
            .catch(err => console.log("Error fetching brands", err))
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleBlur = (e) => {
        e.persist()

        this.setState({ [e.target.name]: e.target.value.trim() }, () => {
            let errors = {}
            const value = this.state[e.target.name]

            if (!value) {
                errors[e.target.name] = "* This field must not be blank."
            } else {
                switch (e.target.name) {
                    case "name":
                        if (!this.validateName()) {
                            errors[e.target.name] = "* Can only contain letters, numbers, and spaces."
                        } else {
                            delete errors[e.target.name]
                        }
                        break
                    case "brand":
                        if (!this.validateBrand()) {
                            errors[e.target.name] = "* Can only contain letters, numbers, and spaces."
                        } else {
                            delete errors[e.target.name]
                        }
                        break
                    case "colour":
                        if (!this.validateColour()) {
                            errors[e.target.name] = "* Can only contain letters and spaces."
                        } else {
                            delete errors[e.target.name]
                        }
                        break
                    case "stock":
                        if (!this.validateStock()) {
                            errors[e.target.name] = "* Must be a non-negative integer."
                        } else {
                            delete errors[e.target.name]
                        }
                        break
                    case "price":
                        if (!this.validatePrice()) {
                            errors[e.target.name] = "* Must be a non-negative number."
                        } else {
                            delete errors[e.target.name]
                        }
                        break
                    default:
                        break
                }
            }

            if (e.target.name === "brand" && value) {
                if (!this.state.brands.hasOwnProperty(value)) {
                    //console.log("Add to brand list:", value)
                    this.setState(prevState => ({
                        brands: {
                            ...prevState.brands,
                            [value]: { id: Object.keys(prevState.brands).length + 1 }
                        }
                    }))
                }
            }

            this.setState({ errors })
            return Object.keys(errors).length === 0
        })
    }

    handleFileChange = (e) => {
        const selectedFiles = [...e.target.files]

        const updatedFiles = [...this.state.selectedFiles, ...selectedFiles].filter(file => file instanceof File)
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))

        this.setState(prevState => ({
            selectedFiles: updatedFiles,
            previewImages: [...prevState.previewImages, ...newPreviews],
            errors: { ...prevState.errors, images: updatedFiles.length > 0 ? undefined : "* Must upload at least one photo." }
        }))
    }

    handleRemoveImage = (index) => {
        // Remove preview image from state
        const updatedPreviews = [...this.state.previewImages]
        updatedPreviews.splice(index, 1)

        // Remove filename from images array
        const updatedFiles = [...this.state.selectedFiles]
        updatedFiles.splice(index, 1)

        this.setState({
            previewImages: updatedPreviews,
            selectedFiles: updatedFiles
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()

        let errors={}

        if (this.state.selectedFiles.length === 0) {
            errors.images = "* Must upload at least one photo."
        }else {
            delete errors.images
        }

        if (Object.keys(errors).length > 0) {
            this.setState({ errors })
            return
        }

        //console.log("Submitting form...")

        let formData = new FormData()
        this.setState({ wasSubmittedAtLeastOnce: true })
        //const formInputsState = this.validate()

        //if (Object.keys(formInputsState).every(index => formInputsState[index])) {
            formData.append("name", this.state.name)
            formData.append("brand", this.state.brand)
            formData.append("colour", this.state.colour)
            formData.append("category", this.state.category)
            formData.append("stock", this.state.stock)
            formData.append("price", this.state.price)

            if (this.state.selectedFiles) {
                for (let i = 0; i < this.state.selectedFiles.length; i++) {
                    formData.append("images", this.state.selectedFiles[i])
                }
            }

            axios.post(`${SERVER_HOST}/products`, formData, { headers: { "authorization": localStorage.token, "Content-type": "multipart/form-data" } })
                .then(res => {
                    //console.log("Server Response:", res.data)
                    if (res.data) {
                        if (res.data.errorMessage) {
                            console.log("Error:",res.data.errorMessage)
                        } else {
                            //console.log("Product successfully added.")
                            // Set state for redirection and refresh the page after a short delay
                            this.setState({ redirectToDisplayAllProducts: true }, () => {
                                setTimeout(() => {
                                    window.location.reload()
                                }, 100)
                            })
                        }
                    } else {
                        console.log("Product not added")
                    }
                })
                .catch(err => console.log("Error submitting form:", err))
    }

    validateName() {
        const pattern = /^[A-Za-z0-9 ]+$/ // allows letters, numbers, and spaces
        return pattern.test(String(this.state.name).trim())
    }

    validateBrand() {
        const pattern = /^[A-Za-z0-9 ]+$/ // allows letters, numbers, and spaces
        return pattern.test(String(this.state.brand).trim())
    }

    validateColour() {
        const pattern = /^[A-Za-z ]+$/ // only letters and spaces (red, blue, etc.)
        return pattern.test(String(this.state.colour).trim())
    }

    validateStock() {
        const stock = parseInt(this.state.stock)
        return Number.isInteger(stock) && stock >= 0 // no negative values
    }

    validatePrice() {
        const price = parseFloat(this.state.price)
        return !isNaN(price) && price >= 0 // Allows decimals for currency
    }

    render() {
        return (
            <div className="add-product-container">
                {this.state.redirectToDisplayAllProducts ? <Redirect to="/DisplayAllProducts" /> : null}
                <form>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                            ref={(input) => { this.inputToFocus = input }}
                        />
                        {this.state.errors.name && <div className="error">{this.state.errors.name}</div>}
                    </div>

                    <div>
                        <label htmlFor="brand">Brand</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            value={this.state.brand}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        {this.state.errors.brand && <div className="error">{this.state.errors.brand}</div>}
                        <datalist id="brand-options">
                            {Object.keys(this.state.brands).map((brand) => (
                                <option key={brand} value={brand} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label htmlFor="colour">Colour</label>
                        <input
                            type="text"
                            id="colour"
                            name="colour"
                            value={this.state.colour}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        {this.state.errors.colour && <div className="error">{this.state.errors.colour}</div>}
                    </div>

                    <div>
                        <label htmlFor="category">Category</label>
                        <div className="select-wrapper">
                            <select
                                id="category"
                                name="category"
                                value={this.state.category}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                            >
                                <option value="category">Select a category</option>
                                {["Guitar", "Piano", "Trumpet", "Saxophone", "Drums", "Violin"].map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <CiCircleChevDown className="select-icon" />
                        </div>
                        {this.state.errors.category && <div className="error">{this.state.errors.category}</div>}
                    </div>

                    <div>
                        <label htmlFor="stock">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={this.state.stock}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                            min="0"
                        />
                        {this.state.errors.stock && <div className="error">{this.state.errors.stock}</div>}
                    </div>

                    <div>
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={this.state.price}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                            min="0"
                            step="0.01"
                        />
                        {this.state.errors.price && <div className="error">{this.state.errors.price}</div>}
                    </div>

                    <div className="file-upload-container">
                        <label>Upload Images</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                onChange={this.handleFileChange}
                            />
                            <label htmlFor="file-upload" className="custom-file-label">
                                Click to upload
                            </label>
                        </div>
                        {this.state.selectedFiles.length > 0 && (
                            <div className="selected-files">
                                {this.state.selectedFiles.length} file(s) selected
                            </div>
                        )}
                        {this.state.errors.images && <div className="error">{this.state.errors.images}</div>}
                    </div>

                    {/* Image Previews */}
                    <div className="image-preview-container">
                        {this.state.previewImages.map((img, index) => (
                            <div key={index} className="image-preview-wrapper">
                                <img src={img||""} alt="Preview" className="image-preview" />
                                <button
                                    type="button"
                                    className="remove-image-button"
                                    onClick={() => this.handleRemoveImage(index)}
                                >
                                    <CiCircleRemove size={24} color="red" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <LinkInClass value="Add" className="orange-button" onClick={this.handleSubmit} />
                    <div className="cancel-button">
                        <Link to={"/DisplayAllProducts"}>
                            <CiCircleRemove size={30} color="red" />
                        </Link>
                    </div>
                </form>
            </div>
        )
    }
}