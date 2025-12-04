import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Focus input when page loads or when navigating from bottom nav
  useEffect(() => {
    // Small delay to ensure the page is rendered
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Perform search on initial mount if there's a query in URL
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery && urlQuery.trim().length >= 2 && isInitialMount.current) {
      performSearch(urlQuery);
      isInitialMount.current = false;
    }
  }, []);

  // Debounced search effect - triggers when user types
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const searchQuery = query.trim();
    
    // Clear products if query is empty
    if (!searchQuery) {
      setProducts([]);
      setHasSearched(false);
      if (searchParams.get('q')) {
        setSearchParams({}, { replace: true });
      }
      return;
    }

    // Only search if query has at least 2 characters
    if (searchQuery.length < 2) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
      // Update URL params
      setSearchParams({ q: searchQuery }, { replace: true });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    try {
      setLoading(true);
      setHasSearched(false); // Reset before search
      const response = await apiService.post<{ products: Product[] }>(
        API_CONSTANTS.PRODUCTS.SEARCH,
        {
          query: searchQuery,
          page: 1,
          limit: 20,
          userId: user?.id,
        }
      );
      setProducts(response.products || []);
      setHasSearched(true); // Mark that search has completed
    } catch (error: any) {
      console.error('Error searching products:', error);
      setProducts([]);
      setHasSearched(true); // Mark that search has completed (even if error)
      
      // Only show toast for actual errors, not validation errors
      if (error.status !== 400) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to search products',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-mobile py-4 space-y-4">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product._id} to={`/products/${product._id}`}>
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images[0]?.url || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">₹{Number(product.price).toFixed(2)}</span>
                  </div>
                  <Button size="sm" className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : hasSearched && query.trim().length >= 2 ? (
        <div className="text-center py-12 text-muted-foreground">
          No products found for "{query}"
        </div>
      ) : query.trim().length > 0 && query.trim().length < 2 ? (
        <div className="text-center py-12 text-muted-foreground">
          Please enter at least 2 characters to search
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Enter a search query to find products
        </div>
      )}
    </div>
  );
}
