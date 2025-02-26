import React, { useState, useEffect } from 'react';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { lt } from 'date-fns/locale';
import { Calendar, Clock, Loader2, User, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { cabins } from '../config/cabins';
import { TimeSlot, BookingFormData } from '../types/booking';
import { useAuth } from '../context/AuthContext';
import { createBooking, fetchAvailableTimeSlots } from '../services/bookingService';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingCalendar() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCabin, setSelectedCabin] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const loadTimeSlots = async (cabinId: string, date: Date) => {
    try {
      setLoading(true);
      setError('');
      const slots = await fetchAvailableTimeSlots(cabinId, format(date, 'yyyy-MM-dd'));
      setTimeSlots(slots);
    } catch (err) {
      setError('Nepavyko užkrauti laisvų laikų');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCabin) {
      loadTimeSlots(selectedCabin, selectedDate);
    } else {
      setTimeSlots([]);
    }
  }, [selectedCabin, selectedDate]);

  const handleCabinSelect = async (cabinId: string) => {
    setSelectedCabin(cabinId);
    setSelectedTime('');
  };

  const formatDateTimeForWebhook = (date: Date, timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const bookingDate = new Date(date);
    bookingDate.setHours(parseInt(hours, 10));
    bookingDate.setMinutes(parseInt(minutes, 10));
    bookingDate.setSeconds(0);
    
    return format(bookingDate, "yyyy-MM-dd'T'HH:mm:ss");
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCabin || !selectedTime || !fullName || !email) {
      setError('Prašome užpildyti visus laukus');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData: BookingFormData = {
        cabin: selectedCabin,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      };

      const formattedDateTime = formatDateTimeForWebhook(selectedDate, selectedTime);

      const response = await fetch('https://hook.eu2.make.com/yw5ie28y0kmrkeafigpynd289dk6u1qh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          dateTime: formattedDateTime,
          timeZone: 'Europe/Vilnius',
          cabin: selectedCabin,
          cabinName: cabins.find(c => c.id === selectedCabin)?.name || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Webhook request failed');
      }

      setSuccess(true);
      setSelectedCabin('');
      setSelectedTime('');
      setTimeSlots([]);
      setFullName('');
      setEmail('');

      createBooking({
        ...bookingData,
        userId: user?.uid || 'anonymous',
        userEmail: email,
        status: 'confirmed',
      }).catch(console.error);
    } catch (err) {
      setError('Įvyko klaida! Prašome bandyti dar kartą.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 max-w-2xl mx-auto text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </motion.div>
        <h2 className="font-playfair text-3xl text-gray-900 mb-6">
          Rezervacija sėkmingai patvirtinta!
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Jūsų vizitas sėkmingai užregistruotas. Netrukus gausite patvirtinimo el. laišką su detalia informacija apie Jūsų rezervaciją. Dėkojame, kad pasirinkote ÉLIDA!
        </p>
        <div className="text-sm text-gray-500 mb-8 space-y-2">
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>Tel.: (8-644) 40596</p>
          <p>El. paštas: info@elida.lt</p>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            window.location.reload();
          }}
          className="px-8 py-3 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-full font-medium 
                   hover:shadow-lg transform hover:scale-105 transition-all duration-300 group"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Grįžti į rezervacijų kalendorių
          </span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            {error}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Cabin Selection */}
          <div>
            <h3 className="text-xl font-playfair text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-elida-gold/10 rounded-lg">
                <Calendar className="h-5 w-5 text-elida-gold" />
              </div>
              Pasirinkite kabiną
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cabins.map((cabin) => (
                <motion.button
                  key={cabin.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCabinSelect(cabin.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all duration-300
                    ${selectedCabin === cabin.id
                      ? 'border-elida-gold bg-gradient-to-br from-elida-gold/5 to-elida-gold/10 shadow-lg'
                      : 'border-gray-100 hover:border-elida-gold/50 hover:shadow-md'
                    }`}
                >
                  <h4 className="font-playfair text-lg text-gray-900 mb-2">{cabin.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">{cabin.description}</p>
                  <p className="text-elida-gold font-medium">
                    {cabin.pricePerMinute.toFixed(2)}€/min
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h3 className="text-xl font-playfair text-gray-900 mb-6">Pasirinkite datą</h3>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = addDays(new Date(), i);
                const isDisabled = isBefore(date, startOfToday());
                
                return (
                  <motion.button
                    key={i}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => setSelectedDate(date)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl text-center transition-all duration-300 ${
                      format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        ? 'bg-gradient-to-br from-elida-gold to-elida-accent text-white shadow-lg'
                        : isDisabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-white hover:bg-elida-gold/5 hover:shadow-md border border-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {format(date, 'EEE', { locale: lt })}
                    </div>
                    <div className="text-lg font-playfair mt-1">
                      {format(date, 'd')}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <h3 className="text-xl font-playfair text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-elida-gold/10 rounded-lg">
                <Clock className="h-5 w-5 text-elida-gold" />
              </div>
              Pasirinkite laiką
            </h3>
            {!selectedCabin ? (
              <p className="text-gray-500 text-center py-6 bg-gray-50/50 rounded-xl border border-gray-100">
                Pirmiausia pasirinkite kabiną
              </p>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-elida-gold animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                <AnimatePresence>
                  {timeSlots.map((slot) => (
                    <motion.button
                      key={slot.time}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedTime === slot.time
                          ? 'bg-gradient-to-br from-elida-gold to-elida-accent text-white shadow-lg'
                          : !slot.available
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'bg-white hover:bg-elida-gold/5 hover:shadow-md border border-gray-100'
                      }`}
                    >
                      {slot.time}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Contact Information Form */}
          <div className="space-y-6">
            <h3 className="text-xl font-playfair text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-elida-gold/10 rounded-lg">
                <User className="h-5 w-5 text-elida-gold" />
              </div>
              Kontaktinė Informacija
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Vardas Pavardė *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-100 
                           focus:ring-2 focus:ring-elida-gold focus:border-transparent
                           placeholder-gray-400 transition-all duration-300"
                  placeholder="Jonas Jonaitis"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  El. Paštas *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-100 
                           focus:ring-2 focus:ring-elida-gold focus:border-transparent
                           placeholder-gray-400 transition-all duration-300"
                  placeholder="jonas@pavyzdys.lt"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBooking}
            disabled={loading || !selectedCabin || !selectedTime || !fullName || !email}
            className="w-full py-4 bg-gradient-to-r from-elida-gold to-elida-accent text-white rounded-xl 
                     font-medium shadow-lg hover:shadow-xl transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                Tvirtinama rezervacija...
              </div>
            ) : (
              'Patvirtinti rezervaciją'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}