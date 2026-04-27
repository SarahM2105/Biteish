# Biteish: A Website to Aid Restaurant Booking 

## Information about this repository

This is the repository that you are going to use **individually** for developing your project. Please use the resources provided in the module to learn about **plagiarism** and how plagiarism awareness can foster your learning.

Regarding the use of this repository, once a feature (or part of it) is developed and **working** or parts of your system are integrated and **working**, define a commit and push it to the remote repository. You may find yourself making a commit after a productive hour of work (or even after 20 minutes!), for example. Choose commit message wisely and be concise.

Please choose the structure of the contents of this repository that suits the needs of your project but do indicate in this file where the main software artefacts are located.

# project overview 
Biteish is a web-based restaurant booking and management system dveleoped for the CO3204 Software Engineeing Project. 
It is built around 3 main roles:
    - Customers can discover restaurants, make table reservations, manage bookings, receive notifications, and check-ins which can be manual or by using QR codes. 
    - Restaurant owners can manage their restaurant profile, tables, zones, menus, booking requests, check-ins, analytics and service activity. 
    - Admin users have a separate dashboard for platform level management (not implemented yet).

# Main features of the project 

## Customer features 
    - search and filter restaurants 
    - view restaurant details such as opening hours, reviews...etc
    - save restaurants to view them later 
    - receive personalised and popular restaurant recommendations 
    - being able to create bookings through providing prefered booking details
    - view upcomming, pending, and previous bookings
    - request for booking changes 
    - cancel bookings 
    - viewing and using QR codes for confirmed bookings 
    - recieve notifications 

## restaurant owner features:
    - managing restaurants profile information 
    - create and manage tables and zones 
    - Managing menu sections and menu items 
    - approve or decline new booking requests
    - approve or decline change requests 
    - review customer booking change requests 
    - propose alternative booking changes
    - check customers in using QR scan, token inputs or manual table check-ins 
    - check guests out from occupied tables 
    - view dashboard summaries, late arrivals, and analytics 
    - recieve owner notifications 

## admin features 
    - not implemented yet


## technologies used 

### frontend 
    - react 
    - react router 
    - socket.IO 
    - leaflet

### backend
    - node.js
    - Express 
    - prisma ORM 
    - postgreSQL 
    - jwt authentication 
    - bcrypt password hashing 
    - socket.IO for real time updates 
    - nodemailer for email notifications 
    - cloudinary for image storage 
    - multer for image upload handling

### testing 

    - postman was used for manual api testing 
    - node.js built-in test runner was used for automated test units 

## project structure 

backend/
    src/ 
        controllers/ 
        middleware/
        routes/
        utils/
        app.js
    tests/
frontend 
    src/
        components/ 
        hooks/ 
        layouts/
        pages/
        socket.js
prisma/
    schema.prisma


#how to navigate through this
all design documents and diagrams along with interim report = /docs/artifacts 

backend/
    src/ 
        controllers/ backend logic for authentication, bookings, owners, customers, menus, reccomendations, and check ins 
        middleware/ authentication and the role based access middleware 
        routes/ express routes definitions 
        utils/  shared backedn helper functions 
        app.js express server entry point 
    tests/ automated backedn unit tests 
frontend 
    src/
        components/ reuseable react ui components 
        hooks/ custom hooks (react) for API and page logic 
        layouts/ shared layouts 
        pages/  customer, owner, admin pages 
        socket.js frontend socket io setup
prisma/
    schema.prisma db schema and model definitions 

docs/ 
    artifacts  project diagrams and reports 
README.md project setup and documentation

## Setup 

### Install dependencies 
npm install 

### Generate Prisma Client 
npx prisma generate 

### Start backend 
// go to backend dir 
cd backend 
npm start 

### start frontend 
// go to frontend dir 
cd frontend 
npm install
npm start

## environment variables 
create env file using env example 
required variables 
DATABASE_URL="your_database_url_here"
JWT_SECRET="your_jwt_secret_here"
EMAIL_USER="your_email_here"
EMAIL_PASS="your_email_app_password_here"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

## limitations 
- admin tools not completed 
-full deployment not completed
-large scale testing was not carried out
