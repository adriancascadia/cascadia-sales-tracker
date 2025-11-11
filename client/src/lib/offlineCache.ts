/**
 * Offline Data Caching Service
 * Caches customers and products for offline access
 */

const CACHE_KEYS = {
  CUSTOMERS: 'offline_customers',
  PRODUCTS: 'offline_products',
  CACHE_TIMESTAMP: 'offline_cache_timestamp',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData<T> {
  data: T[];
  timestamp: number;
}

/**
 * Save customers to offline cache
 */
export async function cacheCustomers(customers: any[]): Promise<void> {
  try {
    const cacheData: CachedData<any> = {
      data: customers,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEYS.CUSTOMERS, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to cache customers:', error);
  }
}

/**
 * Get cached customers
 */
export async function getCachedCustomers(): Promise<any[] | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.CUSTOMERS);
    if (!cached) return null;

    const cacheData: CachedData<any> = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - cacheData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEYS.CUSTOMERS);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('Failed to get cached customers:', error);
    return null;
  }
}

/**
 * Save products to offline cache
 */
export async function cacheProducts(products: any[]): Promise<void> {
  try {
    const cacheData: CachedData<any> = {
      data: products,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to cache products:', error);
  }
}

/**
 * Get cached products
 */
export async function getCachedProducts(): Promise<any[] | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.PRODUCTS);
    if (!cached) return null;

    const cacheData: CachedData<any> = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - cacheData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEYS.PRODUCTS);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('Failed to get cached products:', error);
    return null;
  }
}

/**
 * Clear all offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  try {
    localStorage.removeItem(CACHE_KEYS.CUSTOMERS);
    localStorage.removeItem(CACHE_KEYS.PRODUCTS);
    localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
  } catch (error) {
    console.error('Failed to clear offline cache:', error);
  }
}

/**
 * Get cache status
 */
export async function getCacheStatus(): Promise<{
  customersCount: number;
  productsCount: number;
  lastUpdated: string | null;
}> {
  try {
    const customers = await getCachedCustomers();
    const products = await getCachedProducts();
    
    const customersCached = localStorage.getItem(CACHE_KEYS.CUSTOMERS);
    const lastUpdated = customersCached 
      ? new Date(JSON.parse(customersCached).timestamp).toLocaleString()
      : null;

    return {
      customersCount: customers?.length || 0,
      productsCount: products?.length || 0,
      lastUpdated,
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {
      customersCount: 0,
      productsCount: 0,
      lastUpdated: null,
    };
  }
}

/**
 * Hook to manage offline data caching
 */
export function useOfflineCache() {
  const cacheCustomersData = async (customers: any[]) => {
    await cacheCustomers(customers);
  };

  const cacheProductsData = async (products: any[]) => {
    await cacheProducts(products);
  };

  const getCachedCustomersData = async () => {
    return await getCachedCustomers();
  };

  const getCachedProductsData = async () => {
    return await getCachedProducts();
  };

  const clearCache = async () => {
    await clearOfflineCache();
  };

  const getStatus = async () => {
    return await getCacheStatus();
  };

  return {
    cacheCustomersData,
    cacheProductsData,
    getCachedCustomersData,
    getCachedProductsData,
    clearCache,
    getStatus,
  };
}
