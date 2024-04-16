// src/components/Home.js
import React from 'react';
import './Home.css'; // Link to your CSS file for the homepage
import jupiterHomeVideo from '../assets/videos/jup_home.mp4'; // Import the video

function Home() {
    return (
        <div className="home-container">
            <section className="video-section">
                <video autoPlay loop muted className="background-video">
                    <source src={jupiterHomeVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="overlay"></div> {/* Optional: Add an overlay to improve text readability */}
                <div className="content">
                    <h1>Negotiate Directly with Realtors</h1>
                    <p>Find your perfect match in the real estate market and save on commissions.</p>
                    <button className="cta-button">Get Started</button>
                </div>
            </section>
            <section className="testimonials-section">
                <div className="testimonial">
                    <blockquote>
                        "This platform helped me find the perfect agent who understood my needs and budget."
                    </blockquote>
                    <cite>- Jane Doe</cite>
                </div>
                {/* Repeat for other testimonials */}
                <p>© 2024 Real Estate Connection. All rights reserved. Follow us on [Social Media Links]</p>
            </section>
        </div>
    );
}

export default Home;
