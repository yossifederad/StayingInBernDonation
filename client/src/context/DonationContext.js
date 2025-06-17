import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const DonationContext = createContext();

const initialState = {
  stats: {
    totalDonations: 0,
    totalAmount: 0,
    donations: 0,
    donationsAmount: 0,
    deposits: 0,
    depositsAmount: 0
  },
  recentDonations: [],
  loading: false,
  error: null
};

const donationReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_STATS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_STATS_SUCCESS':
      return { 
        ...state, 
        stats: action.payload, 
        loading: false 
      };
    case 'FETCH_RECENT_SUCCESS':
      return { 
        ...state, 
        recentDonations: action.payload, 
        loading: false 
      };
    case 'FETCH_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      };
    default:
      return state;
  }
};

export const DonationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(donationReducer, initialState);

  const fetchStats = async () => {
    try {
      dispatch({ type: 'FETCH_STATS_START' });
      const response = await axios.get('/api/donations/stats');
      dispatch({ 
        type: 'FETCH_STATS_SUCCESS', 
        payload: response.data.data 
      });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        payload: 'Failed to fetch statistics' 
      });
    }
  };

  const fetchRecentDonations = async () => {
    try {
      dispatch({ type: 'FETCH_STATS_START' });
      const response = await axios.get('/api/donations/recent');
      dispatch({ 
        type: 'FETCH_RECENT_SUCCESS', 
        payload: response.data.data 
      });
    } catch (error) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        payload: 'Failed to fetch recent donations' 
      });
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentDonations();
  }, []);

  const value = {
    ...state,
    fetchStats,
    fetchRecentDonations
  };

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  );
};

export const useDonation = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}; 