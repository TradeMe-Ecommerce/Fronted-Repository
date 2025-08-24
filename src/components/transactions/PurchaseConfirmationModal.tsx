import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Divider,
} from '@mui/material';

interface PurchaseConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string, amount: number) => void;
  sellerName: string;
  productId: number;
  maxStock: number;
  price: number;
}

const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  sellerName,
  productId,
  maxStock,
  price,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [amount, setAmount] = useState(1);

  const handleConfirm = () => {
    onConfirm(paymentMethod, amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Purchase</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Purchase Summary
          </Typography>
          <Typography variant="body1" gutterBottom>
            Seller: {sellerName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Product ID: {productId}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Price per unit: ${price.toFixed(2)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Available Stock: {maxStock} units
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
              <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(Math.min(parseInt(e.target.value) || 1, maxStock))}
            inputProps={{ min: 1, max: maxStock }}
            helperText={`Maximum available: ${maxStock} units`}
          />

          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ${(price * amount).toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseConfirmationModal; 