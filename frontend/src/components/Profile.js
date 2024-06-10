//This is for your own profile viewing and setup 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
   const { auth, setAuth } = useAuth();
   const [title, setTitle] = useState('');
   const [bio, setBio] = useState('');
   const [profilePicture, setProfilePicture] = useState(null);
   const [profilePictureUrl, setProfilePictureUrl] = useState('');


   useEffect(() => {
       async function fetchUserProfile() {
           const response = await fetch('https://localhost:5001/getUserProfile', {
               method: 'GET',
               credentials: 'include',
           });
           const result = await response.json();
           if (response.ok) {
               setTitle(result.user.title);
               setBio(result.user.bio);
               setProfilePictureUrl(result.user.profilePicture);
           } else {
               console.error('Failed to fetch profile:', result.message);
           }
       }


       fetchUserProfile();
   }, []);


   const handleSaveProfile = async (event) => {
       event.preventDefault();
       const formData = new FormData();
       if (profilePicture) {
           formData.append('profilePicture', profilePicture);
       }
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
           alert('Profile updated successfully: ' + result.message);
       } else {
           alert('Failed to update profile: ' + result.message);
       }
   };


   return (
       <div className="container">
           <h1 className="header">Profile</h1>
           {profilePictureUrl && (
               <img
                   src={profilePictureUrl}
                   alt="Profile"
                   className="profileImage"
               />
           )}
           <form onSubmit={handleSaveProfile} className="formGroup">
               <label className="formLabel">Title:</label>
               <input
                   type="text"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="Title"
                   className="formInput"
               />


               <label className="formLabel">Bio:</label>
               <textarea
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   placeholder="Bio"
                   className="formTextArea"
               />


               <label className="formLabel">Profile Picture:</label>
               <input
                   type="file"
                   onChange={(e) => setProfilePicture(e.target.files[0])}
                   className="formInput"
               />
               <button type="submit" className="button">Save Profile</button>
           </form>
       </div>
   );
}


export default Profile;



