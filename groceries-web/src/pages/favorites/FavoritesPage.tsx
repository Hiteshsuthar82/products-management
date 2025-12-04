import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{ favorites: Product[] }>(
        API_CONSTANTS.FAVORITES.LIST
      );
      setProducts(response.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await apiService.post(API_CONSTANTS.FAVORITES.REMOVE, { productId });
      toast({
        title: 'Success',
        description: 'Removed from favorites',
      });
      fetchFavorites();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove favorite',
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

  if (products.length === 0) {
    return (
      <div className="container-mobile py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No favorites yet</p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-mobile py-4 space-y-4">
      <h1 className="text-2xl font-bold">My Favorites</h1>
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFavorite(product._id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background"
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">₹{product.price}</span>
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
    </div>
  );
}

