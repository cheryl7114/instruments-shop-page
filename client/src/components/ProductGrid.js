import React, {Component} from "react"
import ProductCard from "./ProductCard"


export default class ProductGrid extends Component
{
    render() 
    {
        return (
            <div className="product-grid">
                {this.props.products.map((product) => <ProductCard key={product._id} product={product}/>)}
            </div>
        )
    }
}