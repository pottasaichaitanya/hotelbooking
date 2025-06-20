import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUser, useAuth } from '@clerk/clerk-react'




axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const fetchRooms = async () => {
    try {
      const {data} = await axios.get('/api/room/');
      if (data.success) {
        console.log("Rooms fetched successfully:", data.rooms);
        setRooms(data.rooms);
        toast.success("Rooms fetched successfully");
      }
    }
    catch (error) {
      toast.error(error.message);
    }
  }
  useEffect(() => {
  
      fetchRooms();
    
  }, []);
  const fetchUser = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (data.success) {
        console.log("User data fetched successfully:", data);
        setIsOwner(data.role === 'hotelOwner');
        setSearchedCities(data.recentSearchedCities)

      }
      else {
        setTimeout(() => {
          fetchUser();
        }, 5000)
      }
    }
    catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {

    fetchUser();

  }, [])
  const value = {
    currency, navigate, user, getToken, isOwner, setIsOwner, axios, showHotelReg, setShowHotelReg,
    searchedCities, setSearchedCities, rooms, setRooms
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};