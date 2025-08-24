import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { userService } from '../services/userService';
import { transactionService } from '../services/transactionService';
import { productService } from '../services/productService';
import { getUserId } from '../utils/auth';
import { Card, CardContent, CardActions, Typography, Button, Container, Grid, Alert, CircularProgress } from '@mui/material';
import PurchaseConfirmationModal from '../components/transactions/PurchaseConfirmationModal';
import SuccessAnimation from '../components/transactions/SuccessAnimation';

interface Inventory {
  id: number;
  productId: number;
  stock: number;
  userId: number;
}

interface Seller {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const ProductInventories: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [sellers, setSellers] = useState<{ [key: number]: Seller }>({});
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!productId) return;
        setLoading(true);
        
        // Fetch product information
        const productData = await productService.getProductById(parseInt(productId));
        setProduct(productData);
        
        // Fetch inventories
        const inventoriesData = await inventoryService.getProductInventories(parseInt(productId));
        setInventories(inventoriesData);

        // Fetch seller information for each inventory
        const sellerPromises = inventoriesData.map(async (inventory: Inventory) => {
          try {
            const sellerData = await userService.getUserProfile(inventory.userId);
            return { [inventory.userId]: sellerData };
          } catch (error) {
            console.error(`Error fetching seller ${inventory.userId}:`, error);
            return null;
          }
        });

        const sellerResults = await Promise.all(sellerPromises);
        const sellersMap = sellerResults.reduce((acc, curr) => {
          if (curr) {
            return { ...acc, ...curr };
          }
          return acc;
        }, {});
        
        setSellers(sellersMap);
      } catch (err) {
        setError('Error loading data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleBuy = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async (paymentMethod: string, amount: number) => {
    try {
      if (!selectedInventory || !product) {
        throw new Error('No inventory or product selected');
      }

      const currentUserId = getUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      console.log('Current user ID:', currentUserId);
      console.log('Selected inventory:', selectedInventory);
      console.log('Product:', product);

      const transactionData = {
        userId: selectedInventory.userId,
        status: 'PENDING' as const,
        price: product.price,
        paymentMethod: paymentMethod as 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH',
        amount: amount,
        productId: selectedInventory.productId
      };
      
      console.log('Sending transaction data:', transactionData);
      console.log('Inventory ID:', selectedInventory.id);
      
      const response = await transactionService.createTransaction(selectedInventory.id, transactionData);
      console.log('Transaction created:', response);
      setIsModalOpen(false);
      setShowSuccess(true);
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Error processing transaction. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInventory(null);
  };

  const handleChat = (sellerId: number) => {
    navigate(`/chat/${sellerId}`);
  };

  if (loading) {
    return (
      <Container className="py-8 flex justify-center">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return <Alert severity="error" className="m-4">{error}</Alert>;
  }

  return (
    <Container className="py-8">
      {showSuccess && (
        <SuccessAnimation
          message="Purchase completed successfully!"
          redirectDelay={2000}
          redirectTo="/"
        />
      )}
      
      <div className="mb-8">
        <Typography variant="h4" className="mb-2">
          {product?.name || 'Product'} - Available Sellers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse through different sellers offering this product. Each seller may have different prices and stock availability.
          Choose a seller to start a conversation or make a purchase.
        </Typography>
      </div>

      <Grid container spacing={3}>
        {inventories.map((inventory) => {
          const seller = sellers[inventory.userId];
          return (
            <Grid item xs={12} sm={6} md={4} key={inventory.id}>
              <Card className="h-full">
                <CardContent>
                  <Typography variant="h6" component="div" className="mb-2">
                    {seller?.name || 'Unknown Seller'}
                  </Typography>
                  <Typography color="text.secondary" className="mb-2">
                    {seller?.email}
                  </Typography>
                  <Typography variant="body2" className="mb-2">
                    Available Stock: {inventory.stock} units
                  </Typography>
                  {product && (
                    <Typography variant="body2" className="mb-2">
                      Price: ${product.price.toFixed(2)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions className="justify-between px-4 pb-4">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBuy(inventory)}
                  >
                    Buy
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleChat(inventory.userId)}
                  >
                    Chat
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {selectedInventory && product && (
        <PurchaseConfirmationModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPurchase}
          sellerName={sellers[selectedInventory.userId]?.name || 'Unknown Seller'}
          productId={selectedInventory.productId}
          maxStock={selectedInventory.stock}
          price={product.price}
        />
      )}
    </Container>
  );
};

export default ProductInventories; 