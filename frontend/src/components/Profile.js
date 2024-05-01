import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
    const { auth, setAuth } = useAuth();
    const [title, setTitle] = useState(auth.user?.title || '');
    const [bio, setBio] = useState(auth.user?.bio || '');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState(auth.user?.profilePicture || '');

    useEffect(() => {
        if (auth.user?.profilePicture) {
            setProfilePictureUrl(auth.user.profilePicture);
        }
    }, [auth.user]);

// Ensure this code is part of your Profile.js to reflect the changes
const handleSaveProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);
    formData.append('title', title);
    formData.append('bio', bio);

    const response = await fetch('https://localhost:5001/updateProfile', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });

    const result = await response.json();
    if (response.ok) {
        setAuth({ ...auth, user: result.user });
        setProfilePictureUrl(result.user.profilePicture);
        console.log(result.message); // Log message to browser console
        alert('Profile updated successfully: ' + result.message);
    } else {
        console.error(result.message);
        alert('Failed to update profile: ' + result.message);
    }
};


    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
            <h1>Profile</h1>
            {profilePictureUrl && (
                            // Then use this state in your JSX to display the image:
            <img src={profilePictureUrl} alt="Profile" />
            )}
            <form onSubmit={handleSaveProfile}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                    />
                </div>
                <div>
                    <label>Bio:</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Bio"
                    />
                </div>
                <div>
                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        onChange={(e) => setProfilePicture(e.target.files[0])}
                    />
                </div>
                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
}

export default Profile;
