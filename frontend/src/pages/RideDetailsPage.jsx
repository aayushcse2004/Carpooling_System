import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RouteMap from "@/components/RouteMap";
import { isAuthenticated, isDriver, getCurrentUser, getAuthHeaders } from "@/utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RideDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [pickupNote, setPickupNote] = useState("");
  const [dropNote, setDropNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    async function fetchRide() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/rides/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load ride details");
        }

        setRide(data.ride || data);
      } catch (err) {
        setError(err.message || "Could not retrieve ride information");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchRide();
    }
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Please log in as a passenger to request a booking", {
        action: {
          label: "Log In",
          onClick: () => navigate("/login", { state: { from: { pathname: `/ride/${id}` } } }),
        },
      });
      return;
    }

    if (isDriver()) {
      toast.error("Driver accounts cannot book passenger seats. Please use a passenger account.");
      return;
    }

    if (!ride || ride.passengers < 1) {
      toast.error("This ride currently has no available seats");
      return;
    }

    setBookingLoading(true);

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          rideId: ride._id,
          seatsBooked: seatsToBook,
          pickupLocation: pickupNote || ride.from,
          dropLocation: dropNote || ride.to,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send booking request");
      }

      setBookingSuccess(data.booking);
      toast.success("Booking request sent to driver! Awaiting driver confirmation.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading verified ride details...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ride Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "The requested ride does not exist or has been removed."}</p>
          <Button
            onClick={() => navigate("/rides")}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
          >
            Browse Available Rides
          </Button>
        </div>
      </div>
    );
  }

  const driver = ride.driver || {};
  const isAvailable = (ride.passengers || 0) > 0;
  const totalPrice = (ride.contribution || 0) * seatsToBook;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/rides"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Ride Search</span>
          </Link>
        </div>

        {/* Ride Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>{ride.transport || "Sedan / Car"}</span>
                </span>
                {ride.completed ? (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                    Trip Completed
                  </span>
                ) : isAvailable ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    {ride.passengers} Seats Available
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    Fully Booked
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>{ride.from}</span>
                <span className="text-cyan-400">→</span>
                <span>{ride.to}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{ride.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{ride.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Verified CommuteX Driver</span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Seat Contribution
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">
                ₹{ride.contribution}
                <span className="text-sm font-normal text-slate-400"> / seat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column (Map & Driver) vs Right Column (Booking Widget) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Route Map Visualizer */}
            <RouteMap
              origin={ride.from}
              destination={ride.to}
              transportMode={ride.transport}
            />

            {/* Driver Profile Card */}
            <Card className="bg-slate-900/90 border-slate-800 shadow-xl rounded-2xl overflow-hidden backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
                      {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{driver.name || "Verified Driver"}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400">Verified Driver on CommuteX Platform</p>
                      {driver.carnumber && (
                        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 uppercase">
                          <Car className="w-3 h-3 text-cyan-400" />
                          <span>{driver.carnumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {driver.bio && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-sm text-slate-300 leading-relaxed">
                    "{driver.bio}"
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>{driver.phone ? `+91 ${driver.phone}` : "Contact provided on booking"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{driver.email || "driver@commutex.in"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commute Perks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <Sparkles className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Instant Request</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Direct request delivered to driver's dashboard instantly.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Cost-Sharing Safe</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Zero surge pricing. Fixed, community-fair travel expenses.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <Users className="w-5 h-5 text-teal-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Co-Commuters</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Travel with verified professionals and students.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Action Widget */}
          <div className="space-y-6">
            <Card className="bg-slate-900/95 border-slate-800 shadow-2xl rounded-2xl overflow-hidden sticky top-24 backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                {bookingSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      Your booking request for {bookingSuccess.seatsBooked} seat(s) has been sent to the driver for approval.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="font-semibold uppercase text-amber-400">Pending Approval</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Contribution:</span>
                        <span className="font-semibold text-emerald-400">₹{bookingSuccess.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pickup:</span>
                        <span className="text-white truncate max-w-[160px]">{bookingSuccess.pickupLocation}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/user-dashboard")}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-xl"
                    >
                      View in My Dashboard
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Reserve Seats</div>
                        <div className="text-sm text-slate-300 font-medium">{ride.passengers} seats remaining</div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-400">₹{ride.contribution}</span>
                        <span className="text-xs text-slate-400 block">per passenger</span>
                      </div>
                    </div>

                    {/* Seat Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-300">How many seats do you need?</Label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={seatsToBook <= 1}
                          onClick={() => setSeatsToBook((prev) => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-bold text-lg flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center py-2 bg-slate-950/60 border border-slate-800 rounded-xl font-bold text-white text-lg">
                          {seatsToBook}
                        </div>
                        <button
                          type="button"
                          disabled={seatsToBook >= (ride.passengers || 1)}
                          onClick={() => setSeatsToBook((prev) => Math.min(ride.passengers, prev + 1))}
                          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-bold text-lg flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Pickup & Drop Notes */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="pickup" className="text-xs text-slate-400">
                          Preferred Pickup Landmark (Optional)
                        </Label>
                        <Input
                          id="pickup"
                          type="text"
                          value={pickupNote}
                          onChange={(e) => setPickupNote(e.target.value)}
                          placeholder={`e.g. Near Metro Station in ${ride.from.split(",")[0]}`}
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="drop" className="text-xs text-slate-400">
                          Preferred Dropoff Landmark (Optional)
                        </Label>
                        <Input
                          id="drop"
                          type="text"
                          value={dropNote}
                          onChange={(e) => setDropNote(e.target.value)}
                          placeholder={`e.g. Near Bus Stand in ${ride.to.split(",")[0]}`}
                          className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-600 text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Total Price Summary */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>Fare calculation:</span>
                        <span>₹{ride.contribution} × {seatsToBook} seat(s)</span>
                      </div>
                      <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-2 text-base">
                        <span>Total Payable to Driver:</span>
                        <span className="text-emerald-400">₹{totalPrice}</span>
                      </div>
                    </div>

                    {/* Booking Button */}
                    <Button
                      type="submit"
                      disabled={bookingLoading || !isAvailable || ride.completed}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Request...</span>
                        </>
                      ) : !isAvailable ? (
                        <span>Ride Full (0 Seats Left)</span>
                      ) : ride.completed ? (
                        <span>Ride Completed</span>
                      ) : (
                        <>
                          <span>Request to Book Seats</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-center text-slate-500 leading-normal">
                      Driver will review your request. Payment is settled directly during the ride.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
