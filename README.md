# 📅 Parent–Teacher Meeting Scheduler (WeChat Mini Program)

A WeChat Mini Program that streamlines parent–teacher conference scheduling using Tencent Cloud services. This tool allows parents to select preferred time slots and teachers, while automatically generating a conflict-free schedule.

---

## 🚀 Features

* 🧑‍🤝‍🧑 **Parent Registration**

  * Parents select teachers they want to meet
  * Input preferred 30-minute time slots

* 🕒 **Smart Scheduling Algorithm**

  * Assigns meeting times within ±1 hour of preferred slots
  * Minimizes conflicts across all participants
  * Optimizes teacher availability

* ☁️ **Tencent Cloud Integration**

  * Cloud database for storing users and schedules
  * Cloud functions for running scheduling logic
  * Secure and scalable backend

* 📱 **WeChat Mini Program Interface**

  * Clean UI for input and schedule viewing
  * Real-time updates and data sync

---

## 🏗️ Tech Stack

* **Frontend**: WeChat Mini Program (WXML, WXSS, JavaScript)
* **Backend**: Tencent Cloud (Cloud Functions + Cloud Database)
* **Development Tool**: Tencent Developer Tools

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Open in Tencent Developer Tools

* Download and install **Tencent Developer Tools**
* Open the project folder
* Log in with your WeChat account
* Configure your AppID (or use a test AppID)

### 3. Enable Cloud Development

* Turn on **Cloud Development (云开发)**
* Create a cloud environment
* Update environment ID in the project config

### 4. Deploy Cloud Functions

* Navigate to the `/cloudfunctions` directory
* Upload and deploy all functions via the developer tools

### 5. Run the Program

* Click **Preview** or **Simulator**
* Test parent input and scheduling workflow

---

## 🧠 Scheduling Logic Overview

* Each parent submits:

  * A list of teachers
  * A preferred 30-minute time slot
* The algorithm:

  * Attempts to assign meetings within ±1 hour of preference
  * Ensures no overlapping meetings for teachers or parents
  * Iterates to maximize satisfaction across all users

---

## 📂 Project Structure

```
/miniprogram        # Frontend code
/cloudfunctions     # Backend scheduling logic
/utils              # Helper functions
/config             # App configuration
```

---

## 🛠️ Future Improvements

* Add real-time notifications for schedule updates
* Improve scheduling algorithm (e.g., priority weighting)
* Support multi-day scheduling
* Admin dashboard for schools

---

## 🤝 Contributing

Feel free to fork this repo and submit pull requests. Suggestions and improvements are welcome.

---

## 📄 License

This project is for educational purposes. Add a license if you plan to distribute or reuse.
