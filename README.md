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
  <img width="202" height="652" alt="Login screen" src="https://github.com/user-attachments/assets/da5f9244-2873-43c7-930b-3eeae5136bdc" />  
  <img width="202" height="652" alt="Signup screen" src="https://github.com/user-attachments/assets/263bc031-79a2-4ee4-accd-f08bca9cb087" />  
  <img width="202" height="652" alt="Signup success" src="https://github.com/user-attachments/assets/fd0824f9-b97d-4a67-8ce9-34c728c29e72" />  
  <img width="202" height="652" alt="Login success" src="https://github.com/user-attachments/assets/880f970d-0d8d-45e8-abde-c457ef01deab" />  
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
  <img width="202" height="652" alt="News feed screen" src="https://github.com/user-attachments/assets/84fd768a-5bde-4b93-b6a8-7b44a77035f3" />  
  <img width="202" height="652" alt="Swipe feed screen" src="https://github.com/user-attachments/assets/52a71589-2be6-4475-8c7b-5426c94e2850" />  
  <img width="202" height="652" alt="Saved articles screen" src="https://github.com/user-attachments/assets/8b17f724-8fc5-48ba-8634-cd094d6208e8" />  
</p>
