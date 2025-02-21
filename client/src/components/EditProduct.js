import React, {Component} from "react"
import {Redirect, Link} from "react-router-dom"
import axios from "axios"

import LinkInClass from "../components/LinkInClass"

import {ACCESS_LEVEL_NORMAL_USER, SERVER_HOST} from "../config/global_constants"

export default class EditProduct extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: ``,
            brand: ``,
            colour: ``,
            category: ``,
            stock: ``,
            price: ``,
            images: [],
            redirectToDisplayAllProducts:localStorage.accessLevel < ACCESS_LEVEL_NORMAL_USER
        }
    }

    componentDidMount() {
        this.inputToFocus.focus()

        axios.get(`${SERVER_HOST}/products/${this.props.match.params.id}`, {headers:{"authorization":localStorage.token}})
            .then(res => {
                if(res.data) {
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
                            images: res.data.images
                        })
                    }
                } else {
                    console.log(`Record not found`)
                }
            })
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    handleSubmit = (e) => {
        e.preventDefault()

        this.setState({ wasSubmittedAtLeastOnce: true })
        const formInputsState = this.validate()

        if (Object.keys(formInputsState).every(index => formInputsState[index])) {
            const productObject = {
                name: this.state.name,
                brand: this.state.brand,
                colour: this.state.colour,
                category: this.state.category,
                stock: this.state.stock,
                price: this.state.price,
                images: this.state.images.length > 0
                    ? this.state.images
                    : ["https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg"] // ✅ Default image if empty
            }

            axios.put(`${SERVER_HOST}/products/${this.props.match.params.id}`, productObject, {headers:{"authorization":localStorage.token}})
                .then(res => {
                    if(res.data) {
                        if (res.data.errorMessage) {
                            console.log(res.data.errorMessage)
                        } else {
                            console.log(`Record updated`)
                            this.setState({redirectToDisplayAllProducts:true})
                        }
                    } else {
                        console.log(`Record not updated`)
                    }
                })
        }
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
        const pattern = /^[A-Za-z]+$/ // only letters (red, blue, etc.)
        return pattern.test(String(this.state.colour).trim());
    }

    validateCategory() {
        const pattern = /^[A-Za-z]+$/ // only letters (guitar, piano, etc.)
        return pattern.test(String(this.state.category).trim());
    }

    validateStock() {
        const stock = parseInt(this.state.stock)
        return Number.isInteger(stock) && stock >= 0 // no negative values
    }


    validatePrice() {
        const price = parseInt(this.state.price);
        return Number.isInteger(price) && price >= 0 // no negative values
    }

    validate() {
        return {
            name: this.validateName(),
            brand: this.validateBrand(),
            colour: this.validateColour(),
            category: this.validateCategory(),
            stock: this.validateStock(),
            price: this.validatePrice(),
        }
    }

    render() {
        return (
            <div className="form-container">

                {this.state.redirectToDisplayAllProducts ? <Redirect to="/DisplayAllProducts"/> : null}

                <form>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            ref={(input) => { this.inputToFocus = input; }}
                        />
                    </div>

                    <div>
                        <label htmlFor="brand">Brand</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            value={this.state.brand}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="colour">Colour</label>
                        <input
                            type="text"
                            id="colour"
                            name="colour"
                            value={this.state.colour}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="category">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={this.state.category}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="stock">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={this.state.stock}
                            onChange={this.handleChange}
                            min="0"
                        />
                    </div>

                    <div>
                        <label htmlFor="price">Price</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={this.state.price}
                            onChange={this.handleChange}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label htmlFor="photoUrl">Photo URL</label>
                        <input
                            type="text"
                            id="photoUrl"
                            name="photoUrl"
                            value={this.state.photoUrl || ""}
                            onChange={(e) => this.setState({ photoUrl: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (this.state.photoUrl) {
                                    this.setState((prevState) => ({
                                        images: [...prevState.images, prevState.photoUrl],
                                        photoUrl: "" // Clear input after adding
                                    }))
                                }
                            }}
                        > Add Photo
                        </button>
                    </div>

                    {/* image preview */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                        {(this.state.images.length > 0 ? this.state.images : ["https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg"])
                            .map((url, index) => (
                                <div key={index} style={{ position: "relative" }}>
                                    <img
                                        src={url}
                                        alt={`Product Preview ${index + 1}`}
                                        style={{ width: "150px", height: "auto" }}
                                    />
                                    {this.state.images.length > 0 && ( // only show delete button if there are images
                                        <button
                                            type="button"
                                            style={{ position: "absolute", top: 0, right: 0, background: "red", color: "white" }}
                                            onClick={() => {
                                                this.setState((prevState) => ({
                                                    images: prevState.images.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        >
                                            X
                                        </button>
                                    )}
                                </div>
                            ))
                        }
                    </div>



                    <LinkInClass value="Update" className="green-button" onClick={this.handleSubmit}/>
                    <Link className="red-button" to={"/DisplayAllProducts"}>Cancel</Link>
                </form>
            </div>
        )
    }
}