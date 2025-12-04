import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { API_CONSTANTS } from '@/constants/api.constants';
import { Address } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { FullPageLoader } from '@/components/common/FullPageLoader';

export default function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiService.post<{ addresses: Address[] }>(
        API_CONSTANTS.ADDRESS.LIST,
        {}
      );
      setAddresses(response.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await apiService.post(API_CONSTANTS.ADDRESS.DELETE, { addressId });
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
      fetchAddresses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete address',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <FullPageLoader message="Loading addresses..." />;
  }

  return (
    <div className="container-mobile py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Button onClick={() => navigate('/addresses/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No addresses saved</p>
            <Button onClick={() => navigate('/addresses/new')}>Add Address</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {address.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded mb-2 inline-block">
                        Default
                      </span>
                    )}
                    <div className="font-medium">{address.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {address.address}, {address.city}, {address.state} - {address.postalCode}
                    </div>
                    <div className="text-sm text-muted-foreground">{address.phone}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/addresses/${address._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(address._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

