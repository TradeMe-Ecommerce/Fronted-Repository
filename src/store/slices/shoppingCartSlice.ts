import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shoppingCartService } from '../../services/shoppingCartService';
import { Product } from '../../types';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface ShoppingCartState {
  items: CartItem[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ShoppingCartState = {
  items: [],
  products: [],
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  'shoppingCart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await shoppingCartService.getCart();
      return {
        items: response.items || [],
        products: response.products || []
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'shoppingCart/addToCart',
  async ({ productId, quantity = 1 }: { productId: number; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await shoppingCartService.addToCart(productId, quantity);
      return { productId, quantity, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'shoppingCart/removeFromCart',
  async (productId: number, { rejectWithValue }) => {
    try {
      await shoppingCartService.removeFromCart(productId);
      return productId;
    } catch (error: any) {
      console.error('Error in removeFromCart thunk:', error);
      return rejectWithValue(error.message || 'Failed to remove from cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'shoppingCart/updateCartItem',
  async ({ productId, quantity }: { productId: number; quantity: number }, { rejectWithValue }) => {
    try {
      await shoppingCartService.updateCartItem(productId, quantity);
      return { productId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update cart item');
    }
  }
);

const shoppingCartSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.products = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.products = action.payload.products;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.items = [];
        state.products = [];
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.items) {
          state.items = [];
        }
        const existingItem = state.items.find(item => item.productId === action.payload.productId);
        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
        } else {
          state.items.push({
            id: Date.now(),
            productId: action.payload.productId,
            quantity: action.payload.quantity
          });
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.productId !== action.payload);
        state.products = state.products.filter(product => product.id !== action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const item = state.items.find(item => item.productId === action.payload.productId);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer; 