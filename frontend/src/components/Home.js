// src/components/Home.js
import React, { useEffect, useState } from 'react';
import './Home.css'; // Link to your CSS file for the homepage
import jupiterHomeImage from '../assets/images/jup_home.jpg'; // Import the image

function Home() {
    const [typedText, setTypedText] = useState('');

    useEffect(() => {
        const textToType = "Negotiate Directly with Realtors"; // Text to be typed
        let index = 0;

        const typingInterval = setInterval(() => {
            setTypedText((prevTypedText) => prevTypedText + textToType[index]);
            index++;
            if (index === textToType.length) {
                clearInterval(typingInterval);
            }
        }, 100); // Typing speed (milliseconds)

        return () => clearInterval(typingInterval); // Clean up on unmount
    }, []);

    return (
        <div className="home-container">
            <section className="content-section">
                <div className="hero-text">
                    <h1>{typedText}</h1>
                    <p>Find your perfect match in the real estate market and save on commissions.</p>
                    <button className="cta-button">Get Started</button>
                </div>
            </section>
            <section className="image-section">
                <img src={jupiterHomeImage} alt="Jupiter Home" />
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
