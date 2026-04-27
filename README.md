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
    -Express 
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


#how to navigate through this
all design documents and diagrams along with interim report = /docs/artifacts 