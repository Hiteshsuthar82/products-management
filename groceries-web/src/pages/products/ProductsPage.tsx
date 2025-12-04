import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart.store';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { updateCartCount } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [page, searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.post<{
        products: Product[];
        total: number;
        page: number;
        pages: number;
      }>(API_CONSTANTS.PRODUCTS.LIST, {
        page,
        limit: 20,
        search: searchParams.get('q') || undefined,
        category: searchParams.get('category') || undefined,
        userId: user?.id,
      });

      setProducts(response.products || []);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await apiService.post(API_CONSTANTS.CART.ADD, {
        productId: product._id,
        quantity: 1,
        price: product.price,
      });
      toast({
        title: 'Success',
        description: 'Product added to cart',
      });
      const cart = await apiService.post(API_CONSTANTS.CART.COUNT, {});
      updateCartCount(cart.count || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-mobile py-4">
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(search)}`;
              }
            }}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

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
                  <span className="text-lg font-bold">₹{product.price}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

