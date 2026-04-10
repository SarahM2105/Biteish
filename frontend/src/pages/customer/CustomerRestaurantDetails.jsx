import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { logout } from "../../components/utils/logout";
import useCustomerRestaurantDetails from "../../hooks/useCustomerRestaurantDetails";
import Header from "../../components/Customer/RestaurantDetails/Header";
import About from "../../components/Customer/RestaurantDetails/About";
import OpeningHours from "../../components/Customer/RestaurantDetails/OpeningHours";
import Menu from "../../components/Customer/RestaurantDetails/Menu";
import Reviews from "../../components/Customer/RestaurantDetails/Reviews";
import ReviewForm from "../../components/Customer/Reviews/ReviewForm";
import BookingSideBar from "../../components/Customer/RestaurantDetails/BookingSideBar";
import "../../components/Customer/RestaurantDetails/css/RestaurantReviewUpload.css";
import "../../components/Customer/RestaurantDetails/css/RestaurantCardDetails.css";
import "../../components/Customer/RestaurantDetails/css/RestaurantReviewForm.css";
import "../../components/Customer/RestaurantDetails/css/RestaurantReviews.css";
import "../../components/Customer/RestaurantDetails/css/RestaurantDetailsHeader.css";
import "../../components/Customer/RestaurantDetails/css/RestaurantDetailsLayout.css";

export default function CustomerRestaurantDetails() {
    const [collapsed, setCollapsed] = useState(true);
    const [active, setActive] = useState("Search and Filter");
    const [isDarkMode, setIsDarkMode] = useState(true);

    const navigate = useNavigate();
    const { restaurantId } = useParams();
    const { restaurant, loading, status } = useCustomerRestaurantDetails(restaurantId);

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <CustomerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="restaurant-details-page">
                {loading && <div className="restaurant-details-panel">Loading restaurant...</div>}
                {status && !loading && <div className="restaurant-details-panel">{status}</div>}

                {!loading && !status && restaurant && (
                    <>
                        <Header restaurant={restaurant} />

                        <div className="restaurant-details-grid">
                            <div className="restaurant-details-main">
                                <About restaurant={restaurant} />
                                <OpeningHours openingHours={restaurant.openingHours} />
                                <Menu />
                                <Reviews
                                    reviews={restaurant.reviews}
                                    averageRating={restaurant.averageRating}
                                    reviewCount={restaurant.reviewCount}
                                />
                                <ReviewForm
                                    restaurantId={restaurantId}
                                    onReviewCreated={(newReview) => {
                                        console.log("New review created:", newReview);
                                    }}
                                />
                            </div>

                            <div className="restaurant-details-side">
                                <BookingSideBar restaurant={restaurant} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}