import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Address, Cart } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/components/ui/use-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await apiService.post<{ addresses: Address[] }>(
        API_CONSTANTS.ADDRESS.LIST,
        {}
      );
      setAddresses(response.addresses || []);
      const defaultAddr = response.addresses?.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !cart) {
      toast({
        title: 'Error',
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const order = await apiService.post(API_CONSTANTS.ORDERS.CREATE, {
        paymentMethod,
        shippingAddress: selectedAddress,
      });

      clearCart();
      toast({
        title: 'Success',
        description: 'Order placed successfully',
      });
      navigate(`/orders/${order._id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate pricing
  const subtotal = cart.totalAmount;
  const shippingPrice = 0; // Free shipping
  const taxPrice = subtotal * 0.18; // 18% GST
  const totalPrice = subtotal + shippingPrice + taxPrice;

  return (
    <div className="container-mobile py-4 space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* Address Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedAddress?._id === address._id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedAddress(address)}
            >
              <div className="font-medium">{address.name}</div>
              <div className="text-sm text-muted-foreground">
                {address.address}, {address.city}, {address.state} - {address.postalCode}
              </div>
              <div className="text-sm text-muted-foreground">{address.phone}</div>
            </div>
          ))}
          <Button variant="outline" onClick={() => navigate('/addresses')}>
            Add New Address
          </Button>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div
            className={`p-4 border rounded-lg cursor-pointer ${
              paymentMethod === 'cash' ? 'border-primary' : ''
            }`}
            onClick={() => setPaymentMethod('cash')}
          >
            Cash on Delivery
          </div>
          <div
            className={`p-4 border rounded-lg cursor-pointer ${
              paymentMethod === 'online' ? 'border-primary' : ''
            }`}
            onClick={() => setPaymentMethod('online')}
          >
            Online Payment
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          {taxPrice > 0 && (
            <div className="flex justify-between">
              <span>Tax (GST 18%)</span>
              <span>₹{taxPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <Button
            className="w-full mt-4"
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddress}
            size="lg"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

