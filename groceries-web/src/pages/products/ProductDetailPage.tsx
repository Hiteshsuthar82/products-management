import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart.store';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const { updateCartCount } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiService.post<Product>(API_CONSTANTS.PRODUCTS.DETAIL, {
        productId: id,
        userId: user?.id,
      });
      setProduct(data);
      setIsFavorite(data.isFavorite || false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add favorites',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!product || isToggling) return;

    try {
      setIsToggling(true);
      const previousState = isFavorite;
      
      // Optimistic update
      setIsFavorite(!isFavorite);

      // Call API to toggle favorite
      const response = await apiService.post<{ isFavorite: boolean }>(
        API_CONSTANTS.FAVORITES.TOGGLE,
        { productId: product._id }
      );

      // Update state based on API response
      setIsFavorite(response.isFavorite);
      
      toast({
        title: response.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
        description: response.isFavorite
          ? 'Product added to your favorites'
          : 'Product removed from your favorites',
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setIsFavorite(previousState);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorite',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to cart',
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      await apiService.post(API_CONSTANTS.CART.ADD, {
        productId: product._id,
        quantity,
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

  if (!product) {
    return (
      <div className="container-mobile py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container-mobile py-4 space-y-6">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <img
            src={product.images[selectedImage]?.url || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img
                  src={img.url}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            {product.brand && (
              <p className="text-sm text-muted-foreground">Brand: {product.brand}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
                {discount > 0 && (
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm">
                    -{discount}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          {product.ratings && (
            <div className="flex items-center gap-2">
              <span className="text-sm">⭐ {product.ratings.average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({product.ratings.count} reviews)
              </span>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="text-sm">{product.description}</p>
          </div>

          {product.stock > 0 ? (
            <div className="text-sm text-green-600">In Stock ({product.stock} available)</div>
          ) : (
            <div className="text-sm text-destructive">Out of Stock</div>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2 border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isToggling}
                className={isFavorite ? 'bg-primary/10 border-primary' : ''}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`}
                />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

