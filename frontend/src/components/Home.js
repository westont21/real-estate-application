import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; // Link to your CSS file for the homepage
import jupiterHomePicture from '../assets/images/jup_home.jpg'; // Import the picuture
import LayneHeadshot from '../assets/images/Layne4x6.jpg'; // Import the video
import WestonHeadshot from '../assets/images/Headshot.jpg'; // Import the video
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function Home() {
    const { auth } = useAuth(); // Get the authentication state

    return (
        <div className="home-container">
            {/* Header content positioned over the video */}
            <header style={{ position: 'absolute', top: '10px', right: '20px', zIndex: 2 }}>
                <nav>
                    <Link to="/about-us" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>About Us</Link>
                    <Link to="/contracts" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>Contracts</Link>
                    <Link to="/users/search" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>Users</Link>
                    <Link to="/profile" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>Profile</Link>

                    {auth.isAuthenticated ? (
                        <Link to="/logout" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>Logout</Link>
                    ) : (
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginLeft: '20px' }}>Login</Link>
                    )}
                </nav>
            </header>

            <section className="photo-section">
                <img src={jupiterHomePicture} alt="Jupiter Home" className="background-photo" />

                <div className="overlay"></div> {/* Optional: Add an overlay to improve text readability */}
                <div className="content">
                    <h1>Negotiate Directly with Realtors</h1>
                    <p>Find your perfect match in the real estate market and save on commissions.</p>
                    <Link to="/posts/view" className="cta-button">Get Started</Link>
                </div>
            </section>



            <section className="testimonials-section">
                <div className="testimonial">
                    <blockquote>
                        "This platform helped me find the perfect agent who understood my needs and budget."
                    </blockquote>
                    <cite>- Jane Doe</cite>
                </div>
            </section>

            <section className="realtor-profiles">
                <h2>Meet Our Top Realtors</h2>
                <p>Our experienced realtors are here to help you find your dream home at the lowest possible fees. Click on their profiles to learn more about their services.</p>
                <div className="realtor-card">
                    <img src={LayneHeadshot} alt="Realtor 1" />
                    <div className="realtor-info">
                        <h3>Layne Trautmann</h3>
                    </div>
                </div>
                <div className="realtor-card">
                    <img src={WestonHeadshot} alt="Realtor 2" />
                    <div className="realtor-info">
                        <h3>Weston Trautmann</h3>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
