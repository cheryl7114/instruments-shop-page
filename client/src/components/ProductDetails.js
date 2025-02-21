import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import { ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants"

export default class ProductDetails extends Component {
    constructor(props) {
        super(props)

        this.state = {
            product: null,  // Initialize as null to prevent undefined errors
            redirectToDisplayAllProducts: localStorage.accessLevel < ACCESS_LEVEL_GUEST
        }
    }

    componentDidMount() {
        const productId = this.props.match.params.id // Get product ID from URL

        axios.get(`${SERVER_HOST}/products/${productId}`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        this.setState({ product: res.data })
                        console.log("Product details retrieved")
                    }
                } else {
                    console.log("Product not found")
                }
            })
            .catch(err => console.error("Error fetching product:", err))
    }

    render() {
        const { product } = this.state

        // ✅ Prevent errors by checking if product exists before accessing properties
        if (!product) {
            return <p>Loading product details...</p>
        }

        return (
            <div className="product-card">
                <img
                    src={product.images && product.images.length > 0 ? product.images[0] : "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg"}
                    alt={product.name}
                    width="150"
                    height="120"
                />
                <h4>{product.name}</h4>
                <p><strong>Brand:</strong> {product.brand}</p>
                <p><strong>Colour:</strong> {product.colour}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                <p>€{product.price}</p>

                {localStorage.accessLevel > ACCESS_LEVEL_GUEST && <Link className="green-button" to={`/EditProduct/${product._id}`}>Edit</Link>}
                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN && <Link className="red-button" to={`/DeleteProduct/${product._id}`}>Delete</Link>}
                <Link className="red-button" to="/DisplayAllProducts">Back</Link>
            </div>
        )
    }
}
