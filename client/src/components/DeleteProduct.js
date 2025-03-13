import React, { Component } from "react"
import axios from "axios"

import { SERVER_HOST } from "../config/global_constants"

export default class DeleteProduct extends Component {
    constructor(props) {
        super(props)

        this.state = {
            images: [],
            showConfirmModal: false,
            showSuccessModal:false
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/products/${this.props.match.params.id}`, {
            headers: { "authorization": localStorage.token }
        })
    .then(res => {
            if (res.data && !res.data.errorMessage) {
                this.setState({ product: res.data, showConfirmModal: true })
            } else {
                throw new Error("Product not found.")
            }
        })
            .catch(err => {
                console.error("Error:", err)
                this.setState({ errorMessage: err.message || "An error occurred while fetching the product." })
                window.location.href = "/DisplayAllProducts"
            })
    }

    handleConfirmDelete = () => {
        const { product } = this.state
        if (!product) return

        const imageDeletePromises = (product.images || []).map(image =>
            axios.delete(`${SERVER_HOST}/products/image/${image.filename}`, {
            headers: { "authorization": localStorage.token }
        })
    )

        // Promise.all() waits for all of them to complete
        // Ensure all images are deleted before deleting the product
        Promise.all(imageDeletePromises)
            .then(() => axios.delete(`${SERVER_HOST}/products/${this.props.match.params.id}`, {
            headers: { "authorization": localStorage.token }
        }))
    .then(res => {
            if (res.data && !res.data.errorMessage) {
                console.log("Product successfully deleted.")
                this.setState({ showConfirmModal: false, showSuccessModal: true })
            } else {
                throw new Error("Failed to delete product.")
            }
        })
            .catch(err => {
                console.error("Error:", err)
                this.setState({ errorMessage: err.message || "An error occurred while deleting the product." })
                window.location.href = "/DisplayAllProducts"
            })
    }

    handleCloseModal = () => {
        this.setState({ showConfirmModal: false, showSuccessModal: false })
        window.location.href = "/DisplayAllProducts"
    }

    render() {
        const { product, showConfirmModal, showSuccessModal } = this.state

        return (
            <div>
                {showConfirmModal && product && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>Are you sure to delete {product.name}?</h4>
                            <p>This action cannot be undone.</p>
                            <button className="orange-button" onClick={this.handleConfirmDelete}>Yes</button>
                            <button className="red-button" onClick={this.handleCloseModal}>Cancel</button>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>Product Deleted Successfully!</h4>
                            <button className="orange-button" onClick={this.handleCloseModal}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}