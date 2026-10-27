"use client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Car,
  Headphones,
  CheckCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { redirect } from "react-router-dom";
import LOCATIONS from "@/constants/locations";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function OfferRidePage({ onRidePublished }) {
  const [fromLocation, setFromLocation] = useState("");
  const navigate = useNavigate();
  const [toLocation, setToLocation] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [modeOfTransport, setModeOfTransport] = useState("Car");

  const locationOptions = LOCATIONS;

  const handleFromChange = (value) => {
    setFromLocation(value);
    setFromSuggestions(
      locationOptions.filter((loc) =>
        loc.toLowerCase().startsWith(value.toLowerCase())
      )
    );
  };

  const handleToChange = (value) => {
    setToLocation(value);
    setToSuggestions(
      locationOptions.filter((loc) =>
        loc.toLowerCase().startsWith(value.toLowerCase())
      )
    );
  };

  const handleSuggestionClick = (value, type) => {
    if (type === "from") {
      setFromLocation(value);
      setFromSuggestions([]);
    } else {
      setToLocation(value);
      setToSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    const driverId = sessionStorage.getItem("driverId");
    if (!driverId) {
      toast.error("Driver ID not found. Please log in as a driver.");
      return;
    }
    if (!fromLocation || !toLocation || !date || !time) {
      toast.error("Please fill in origin, destination, date, and departure time.");
      return;
    }

    const rideData = {
      from: fromLocation,
      to: toLocation,
      date,
      time,
      transport: modeOfTransport,
      passengers: parseInt(passengers, 10) || 1,
      contribution: parseFloat(contribution) || 0,
      driver: driverId,
    };

    try {
      const response = await fetch(`${API_URL}/rides/offer-ride`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Ride published successfully! Commuters can now book seats on your route.");
        if (onRidePublished) {
          onRidePublished();
        } else {
          navigate("/rider-dashboard");
        }
      } else {
        toast.error("Failed to publish ride: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Something went wrong while publishing the ride");
    }
  };

  const [passengers, setPassengers] = useState(2);
  const [contribution, setContribution] = useState(200);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);


  return (
    <div className="mt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="absolute inset-0 hero-grid opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 items-center">
            {/* Left Side - Form */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Card className="backdrop-blur-xl bg-white/40 border-white/50 rounded-3xl p-8 mb-6">
                <CardContent className="p-0">
                  <div className="space-y-6 grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {/* From Field */}
                    <div className="relative">
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <Input
                          placeholder="Enter pickup location"
                          value={fromLocation}
                          onChange={(e) => handleFromChange(e.target.value)}
                          className="border-0 bg-transparent text-slate-800 font-medium text-lg p-0 focus:ring-0 placeholder:text-slate-600"
                        />
                      </div>
                      {fromSuggestions.length > 0 && (
                        <ul className="absolute z-30 bg-white text-black w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
                          {fromSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                              onClick={() => handleSuggestionClick(suggestion, "from")}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* To Field */}
                    <div className="relative">
                      <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <Input
                          placeholder="Enter destination"
                          value={toLocation}
                          onChange={(e) => handleToChange(e.target.value)}
                          className="border-0 bg-transparent text-slate-800 font-medium text-lg p-0 focus:ring-0 placeholder:text-slate-600"
                        />
                      </div>
                      {toSuggestions.length > 0 && (
                        <ul className="absolute z-30 bg-white text-black w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
                          {toSuggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                              onClick={() => handleSuggestionClick(suggestion, "to")}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Date Input */}
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent border-0 text-slate-800 font-medium focus:outline-none placeholder:text-slate-600"
                      />
                    </div>

                    {/* Time Input */}
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="bg-transparent border-0 text-slate-800 font-medium focus:outline-none placeholder:text-slate-600"
                      />
                    </div>

                    {/* Mode of Transport */}
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50">
                      <Car className="w-5 h-5 text-slate-600" />
                      <select
                        value={modeOfTransport}
                        onChange={(e) => setModeOfTransport(e.target.value)}
                        className="bg-transparent border-0 text-slate-800 font-medium focus:outline-none"
                      >
                        {["Car", "Bike", "Auto", "Bus", "Taxi"].map((option) => (
                          <option key={option} value={option} className="text-slate-800 bg-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Passengers */}
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50">
                      <Users className="w-5 h-5 text-slate-600" />
                      <select
                        value={passengers}
                        onChange={(e) => setPassengers(parseInt(e.target.value))}
                        className="bg-transparent border-0 text-slate-800 font-medium focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num} className="text-slate-800 bg-white">
                            {num} passenger{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Money Input */}
                  <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-white/50 mt-4">
                    <span className="text-green-600 text-xl font-bold">₹</span>
                    <Input
                      type="number"
                      placeholder="Enter amount per passenger"
                      value={contribution}
                      onChange={(e) => setContribution(Number(e.target.value))}
                      className="bg-transparent border-0 text-slate-800 font-medium focus:outline-none w-[76%] placeholder:text-slate-600"
                    />
                    <span className="text-slate-600">per passenger</span>
                  </div>

                  <div className="mt-8">
                    <div className="text-center mb-6">
                      <p className="text-lg text-slate-700 mb-2">
                        Save up to <span className="text-2xl font-bold text-blue-600">₹1,624</span>
                      </p>
                      <p className="text-slate-600">on your first ride.</p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Publish a ride
                    </Button>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}
