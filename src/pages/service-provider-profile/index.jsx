import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../../components/navigation/Header";
import BottomNav from "../../components/navigation/BottomNav";
import QuickActionMenu from "../../components/navigation/QuickActionMenu";
import Icon from "../../components/AppIcon";
import ProfileHero from "./components/ProfileHero";
import QuickStats from "./components/QuickStats";
import ServicesTab from "./components/ServicesTab";
import PortfolioTab from "./components/PortfolioTab";
import ReviewsTab from "./components/ReviewsTab";
import AvailabilityTab from "./components/AvailabilityTab";
import CredentialsTab from "./components/CredentialsTab";

const ServiceProviderProfile = () => {
  const navigate = useNavigate();
  const { providerId } = useParams(); // ✅ FIX
  const [activeTab, setActiveTab] = useState("services");

  /* 🔧 TEMP MOCK (later replace with Firestore/API) */
  useEffect(() => {
    if (!providerId) {
      navigate("/customer/home", { replace: true });
    }
  }, [providerId, navigate]);

  /* ✅ KEEP YOUR EXISTING DATA (UNCHANGED) */
  const providerData = {
    name: "Michael Rodriguez",
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 247,
    isVerified: true,
    isOnline: true,
    serviceCategories: ["Electrician", "Home Automation", "Solar Installation"],
    bio:
      "Licensed master electrician with over 15 years of experience in residential and commercial electrical work.",
    profileImage:
      "https://img.rocket.new/generatedImages/rocket_gen_img_18a016e9d-1763299228900.png",
    coverImage:
      "https://img.rocket.new/generatedImages/rocket_gen_img_10d4acb51-1765171680782.png",
  };

  const tabs = [
    { id: "services", label: "Services", icon: "Wrench" },
    { id: "portfolio", label: "Portfolio", icon: "Image" },
    { id: "reviews", label: "Reviews", icon: "Star" },
    { id: "availability", label: "Availability", icon: "Calendar" },
    { id: "credentials", label: "Credentials", icon: "Award" },
  ];

  return (
    <>
      <Helmet>
        <title>
          {providerData.name} | Service Provider | ServiceConnect
        </title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
          <ProfileHero
            provider={providerData}
            onRequestQuote={() => navigate("/service-request-form")}
            onMessage={() => console.log("Message provider")}
            onBookService={() => navigate("/booking-management")}
          />

          <div className="bg-card rounded-xl shadow-md mt-6">
            <div className="border-b border-border flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "services" && <ServicesTab />}
              {activeTab === "portfolio" && <PortfolioTab />}
              {activeTab === "reviews" && <ReviewsTab />}
              {activeTab === "availability" && <AvailabilityTab />}
              {activeTab === "credentials" && <CredentialsTab />}
            </div>
          </div>
        </main>

        <BottomNav />
        <QuickActionMenu />
      </div>
    </>
  );
};

export default ServiceProviderProfile;
