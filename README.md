# MINDly  
**Headlines for a healthier mind.**  

MINDly is a cross-platform mobile application built with React Native and backed by a Python Flask REST API.
The backend integrates with NewsAPI to fetch real-time articles, which are then processed through a custom NLP-based filtering algorithm that classifies and removes negative or harmful content. Only positive, feel-good stories are exposed to the client, ensuring a curated and mentally healthier news feed.
By combining API-driven content aggregation, algorithmic filtering, and a mobile-first UX, MINDly delivers an alternative news consumption experience optimized for mental well-being.

> According to a Grow Therapy survey, **99.6% of therapists believe news consumption negatively impacts mental health**.  
> MINDly is designed to change that.  


## Features  
- Curated feed of **positive, happy stories**  
- **Flask-powered backend** with a built-in news filtering algorithm  
- **Secure authentication system** — signup & login with hashed and verified passwords  
- Clean, **distraction-free React Native UI**  
- Designed to **support mental wellness** and mindful media habits  


---

## Authentication Flow  

MINDly includes a secure **login and signup system**.  
- User credentials are **stored securely** in the backend.  
- Passwords are **hashed and verified** before authentication (no plain-text storage).  
- Ensures user data protection while maintaining a smooth sign-in experience.
- Genres are picked from the start, as well as location data.

<p align="center">  
  <img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/5c217da2-5551-45ea-b4f0-63a1951fdde8" />
<img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/b95ad872-e08d-4bca-9f0d-d44785a4ffee" />
<img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/c6092f9c-96a6-41bf-871b-99538d3e6823" />
<img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/ea703c9a-f6e0-4531-9d52-26d8ca9abec4" />
</p>

##  The News Feed  

The core of MINDly is its **curated news feed**, designed to surface only positive, uplifting stories.  

- News articles are pulled from **NewsAPI**.  
- A custom **Flask backend algorithm** analyzes and filters the stories.  
  - Negative or harmful headlines are **removed**.  
  - Only **feel-good, positive news** is sent to the app.  
- The **React Native frontend** displays these stories in a clean, distraction-free interface.  

### Personalized Experience  
- Users choose their **preferences** during signup.  
- Stories are tailored to these categories.  
- Interactive features:  
  - **Swipe left or right** to navigate through stories  
  - **Save articles** for later viewing  

<p align="center">  
  <img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/e5356979-132c-4cb2-ab64-da3aa6fa8e74" />
<img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/516609b4-e332-46dd-ac32-b50759af24f4" />
<img width="202" height="852" alt="Image" src="https://github.com/user-attachments/assets/67bbfe55-6c7f-4b17-829e-ca3c71fd8808" />
</p>
