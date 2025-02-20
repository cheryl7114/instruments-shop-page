import React, {Component} from "react"
import {Link} from "react-router-dom"

import {ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN} from "../config/global_constants"


export default class ProductTableRow extends Component
{
    render()
    {
        return (
            <div className="product-card">
                <img
                    src={this.props.product.images[0]}
                    alt={this.props.product.name}
                    width="150"
                    height="120"
                />
                <h3>{this.props.product.name}</h3>
                <p><strong>Brand:</strong>{this.props.product.brand}</p>
                <p><strong>Colour:</strong>{this.props.product.colour}</p>
                <p><strong>Category:</strong>{this.props.product.category}</p>
                <p><strong>Stock:</strong>{this.props.product.stock}</p>
                <p><strong>Price:</strong>{this.props.product.price}</p>
                <p>
                    {localStorage.accessLevel > ACCESS_LEVEL_GUEST ? <Link className="green-button" to={"/EditProduct/" + this.props.product._id}>Edit</Link> : null}

                    {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ? <Link className="red-button" to={"/DeleteProduct/" + this.props.product._id}>Delete</Link> : null}
                </p>
            </div>
        )
    }
}