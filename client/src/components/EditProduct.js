import React, {Component} from "react"
import {Redirect, Link} from "react-router-dom"
import {CiCircleChevDown, CiCircleRemove} from "react-icons/ci"

import axios from "axios"

import LinkInClass from "../components/LinkInClass"

import { ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants"

export default class EditProduct extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: ``,
            brand: ``,
            brands:{},
            colour: ``,
            category: ``,
            stock: ``,
            price: ``,
            images: [],
            selectedFiles: [],
            previewImages: [],
            errors:{},
            showModal:false,
            redirectToDisplayAllProducts: localStorage.accessLevel < ACCESS_LEVEL_ADMIN
        }
    }

    componentDidMount() {
        //console.log("Product ID:", this.props.match.params.id)
        //console.log("Component Mounted. Initial State:", this.state)
        this.inputToFocus.focus()

        axios.get(`${SERVER_HOST}/products/${this.props.match.params.id}`, {headers: {"authorization": localStorage.token}})
            .then(res => {
                console.log("Product Data:", res.data)
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        this.setState({
                            name: res.data.name,
                            brand: res.data.brand,
                            colour: res.data.colour,
                            category: res.data.category,
                            stock: res.data.stock,
                            price: res.data.price,
                            images: res.data.images || [] // Ensure images is always an array
                        }, () => {
                            //console.log("Images State:", this.state.images) // Debugging line
                            this.loadImagePreviews(this.state.images)
                        })
                    }
                } else {
                    console.log(`Record not found`)
                }
            })
            .catch(err => {
                    console.error("Failed to fetch product:", err)
                    this.setState({ redirectToDisplayAllProducts: true })
                })

        axios.get(`${SERVER_HOST}/brands`, {headers: {"authorization": localStorage.token}})
            .then(res => {
                //console.log("Brands Data:", res.data)
                if (res.data) {
                    this.setState({ brands: res.data })
                }
            })
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    console.warn("Brands API returned 404 - No brands found.")
                    this.setState({ brands: [] })
                } else {
                    console.error("Error fetching brands:", err)
                }
            })
        //console.log("SERVER_HOST:", SERVER_HOST)
        //console.log("Fetching brands from:", `${SERVER_HOST}/brands`)
    }

    loadImagePreviews = (images) => {
        // Each image fetch request is a Promise
        // images.map() creates an array of Promises
        // Promise.all() waits for all of them to complete
        // Once done, the previews are stored in this.state.previewImages
        if (!images || images.length === 0) {
            console.log("No images found") // Debugging
            return
        }

        //console.log("Loading previews for images:", images) // Debugging

        // Extract filenames from image objects
        const filenames = images.map(img => img.filename)

        const previewPromises = filenames.map(filename =>
            axios.get(`${SERVER_HOST}/products/image/${filename}`)
                .then(res => {
                    if (res.data.image) {
                        return `data:image/png;base64,${res.data.image}`
                    }
                    return null
                })
                .catch(err => {
                    console.error(`Error loading image ${filename}:`, err)
                    return null
                })
        )

        Promise.all(previewPromises).then(previews => {
            //console.log("Loaded image previews:", previews) // Debugging
            this.setState({ previewImages: previews.filter(img => img !== null) })
        })
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
                    console.log("Brand does not exist in brands list, adding:", value)
                    this.setState(prevState => ({
                        brands: {
                            ...prevState.brands,
                            [value]: { id: Object.keys(prevState.brands).length + 1 }
                        }
                    }), () => {
                        console.log("Updated brands list:", this.state.brands)
                    })
                }
            }

            this.setState({ errors }, () => {
                if (Object.keys(errors).length > 0) {
                    console.log("Validation failed. Fix the errors before submitting: ", errors)
                }
            })
            return Object.keys(errors).length === 0
        })
    }

    handleFileChange = (e) => {
        const newFiles = [...e.target.files]
        const uniqueFiles = newFiles.filter(file => !this.state.selectedFiles.some(f => f.name === file.name))

        if (uniqueFiles.length) {
            this.setState(prevState => ({
                selectedFiles: [...prevState.selectedFiles, ...uniqueFiles],
                previewImages: [...prevState.previewImages, ...uniqueFiles.map(file => URL.createObjectURL(file))],
                errors: { ...prevState.errors, images: undefined }
            }), () => {
                console.log("Updated selectedFiles state:", this.state.selectedFiles)
            })
        }
    }

    handleRemoveImage = (index) => {
        // Remove preview image from state
        const updatedPreviews = [...this.state.previewImages]
        updatedPreviews.splice(index, 1)

        // Remove filename from images array (for existing images only)
        const updatedImages = [...this.state.images]
        const removedImage = updatedImages.splice(index, 1)[0]

        this.setState({
            previewImages: updatedPreviews,
            images: updatedImages
        }, () => {
            axios.delete(`${SERVER_HOST}/products/image/${removedImage.filename}`, { headers: { "authorization": localStorage.token } })
                .then(res => {
                    console.log("Image deleted successfully:", res.data.message)
                })
                .catch(err => {
                    console.error("Failed to delete image:", err)
                })
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()

        let errors={}

        if (this.state.selectedFiles.length === 0 && this.state.images.length === 0) {
            errors.images = "* Must upload at least one photo."
        }else {
            delete errors.images
        }

        if (Object.keys(errors).length > 0) {
            this.setState({ errors })
            return
        }

        let formData = new FormData()
        this.setState({ wasSubmittedAtLeastOnce: true })
        //const formInputsState = this.validate()

        //if (Object.keys(formInputsState).every(index => formInputsState[index])) {
            formData.append("name", this.state.name)
            formData.append("brand", this.state.brand)
            formData.append("colour", this.state.colour)
            formData.append("category", this.state.category)
            formData.append("stock", parseInt(this.state.stock))
            formData.append("price", parseFloat(this.state.price))

            // Append existing images (as filenames)
            this.state.images.forEach(img => {
                formData.append("existingImages", img.filename)
            })

            // Append new images (as File objects)
            if (this.state.selectedFiles) {
                for (let i = 0; i < this.state.selectedFiles.length; i++) {
                    formData.append("images", this.state.selectedFiles[i]) // Append each file separately
                }
            }

            axios.put(`${SERVER_HOST}/products/${this.props.match.params.id}`, formData, { headers: { "authorization": localStorage.token, "Content-Type": "multipart/form-data" } })
                .then(res => {
                    if (res.data) {
                        if (res.data.errorMessage) {
                            console.log(res.data.errorMessage)
                        } else {
                            console.log(`Product data updated.`)
                            this.setState({ showModal: true })

                            setTimeout(() => {
                                this.setState({ redirectToDisplayAllProducts: true })
                            }, 10000)
                        }
                    } else {
                        console.log(`Product record not updated.`)
                    }
                })
        //}
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
        const pattern = /^[A-Za-z ]+$/ // only letters and spaces(red, blue, etc.)
        return pattern.test(String(this.state.colour).trim())
    }

    validateStock() {
        const stock = parseInt(this.state.stock)
        return Number.isInteger(stock) && stock >= 0 // no negative values
    }

    validatePrice() {
        const price = parseFloat(this.state.price)
        return !isNaN(price) && price >= 0 // no negative values
    }

    handleCloseModal = () => {
        this.setState({ showModal: false })
        window.location.href = "/DisplayAllProducts"
    }

    render() {
        return (
            <div className="forms">
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
                        <datalist id="brand-options">
                            {Object.keys(this.state.brands).map((brandKey) => (
                                <option key={brandKey} value={this.state.brands[brandKey]} />
                            ))}
                        </datalist>
                        {this.state.errors.brand && <div className="error">{this.state.errors.brand}</div>}
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
                        <label>Uploaded Images</label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                onChange={this.handleFileChange}
                                onBlur={this.handleBlur}
                            />
                            <label htmlFor="file-upload" className="custom-file-label">
                                Click to upload
                            </label>
                        {/*<input type="file" multiple onChange={this.handleFileChange} />*/}
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
                                <img src={img || " "} alt="Preview" className="image-preview" />
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

                    <LinkInClass value="Done" className="orange-button" onClick={this.handleSubmit}/>

                    <div className="cancel-button">
                        <Link to={"/DisplayAllProducts"}>
                            <CiCircleRemove size={30} color="red" />
                        </Link>
                    </div>
                </form>
                {this.state.showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>Product Edited Successfully!</h4>
                            <button className="orange-button" onClick={this.handleCloseModal}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}