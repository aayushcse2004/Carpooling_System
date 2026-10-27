import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";
import { clearSession, getAuthHeaders, getCurrentUser } from "@/utils/auth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import {
  LayoutDashboard,
  Search,
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
  Phone,
  Mail,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();

  // Active section: 'dashboard' | 'my-bookings' | 'profile'
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User profile
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Real Booked Rides
  const [bookedRides, setBookedRides] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");

  // Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            bio: data.user.bio || "",
          });
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }
      } else {
        const fallback = getCurrentUser() || {};
        setUserProfile((prev) => ({
          ...prev,
          name: fallback.name || "",
          email: fallback.email || "",
          phone: fallback.phone || "",
          bio: fallback.bio || "",
        }));
      }
    } catch (err) {
      const fallback = getCurrentUser() || {};
      setUserProfile((prev) => ({
        ...prev,
        name: fallback.name || "",
        email: fallback.email || "",
      }));
    }
  };

  // Fetch real passenger bookings
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setBookedRides(data.bookings || []);
      } else {
        toast.error("Failed to fetch your bookings");
      }
    } catch (err) {
      toast.error("Network error fetching bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }
      toast.success("Booking successfully cancelled");
      fetchBookings();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userProfile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      sessionStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile updated successfully!");
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

  // Stats calculations
  const pendingCount = bookedRides.filter((b) => b.status === "pending").length;
  const confirmedCount = bookedRides.filter((b) => b.status === "confirmed").length;
  const totalSpent = bookedRides
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "my-bookings",
      label: "My Bookings",
      icon: Car,
      badge: confirmedCount > 0 ? confirmedCount : null,
    },
    { id: "profile", label: "Profile", icon: User },
  ];

  const filteredBookings = bookedRides.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
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
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-white truncate">{userProfile.name || "Passenger"}</div>
                <div className="text-xs text-cyan-400 font-medium truncate">Commuter</div>
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
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            to="/rides"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Search New Rides</span>
          </Link>
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

        {/* SECTION: DASHBOARD OVERVIEW */}
        {activeSection === "dashboard" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Passenger Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Track your upcoming commuter trips, bookings, and expense savings</p>
              </div>
              <Button
                onClick={() => navigate("/rides")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20"
              >
                <Search className="w-4 h-4 mr-2" />
                <span>Find a Ride</span>
              </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Total Bookings</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{bookedRides.length}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Pending Approval</div>
                    <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Confirmed Trips</div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-1">{confirmedCount}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase">Total Saved / Spent</div>
                    <div className="text-2xl font-extrabold text-teal-400 mt-1">₹{totalSpent}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Upcoming Confirmed Rides */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Confirmed Journeys</h2>
                <button
                  onClick={() => setActiveSection("my-bookings")}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View All Bookings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {bookedRides.filter((b) => b.status === "confirmed").length === 0 ? (
                <Card className="bg-slate-900/60 border-slate-800 rounded-2xl p-8 text-center">
                  <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-1">No Confirmed Trips Yet</h3>
                  <p className="text-xs text-slate-400 mb-4">Search available rides between 50+ cities across India</p>
                  <Button
                    onClick={() => navigate("/rides")}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
                  >
                    Browse Available Rides
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookedRides
                    .filter((b) => b.status === "confirmed")
                    .slice(0, 4)
                    .map((booking) => {
                      const ride = booking.ride || {};
                      const driver = booking.driver || {};
                      return (
                        <Card key={booking._id} className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Confirmed Trip
                            </span>
                            <span className="text-sm font-bold text-emerald-400">₹{booking.totalPrice}</span>
                          </div>
                          <div className="font-bold text-white text-base mb-2">
                            {ride.from} → {ride.to}
                          </div>
                          <div className="text-xs text-slate-400 mb-4 space-y-1">
                            <div>Travel Date: {ride.date} at {ride.time}</div>
                            <div>Driver: <span className="text-white font-semibold">{driver.name || "Verified Driver"}</span> ({driver.phone ? `+91 ${driver.phone}` : "Contact provided"})</div>
                            <div>Vehicle: <span className="font-mono text-cyan-400 uppercase">{driver.carnumber}</span></div>
                          </div>
                          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                            <span className="text-slate-400">{booking.seatsBooked} seat(s) reserved</span>
                            <Button
                              onClick={() => handleCancelBooking(booking._id)}
                              variant="ghost"
                              size="sm"
                              className="text-rose-400 hover:bg-rose-500/10 text-xs h-7"
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: MY BOOKINGS */}
        {activeSection === "my-bookings" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">My Bookings History</h1>
                <p className="text-slate-400 text-sm mt-1">Review all your requested, confirmed, and past travel itineraries</p>
              </div>
              <Button
                onClick={fetchBookings}
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
                  onClick={() => setBookingFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    bookingFilter === filter
                      ? "bg-cyan-500 text-slate-950 shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loadingBookings ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading your bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card className="bg-slate-900/60 border-slate-800 rounded-2xl p-12 text-center">
                <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-white text-base mb-1">No Bookings Found</h3>
                <p className="text-xs text-slate-400 mb-6">
                  {bookingFilter === "all"
                    ? "You haven't requested any rides yet. Find your next journey today!"
                    : `No bookings found with status '${bookingFilter}'.`}
                </p>
                <Button
                  onClick={() => navigate("/rides")}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                  Search & Book Rides
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const ride = booking.ride || {};
                  const driver = booking.driver || {};
                  const isCancelable = booking.status === "pending" || booking.status === "confirmed";

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
                              {booking.status === "pending" ? "Awaiting Driver Approval" : booking.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {ride.from || "Pickup"} → {ride.to || "Dropoff"}
                          </h3>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Departure Date: {ride.date} at {ride.time}
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <div className="text-xs text-slate-400 font-semibold uppercase">Total Contribution</div>
                          <div className="text-2xl font-extrabold text-emerald-400">₹{booking.totalPrice}</div>
                          <div className="text-xs text-slate-400">{booking.seatsBooked} seat(s) booked</div>
                        </div>
                      </div>

                      {/* Driver & Route Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Driver Name:</span>
                          <span className="font-bold text-white text-sm">{driver.name || "Verified Driver"}</span>
                          {driver.carnumber && (
                            <div className="mt-1 font-mono uppercase text-cyan-400">{driver.carnumber}</div>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Driver Contact:</span>
                          <div className="flex items-center gap-2 text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{driver.phone ? `+91 ${driver.phone}` : "Provided upon approval"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{driver.email}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Pickup / Drop:</span>
                          <span className="text-slate-300">
                            {booking.pickupLocation || booking.notes || "Standard route stops"}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation Action */}
                      {isCancelable && (
                        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
                          <Button
                            onClick={() => handleCancelBooking(booking._id)}
                            variant="outline"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs rounded-xl"
                          >
                            Cancel This Booking
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

        {/* SECTION: PASSENGER PROFILE */}
        {activeSection === "profile" && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Passenger Profile</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your account information and contact preferences</p>
            </div>

            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name" className="text-xs text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="prof-name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-950/60 border-slate-800 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-email" className="text-xs text-slate-300">
                    Email Address (Read-only)
                  </Label>
                  <Input
                    id="prof-email"
                    value={userProfile.email}
                    disabled
                    className="bg-slate-950/30 border-slate-800/50 text-slate-500 rounded-xl cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-phone" className="text-xs text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="prof-phone"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. 9876543210"
                    className="bg-slate-950/60 border-slate-800 text-white rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prof-bio" className="text-xs text-slate-300">
                    Bio / Commute Notes
                  </Label>
                  <textarea
                    id="prof-bio"
                    rows={3}
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="e.g. Daily commuter between Delhi and Gurgaon. Quiet passenger with light backpack."
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 text-white rounded-xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl py-2.5 mt-2"
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
