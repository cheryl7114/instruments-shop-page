import React, { Component } from "react"
import {Link} from "react-router-dom";

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeIndex: 0,
            nextIndex: 1
        }
        this.videoSrc = [
            "/HomePageVid1.mp4",
            "/HomePageVid2.mp4",
            "/HomePageVid3.mp4"
        ]

        this.interval = setInterval(() => {
            this.setState(prevState => ({
                activeIndex: prevState.nextIndex,
                // When the previous nextIndex reaches the end (2), 2 % 2 will go back to 0
                // Ensures the videos will loop infinitely
                nextIndex: (prevState.nextIndex + 1) % this.videoSrc.length
            }))
        }, 6000) // Switch video every 6 seconds
    }

    render() {
        const { activeIndex } = this.state

        return (
            <div className="home-container">
                <div className="video-header">
                    <div className="video-container">
                        {/* Videos will be visible based on what the active index is */}
                        {/* First video */}
                        <div className={`video-wrapper ${activeIndex === 0 ? 'active' : activeIndex === 1 ? 'next' : 'hidden'}`}>
                            {/* playsInline for proper display on mobile devices */}
                            <video autoPlay muted loop playsInline preload="auto">
                                <source src={this.videoSrc[0]} type="video/mp4" />
                            </video>
                        </div>

                        {/* Second video */}
                        <div className={`video-wrapper ${activeIndex === 1 ? 'active' : activeIndex === 2 ? 'next' : activeIndex === 0 ? 'next' : 'hidden'}`}>
                            <video autoPlay muted loop playsInline preload="auto">
                                <source src={this.videoSrc[1]} type="video/mp4" />
                            </video>
                        </div>

                        {/* Third video */}
                        <div className={`video-wrapper ${activeIndex === 2 ? 'active' : activeIndex === 0 ? 'next' : 'hidden'}`}>
                            <video autoPlay muted loop playsInline preload="auto">
                                <source src={this.videoSrc[2]} type="video/mp4" />
                            </video>
                        </div>

                        <div className="content-overlay">
                            <h2>The finest instruments, all in one place</h2>
                            <Link to={"/DisplayAllProducts"}>
                                <button className="shop-now-btn">
                                    SHOP NOW
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="featured-products">
                    <h2>Featured Instruments</h2>
                    <div className="product-grid">
                        <div className="product-card">
                            <img src="/guitarDemo.jpg" alt="Guitar" />
                            <h3>Faith Naked Mercury</h3>
                            <p>Perfect sound for any music style</p>
                            <Link to="/ProductDetails/67ce1df2c90701b4ac3a2536" className="no-underline">
                                <button className="orange-button">View Details</button><br/>
                            </Link>
                        </div>

                        <div className="product-card">
                            <img src="/pianoDemo.webp" alt="Piano" />
                            <h3>Casio Grand Hybrid</h3>
                            <p>Rich tones with elegant design</p>
                            <Link to="/ProductDetails/67ce1e5bc90701b4ac3a253d" className="no-underline">
                                <button className="orange-button">View Details</button><br/>
                            </Link>
                        </div>

                        <div className="product-card">
                            <img src="/violinDemo.jpg" alt="Violin" />
                            <h3>Hofner Ignition Violin</h3>
                            <p>Premium craftsmanship for every musician</p>
                            <Link to="/ProductDetails/67ce1ea0c90701b4ac3a2552" className="no-underline">
                                <button className="orange-button">View Details</button><br/>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="testimonials">
                    <h2>What Our Customers Say</h2>
                    <div className="testimonial">
                        <p>"This store has the best selection of musical instruments! The quality is unmatched and the customer service is excellent."</p>
                        <span>- Emily R.</span>
                    </div>
                    <div className="testimonial">
                        <p>"I purchased a grand piano and it sounds absolutely beautiful. Highly recommend for any serious musician!"</p>
                        <span>- James W.</span>
                    </div>
                </div>

                <div className="newsletter">
                    <h2>Stay Updated</h2>
                    <p>Subscribe to our newsletter for exclusive offers and the latest updates on our instruments.</p><br/>
                    <form>
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
        )
    }
}