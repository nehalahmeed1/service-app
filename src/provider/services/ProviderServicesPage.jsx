import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const defaultServices = [
  { id: 1, name: "AC Repair" },
  { id: 2, name: "Home Cleaning" },
  { id: 3, name: "Plumbing" },
  { id: 4, name: "Electrical Work" },
  { id: 5, name: "Painting" }
];

const ProviderServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("providerServices")) ||
      defaultServices.map((s) => ({
        ...s,
        price: "",
        active: false
      }));

    setServices(stored);
  }, []);

  const toggleService = (id) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    );
  };

  const updatePrice = (id, price) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, price } : s
      )
    );
  };

  const saveServices = () => {
    localStorage.setItem(
      "providerServices",
      JSON.stringify(services)
    );
    alert("Services updated successfully");
  };

  return (
    <>
      <Helmet>
        <title>My Services - Provider</title>
      </Helmet>

      <div className="bg-background">
        <main>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              My Services & Pricing
            </h1>
            <p className="text-muted-foreground">
              Manage the services you offer and set your prices
            </p>
          </div>

          <div className="max-w-6xl space-y-4">

            {services.map((service) => (
              <div
                key={service.id}
                className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={service.active}
                    onChange={() =>
                      toggleService(service.id)
                    }
                    className="w-5 h-5"
                  />

                  <div>
                    <p className="font-semibold">
                      {service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Visible to customers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Price (₹)
                  </span>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={service.price}
                    onChange={(e) =>
                      updatePrice(
                        service.id,
                        e.target.value
                      )
                    }
                    disabled={!service.active}
                    className="border rounded-lg px-3 py-2 w-28 disabled:opacity-50"
                  />
                </div>
              </div>
            ))}

          </div>

          {/* Save Button */}
          <div className="max-w-6xl mt-8">
            <button
              onClick={saveServices}
              className="bg-primary text-white px-10 py-3 rounded-lg font-semibold"
            >
              Save Services
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderServicesPage;
