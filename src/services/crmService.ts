import { Lead } from '../types';

const API_URL = '/api/leads';

export async function fetchLiveLeads(): Promise<Lead[]> {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        throw new Error('Received HTML instead of JSON. The script might be requiring authentication or login.');
      }
    }
    
    const data = await response.json();
    
    // Mapping keys to match the expected Lead interface if they differ from the Sheet headers
    // Based on user: Date, Name, Phone No, Service, Budget, Status, Revenue
    if (Array.isArray(data)) {
       return data.map((item: any) => ({
         date: item.Date || item.date || '',
         name: item.Name || item.name || '',
         phone: item['Phone No'] || item.phone || '',
         service: item.Service || item.service || '',
         budget: item.Budget || item.budget || 0,
         status: item.Status || item.status || 'New',
         revenue: item.Revenue || item.revenue || 0
       }));
    }
    
    // Some Apps Script APIs wrap data in a 'data' key or similar
    if (data.data && Array.isArray(data.data)) {
        return data.data.map((item: any) => ({
            date: item.Date || item.date || '',
            name: item.Name || item.name || '',
            phone: item['Phone No'] || item.phone || '',
            service: item.Service || item.service || '',
            budget: item.Budget || item.budget || 0,
            status: item.Status || item.status || 'New',
            revenue: item.Revenue || item.revenue || 0
          }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching live leads:', error);
    return [];
  }
}
