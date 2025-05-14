'use client';

import {useState} from 'react';
import {BookedFlight, Flight, FlightInformation, UserInfo} from "@/actions/multi-step/types";


// Component to display flight search results
export function FlightSearchResults({flights}: { flights: Flight[] }) {

  const handleSelectedFlight = (flight: Flight) => {
    console.log('selected flight', flight)
  }

  return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">✈️ Available Flights</h2>
          <span className="text-gray-500">{flights.length} flights found</span>
        </div>

        <div className="space-y-4">
          {flights.map((flight) => (
              <div
                  key={flight.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleSelectedFlight(flight)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-indigo-600">{flight.airline} #{flight.flightNumber}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ${flight.price}
              </span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{flight.departureTime}</span>
                    <span className="text-gray-500 text-sm">{flight.origin}</span>
                  </div>

                  <div className="flex-1 mx-4 relative">
                    <div className="border-t-2 border-gray-300 border-dashed my-2"></div>
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -mt-2 -ml-1.5 top-1/2 left-0"></div>
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -mt-2 -mr-1.5 top-1/2 right-0"></div>
                    <div className="text-gray-500 text-xs text-center">Direct Flight</div>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-lg font-semibold">{flight.arrivalTime}</span>
                    <span className="text-gray-500 text-sm">{flight.destination}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 mt-3 flex justify-between">
                  <span className="text-gray-600">📅 {flight.date}</span>
                  <button
                      className="px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Select ✓
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}


// Component to display flight details for confirmation
export function FlightDetails({flight}: { flight: FlightInformation; }) {
  const badgeColor = flight.bookingStatus === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const seatCount = `${flight.availableSeats} seats available`;

  const handleConfirmFlight = () => {
    console.log('flight has been confirmed', flight)
  }

  return (

      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-1">🛫 Flight Details</h2>
          <p className="text-gray-600">Please review your flight information</p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-xl font-bold block text-indigo-800">{flight.airline}</span>
              <span className="text-gray-600">Flight #{flight.flightNumber}</span>
            </div>
            <div className="bg-indigo-600 text-white py-2 px-4 rounded-lg">
              ${flight.price}
            </div>
          </div>

          <div className="flex items-center justify-between my-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{flight.departureTime}</div>
              <div className="text-gray-600">{flight.origin}</div>
            </div>

            <div className="flex-1 mx-4">
              <div className="relative">
                <div className="h-0.5 bg-indigo-300 w-full mt-3"></div>
                <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-indigo-600 -mt-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-indigo-600 -mt-1"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-3">
                  <span className="text-indigo-600 text-3xl">✈️</span>
                </div>
              </div>
              <div className="text-center text-indigo-600 mt-2">Direct Flight</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{flight.arrivalTime}</div>
              <div className="text-gray-600">{flight.destination}</div>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4 border-indigo-100">
            <div>
              <span className="block font-medium">Date</span>
              <span className="text-gray-600">📅 {flight.date}</span>
            </div>
            <div>
              <span className="block font-medium">Baggage</span>
              <span className="text-gray-600">🧳 23kg included</span>
            </div>
            <div>
              <span className="block font-medium">Seat</span>
              <span className="text-gray-600">🪑 To be selected</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-indigo-100">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
              {flight.bookingStatus}
            </span>
            <span className="text-gray-600">{seatCount}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <button
              onClick={handleConfirmFlight}
              className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Confirm and Continue →
          </button>
        </div>
      </div>
  );
}

// Component to collect user information
export function CollectUserInfoForBooking({ flightNumber }: { flightNumber: string}) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    passportNumber: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setUserInfo(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(userInfo)
  };

  return (
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-1">👤 Passenger Information</h2>
          <p className="text-gray-600">Please fill in your details to complete the booking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="firstName">First Name</label>
              <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={userInfo.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1" htmlFor="lastName">Last Name</label>
              <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={userInfo.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="passportNumber">
              Passport Number 🛂
            </label>
            <input
                id="passportNumber"
                name="passportNumber"
                type="text"
                required
                value={userInfo.passportNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="AB1234567"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email Address 📧
            </label>
            <input
                id="email"
                name="email"
                type="email"
                required
                value={userInfo.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1" htmlFor="phone">
              Phone Number 📱
            </label>
            <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={userInfo.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+1 (123) 456-7890"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between">
            <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Complete Booking →
            </button>
          </div>
        </form>
      </div>
  );
}

// Pure component for loading state with an animated airplane
export function LoadingSpinner({message = "Loading..."}: { message?: string }) {
  return (
      <div className="flex flex-col items-center justify-center p-8 min-h-32">
        <div className="relative">
          {/* Cloud decorations */}
          <div className="absolute -top-6 -left-8 bg-white rounded-full h-8 w-16 opacity-70"></div>
          <div className="absolute -top-8 left-4 bg-white rounded-full h-6 w-10 opacity-70"></div>
          <div className="absolute -bottom-6 -right-8 bg-white rounded-full h-8 w-16 opacity-70"></div>
          <div className="absolute -bottom-8 right-4 bg-white rounded-full h-6 w-10 opacity-70"></div>

          {/* Animated airplane */}
          <div className="text-4xl animate-bounce transform-gpu animate-pulse relative">
            <span className="inline-block animate-[spin_3s_linear_infinite] transform-gpu">✈️</span>

            {/* Animated trail */}
            <div
                className="absolute top-1/2 right-full w-16 h-0.5 bg-gradient-to-l from-indigo-500 to-transparent animate-[ping_1.5s_ease-out_infinite]"></div>
          </div>
        </div>

        <p className="mt-6 text-lg text-indigo-700 font-medium animate-pulse">{message}</p>
      </div>
  );
}

// Component to display the flight ticket
export function FlightTicket({flight}: { flight: BookedFlight }) {


  return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">✈️ Boarding Pass</h2>
            <span className="text-xl">✅ Confirmed</span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Passenger</p>
              <p className="font-bold text-lg">{flight.passengerName}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Booking Reference</p>
              <p className="font-bold text-lg">{flight.bookingRef}</p>
            </div>
          </div>
        </div>

        <div className="p-6 relative">
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-100 rounded-full"></div>
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-100 rounded-full"></div>

          <div className="border-b border-dashed border-gray-300 pb-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-500 text-sm">From</p>
                <p className="font-bold text-lg">{flight.origin}</p>
                <p className="text-indigo-600">{flight.departureTime}</p>
              </div>

              <div className="text-center flex-1 mx-4">
                <div className="text-3xl text-indigo-500 mb-1">✈️</div>
                <div className="text-gray-500 text-sm">Direct Flight</div>
              </div>

              <div className="text-right">
                <p className="text-gray-500 text-sm">To</p>
                <p className="font-bold text-lg">{flight.destination}</p>
                <p className="text-indigo-600">{flight.arrivalTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Date</p>
                <p className="font-medium">📅 {flight.date}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Flight</p>
                <p className="font-medium">{flight.airline} #{flight.flightNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Gate</p>
                <p className="font-medium">🚪 B{Math.floor(Math.random() * 20) + 1}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Seat</p>
              <p className="font-medium">🪑 {Math.floor(Math.random() * 30) + 1}{String.fromCharCode(65 + Math.floor(Math.random() * 6))}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Class</p>
              <p className="font-medium">💺 Economy</p>
            </div>
          </div>
        </div>
      </div>
  );
}
