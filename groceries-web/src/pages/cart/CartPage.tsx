import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Cart, CartItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart.store';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart, updateCartCount } = useCartStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await apiService.post<Cart>(API_CONSTANTS.CART.GET, {});
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await apiService.post(API_CONSTANTS.CART.UPDATE, {
        itemId,
        quantity,
      });
      await fetchCart();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update cart',
        variant: 'destructive',
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await apiService.post(API_CONSTANTS.CART.REMOVE, { itemId });
      await fetchCart();
      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item',
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-mobile py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-mobile py-4 space-y-4">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <Card key={item._id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={item.product.images[0]?.url || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Total:</span>
            <span className="font-bold">₹{cart.totalAmount}</span>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate('/checkout')}
            size="lg"
          >
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

