"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import LOCATIONS from "@/constants/locations";
import Logo from "@/components/ui/Logo";
import { clearSession, getAuthHeaders, getCurrentUser } from "@/utils/auth";
import OfferRidePage from "../OfferRidePage";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import {
  LayoutDashboard,
  BookOpen,
  Car,
  Bell,
  User,
  LogOut,
  Menu,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  XCircle,
  Navigation,
  MapPin,
  Calendar,
  Users,
  Edit,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function DriverDashboard() {
  const navigate = useNavigate();

  // Active section: 'dashboard' | 'requests' | 'offer-ride' | 'my-rides' | 'profile'
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Driver profile
  const [driverProfile, setDriverProfile] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Other",
    carnumber: "",
    bio: "",
    vehicleModel: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Offered rides
  const [offeredRides, setOfferedRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(false);

  // Passenger booking requests
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all");

  // Edit ride modal state
  const [editRide, setEditRide] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFromSuggestions, setEditFromSuggestions] = useState([]);
  const [editToSuggestions, setEditToSuggestions] = useState([]);

  // Fetch driver profile
  useEffect(() => {
    const saved = sessionStorage.getItem("driver");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDriverProfile((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone ? String(data.phone) : "",
          gender: data.gender || "Other",
          carnumber: data.carnumber || "",
          bio: data.bio || "",
          vehicleModel: data.vehicleModel || "",
        }));
      } catch (err) {}
    }

    // Also fetch fresh from backend
    async function fetchFreshProfile() {
      try {
        const res = await fetch(`${API_URL}/driver/profile`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.driver) {
            setDriverProfile(data.driver);
            sessionStorage.setItem("driver", JSON.stringify(data.driver));
          }
        }
      } catch (err) {}
    }
    fetchFreshProfile();
  }, []);

  // Fetch driver rides
  const fetchOfferedRides = async () => {
    setLoadingRides(true);
    try {
      const driverId = sessionStorage.getItem("driverId");
      if (!driverId) return;

      const response = await fetch(`${API_URL}/rides/my-rides?driverId=${driverId}`);
      if (response.ok) {
        const data = await response.json();
        setOfferedRides(data);
      }
    } catch (error) {
      toast.error("Failed to fetch offered rides");
    } finally {
      setLoadingRides(false);
    }
  };

  // Fetch passenger booking requests
  const fetchBookingRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch(`${API_URL}/bookings/driver-requests`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setBookingRequests(data.bookings || []);
      }
    } catch (error) {
      toast.error("Failed to load passenger booking requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchOfferedRides();
    fetchBookingRequests();
  }, []);

  // Handle Request Status (Approve or Reject)
  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking status");
      }

      toast.success(
        newStatus === "confirmed"
          ? "Booking approved! Seat confirmed for passenger."
          : "Booking request declined."
      );

      // Refresh both requests and rides
      fetchBookingRequests();
      fetchOfferedRides();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Mark ride completed
  const handleMarkComplete = async (rideId) => {
    try {
      const response = await fetch(`${API_URL}/rides/${rideId}/complete`, {
        method: "PATCH",
      });
      if (response.ok) {
        toast.success("Ride marked as completed!");
        fetchOfferedRides();
      } else {
        toast.error("Failed to update ride status");
      }
    } catch (err) {
      toast.error("Error completing ride");
    }
  };

  // Delete ride
  const deleteRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this published ride?")) return;

    try {
      const response = await fetch(`${API_URL}/rides/${rideId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOfferedRides((prev) => prev.filter((ride) => ride._id !== rideId));
        toast.success("Ride deleted successfully");
      } else {
        toast.error("Failed to delete ride");
      }
    } catch (error) {
      toast.error("Error deleting ride");
    }
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/driver/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(driverProfile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      sessionStorage.setItem("driver", JSON.stringify(data.driver));
      toast.success("Driver profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    toast.info("Logged out successfully");
    navigate("/role-selection");
  };

  // Stats
  const pendingRequests = bookingRequests.filter((b) => b.status === "pending");
  const confirmedBookings = bookingRequests.filter((b) => b.status === "confirmed");
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "requests",
      label: "Passenger Requests",
      icon: Users,
      badge: pendingRequests.length > 0 ? pendingRequests.length : null,
    },
    { id: "offer-ride", label: "Offer a Ride", icon: BookOpen },
    { id: "my-rides", label: "My Published Rides", icon: Car },
    { id: "profile", label: "Driver Profile", icon: User },
  ];

  const filteredRequests = bookingRequests.filter((b) => {
    if (requestFilter === "all") return true;
    return b.status === requestFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <Logo size="md" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                {driverProfile.name ? driverProfile.name.charAt(0).toUpperCase() : "D"}
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-white truncate">{driverProfile.name || "Driver"}</div>
                <div className="text-xs text-emerald-400 font-mono uppercase truncate">{driverProfile.carnumber || "Verified Driver"}</div>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="sm" />
          <div className="w-9" />
        </div>

        {/* SECTION: DASHBOARD */}
        {activeSection === "dashboard" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Driver Control Center</h1>
                <p className="text-slate-400 text-sm mt-1">Manage routes, approve commuter bookings, and review cost sharing</p>
              </div>
              <Button
                onClick={() => setActiveSection("offer-ride")}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Publish New Ride</span>
              </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Published Rides</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{offeredRides.length}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Pending Requests</div>
                    <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingRequests.length}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Confirmed Riders</div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-1">{confirmedBookings.length}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Cost Share Balance</div>
                    <div className="text-2xl font-extrabold text-teal-400 mt-1">₹{totalEarnings}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Action: Pending Requests Banner */}
            {pendingRequests.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    {pendingRequests.length}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">You have {pendingRequests.length} pending booking request(s)</h3>
                    <p className="text-xs text-slate-400">Review and approve seats to confirm commuter rides</p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSection("requests")}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Review Requests
                </Button>
              </div>
            )}

            {/* Recent Published Rides */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Published Rides</h2>
                <button
                  onClick={() => setActiveSection("my-rides")}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {offeredRides.length === 0 ? (
                <Card className="bg-slate-900/60 border-slate-800 rounded-2xl p-8 text-center">
                  <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-1">No Rides Published Yet</h3>
                  <p className="text-xs text-slate-400 mb-4">Publish your daily commute route to start accepting passengers</p>
                  <Button
                    onClick={() => setActiveSection("offer-ride")}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                  >
                    Publish a Ride
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offeredRides.slice(0, 4).map((ride) => (
                    <Card key={ride._id} className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {ride.transport || "Car"}
                        </span>
                        <span className="text-sm font-bold text-emerald-400">₹{ride.contribution} / seat</span>
                      </div>
                      <div className="font-bold text-white text-base mb-2">
                        {ride.from} → {ride.to}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                        <span>{ride.date}</span>
                        <span>•</span>
                        <span>{ride.time}</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-semibold">{ride.passengers} seats left</span>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        {!ride.completed ? (
                          <Button
                            onClick={() => handleMarkComplete(ride._id)}
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
                          >
                            Mark Completed
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold">Completed</span>
                        )}
                        <Button
                          onClick={() => deleteRide(ride._id)}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: PASSENGER REQUESTS */}
        {activeSection === "requests" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Passenger Booking Requests</h1>
                <p className="text-slate-400 text-sm mt-1">Review commuter requests and manage seat occupancy</p>
              </div>
              <Button
                onClick={fetchBookingRequests}
                variant="outline"
                size="sm"
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {["all", "pending", "confirmed", "rejected", "cancelled"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRequestFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    requestFilter === filter
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loadingRequests ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading passenger requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-800 rounded-2xl p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-white text-base mb-1">No Booking Requests Found</h3>
                <p className="text-xs text-slate-400">
                  {requestFilter === "all"
                    ? "When passengers request seats on your published rides, they will appear here."
                    : `No requests with status '${requestFilter}'.`}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((booking) => {
                  const passenger = booking.passenger || {};
                  const ride = booking.ride || {};
                  return (
                    <Card
                      key={booking._id}
                      className="bg-slate-900/90 border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                booking.status === "confirmed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : booking.status === "pending"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : booking.status === "rejected"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              Requested {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {ride.from || "Origin"} → {ride.to || "Destination"}
                          </h3>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Travel Date: {ride.date} at {ride.time}
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <div className="text-xs text-slate-400 font-semibold uppercase">Fare Amount</div>
                          <div className="text-2xl font-extrabold text-emerald-400">₹{booking.totalPrice}</div>
                          <div className="text-xs text-slate-400">{booking.seatsBooked} seat(s) requested</div>
                        </div>
                      </div>

                      {/* Passenger Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Passenger:</span>
                          <span className="font-bold text-white text-sm">{passenger.name || "Commuter"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Contact:</span>
                          <div className="flex items-center gap-2 text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{passenger.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{passenger.email}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Pickup / Drop Notes:</span>
                          <span className="text-slate-300">
                            {booking.pickupLocation || booking.notes || "Standard route stops"}
                          </span>
                        </div>
                      </div>

                      {/* Driver Actions for Pending Bookings */}
                      {booking.status === "pending" && (
                        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-800">
                          <Button
                            onClick={() => handleBookingStatus(booking._id, "confirmed")}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Booking</span>
                          </Button>
                          <Button
                            onClick={() => handleBookingStatus(booking._id, "rejected")}
                            variant="outline"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs rounded-xl flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION: OFFER A RIDE */}
        {activeSection === "offer-ride" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Offer a Ride</h1>
              <p className="text-slate-400 text-sm mt-1">Publish empty seats on your journey to share fuel costs</p>
            </div>
            <OfferRidePage onRidePublished={() => {
              fetchOfferedRides();
              setActiveSection("my-rides");
            }} />
          </div>
        )}

        {/* SECTION: MY PUBLISHED RIDES */}
        {activeSection === "my-rides" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">My Published Rides</h1>
                <p className="text-slate-400 text-sm mt-1">Manage departure times, remaining seats, and completed trips</p>
              </div>
              <Button
                onClick={() => setActiveSection("offer-ride")}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Publish New Ride</span>
              </Button>
            </div>

            {loadingRides ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading your published rides...</p>
              </div>
            ) : offeredRides.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-800 rounded-2xl p-12 text-center">
                <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-white text-base mb-1">No Rides Published</h3>
                <p className="text-xs text-slate-400 mb-4">Start sharing your travel route with passengers</p>
                <Button
                  onClick={() => setActiveSection("offer-ride")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
                >
                  Offer Your First Ride
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {offeredRides.map((ride) => (
                  <Card key={ride._id} className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {ride.transport || "Car"}
                        </span>
                        {ride.completed ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            Completed
                          </span>
                        ) : ride.passengers > 0 ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {ride.passengers} Seats Left
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Full
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-base mb-1">{ride.from}</h3>
                      <div className="text-xs text-cyan-400 mb-1">↓ via Expressway Corridor</div>
                      <h3 className="font-bold text-white text-base mb-3">{ride.to}</h3>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date:</span>
                          <span className="text-white font-medium">{ride.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Departure:</span>
                          <span className="text-white font-medium">{ride.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Contribution:</span>
                          <span className="text-emerald-400 font-bold">₹{ride.contribution} / seat</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                      {!ride.completed && (
                        <Button
                          onClick={() => handleMarkComplete(ride._id)}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
                        >
                          Mark Completed
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteRide(ride._id)}
                        size="sm"
                        variant="ghost"
                        className="text-xs text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: DRIVER PROFILE */}
        {activeSection === "profile" && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Driver Profile</h1>
              <p className="text-slate-400 text-sm mt-1">Keep your vehicle and contact details up to date</p>
            </div>

            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-name" className="text-xs text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="prof-name"
                      value={driverProfile.name}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-950/60 border-slate-800 text-white rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-email" className="text-xs text-slate-300">
                      Email Address (Read-only)
                    </Label>
                    <Input
                      id="prof-email"
                      value={driverProfile.email}
                      disabled
                      className="bg-slate-950/30 border-slate-800/50 text-slate-500 rounded-xl cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-phone" className="text-xs text-slate-300">
                      Phone Number
                    </Label>
                    <Input
                      id="prof-phone"
                      value={driverProfile.phone}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 9876543210"
                      className="bg-slate-950/60 border-slate-800 text-white rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-carnumber" className="text-xs text-slate-300">
                      Vehicle License Plate
                    </Label>
                    <Input
                      id="prof-carnumber"
                      value={driverProfile.carnumber}
                      onChange={(e) => setDriverProfile((prev) => ({ ...prev, carnumber: e.target.value.toUpperCase() }))}
                      placeholder="DL 01 AB 1234"
                      className="bg-slate-950/60 border-slate-800 text-white rounded-xl uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-vehicle" className="text-xs text-slate-300">
                    Vehicle Model (e.g. Honda City, Maruti Swift)
                  </Label>
                  <Input
                    id="prof-vehicle"
                    value={driverProfile.vehicleModel || ""}
                    onChange={(e) => setDriverProfile((prev) => ({ ...prev, vehicleModel: e.target.value }))}
                    placeholder="e.g. Honda City White 2022"
                    className="bg-slate-950/60 border-slate-800 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-bio" className="text-xs text-slate-300">
                    Driver Bio / Notes for Passengers
                  </Label>
                  <textarea
                    id="prof-bio"
                    rows={3}
                    value={driverProfile.bio || ""}
                    onChange={(e) => setDriverProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="e.g. Regular commuter on Chandigarh-Delhi highway. Non-smoking, AC ride."
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 text-white rounded-xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl py-2.5 mt-2"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}