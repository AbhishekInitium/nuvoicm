
import { IncentivePlan } from '@/types/incentiveTypes';
import axios from 'axios';

/**
 * Service to handle database operations for incentive schemes
 * This implementation makes API calls to a backend service that connects to MongoDB
 */

// Define the API base URL - replace with your actual backend URL when deployed
const API_BASE_URL = 'http://localhost:3001/api/incentives';

/**
 * Generate a scheme name with timestamp format ICM_DDMMYY_HHMMSS
 */
const generateSchemeTimestampId = () => {
  const now = new Date();
  
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).substring(2);
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `ICM_${day}${month}${year}_${hours}${minutes}${seconds}`;
};

/**
 * Check server health before saving
 */
const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get('http://localhost:3001/health');
    return response.data.status === 'ok' && response.data.mongodb === 'connected';
  } catch (error) {
    console.error("Server health check failed:", error);
    return false;
  }
};

/**
 * Save an incentive scheme in MongoDB
 */
export const saveIncentiveScheme = async (scheme: IncentivePlan, status: string = 'DRAFT'): Promise<string> => {
  try {
    console.log("Attempting to save scheme:", scheme.name);
    
    // Check server health first
    const isServerHealthy = await checkServerHealth();
    if (!isServerHealthy) {
      throw new Error('MongoDB server is not available. Please ensure the server is running.');
    }
    
    // Generate a scheme ID if not provided
    const schemeId = scheme.schemeId || generateSchemeTimestampId();
    
    // Prepare the scheme with required fields
    const schemeToSave = {
      ...scheme,
      schemeId: schemeId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        status: status
      }
    };
    
    console.log("Saving scheme with ID:", schemeId);
    
    try {
      const response = await axios.post(API_BASE_URL, schemeToSave);
      
      if (response.status === 201 && response.data._id) {
        console.log(`Saved scheme document with ID: ${response.data._id}`);
        return response.data._id;
      } else {
        throw new Error('Failed to save scheme: No ID returned from server');
      }
    } catch (axiosError: any) {
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server error response:", axiosError.response.data);
        throw new Error(`Server error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error("No response received:", axiosError.request);
        throw new Error('No response from server. Please check if the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", axiosError.message);
        throw axiosError;
      }
    }
  } catch (error) {
    console.error("Error saving incentive scheme:", error);
    throw new Error(`Failed to save scheme: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get all incentive schemes from MongoDB
 */
export const getIncentiveSchemes = async (): Promise<any[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching incentive schemes:", error);
    return [];
  }
};

/**
 * Get a specific incentive scheme by ID
 */
export const getIncentiveSchemeById = async (id: string): Promise<any | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching incentive scheme with ID ${id}:`, error);
    return null;
  }
};

/**
 * Delete an incentive scheme by ID
 */
export const deleteIncentiveScheme = async (id: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.status === 200;
  } catch (error) {
    console.error(`Error deleting incentive scheme with ID ${id}:`, error);
    return false;
  }
};

/**
 * Update an incentive scheme
 */
export const updateIncentiveScheme = async (id: string, updates: Partial<IncentivePlan>, status?: string): Promise<boolean> => {
  try {
    // If status is provided, update it in metadata
    let updatedData: any = { ...updates };
    
    if (status) {
      updatedData.metadata = {
        ...(updates.metadata || {}),
        updatedAt: new Date().toISOString(),
        status: status
      };
    }
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedData);
    return response.status === 200;
  } catch (error) {
    console.error(`Error updating incentive scheme with ID ${id}:`, error);
    return false;
  }
};

/**
 * Update an incentive scheme status
 */
export const updateSchemeStatus = async (id: string, status: string): Promise<boolean> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
    return response.status === 200;
  } catch (error) {
    console.error(`Error updating scheme status with ID ${id}:`, error);
    return false;
  }
};
