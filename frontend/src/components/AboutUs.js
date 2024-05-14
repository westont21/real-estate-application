import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import LayneHeadshot from '../assets/images/Layne4x6.jpg'; // Import Layne's headshot
import WestonHeadshot from '../assets/images/Headshot.jpg'; // Import Weston's headshot
import '../styles/AboutUs.css'; // Import the CSS file for About Us

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <Link to="/" style={{ color: 'black', textDecoration: 'none', position: 'absolute', top: '10px', left: '10px' }}>Home</Link> {/* Add Link for Home */}
            <h1>About Us</h1>
            <div className="about-us-content">
                <div className="profile">
                    <img src={LayneHeadshot} alt="Layne Trautmann" />
                    <h3>Layne Trautmann</h3>
                    <p>Layne is from Huntingdon Valley, PA, and moved to Palm Beach Gardens, Florida. Graduated with high honors from Lehigh University, Layne is passionate about real estate, particularly in South Florida. Believing that people deserve to choose a realtor based on low commission and save money, Layne co-founded this platform to make that a reality.</p>
                </div>
                <div className="profile">
                    <img src={WestonHeadshot} alt="Weston Trautmann" />
                    <h3>Weston Trautmann</h3>
                    <p>Weston is from Huntingdon Valley, PA, and moved to Palm Beach Gardens, Florida. Graduated with high honors from Lehigh University, Weston is passionate about real estate, particularly in South Florida. Believing that people deserve to choose a realtor based on low commission and save money, Weston co-founded this platform to make that a reality.</p>
                </div>
            </div>
            <div className="nar-info">
                <h2>NAR Settlement Agreement</h2>
                <p>
                    The national conversation around real estate commissions reached a crescendo since the National Association of REALTORS® announced a settlement agreement that would resolve litigation brought on behalf of home sellers related to broker commissions. Brokers and agents have their own questions about what comes next for their businesses, while at the same time trying to answer consumer inquiries. And many headlines aren’t separating fact from fiction, feeding misinformation to you and your clients.
                </p>
                <p>
                    Let’s clear the air: There’s no doubt the litigation—including copycat lawsuits that were filed after the Sitzer-Burnett verdict—caused considerable uncertainty in an industry already dealing with the effects of low inventory and interest rate increases. The settlement, which must be approved by a judge, provides a path forward for real estate professionals, REALTOR® associations, brokerages, MLSs and other industry stakeholders. Most importantly, it gives NAR members the chance to refocus on their core mission to support buyers and sellers.
                </p>
                ----This is the section with the rest of the writing----
            </div>
        </div>
    );
};

export default AboutUs;
