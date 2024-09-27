import axios from 'axios';

export const parseRepository = async (repoUrl, branch) => {
  try {
    const response = await axios.post('/parse', { repoUrl, username, password });
    return response.data;
  } catch (error) {
    console.error('Error parsing repository:', error);
    throw error;
  }
};