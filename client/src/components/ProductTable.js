import React, {Component} from "react"
import ProductTableRow from "./ProductTableRow"


export default class ProductTable extends Component
{
    render() 
    {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Colour</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Image</th>
                        <th> </th>
                    </tr>
                </thead>
                  
                <tbody>
                    {this.props.products.map((product) => <ProductTableRow key={product._id} product={product}/>)}
                </tbody>
            </table>      
        )
    }
}