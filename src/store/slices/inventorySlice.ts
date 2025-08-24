import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../../services/inventoryService';
import { Product } from '../../types';

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  products: [],
  isLoading: false,
  error: null,
};

export const fetchUserInventories = createAsyncThunk(
  'inventory/fetchUserInventories',
  async (userId: number, { rejectWithValue }) => {
    console.log('fetchUserInventories thunk called with userId:', userId);
    try {
      const response = await inventoryService.getUserInventories(userId);
      console.log('fetchUserInventories response:', response);
      return response;
    } catch (error: any) {
      console.error('fetchUserInventories error:', error);
      return rejectWithValue(error.message || 'Failed to fetch inventories');
    }
  }
);

export const addToInventory = createAsyncThunk(
  'inventory/addToInventory',
  async ({ userId, productId }: { userId: number; productId: number }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.addToInventory(userId, productId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to inventory');
    }
  }
);

export const removeFromInventory = createAsyncThunk(
  'inventory/removeFromInventory',
  async ({ userId, productId }: { userId: number; productId: number }, { rejectWithValue }) => {
    try {
      await inventoryService.removeFromInventory(userId, productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from inventory');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/updateInventory',
  async ({ userId, productId, stock }: { userId: number; productId: number; stock: number }, { rejectWithValue }) => {
    try {
      await inventoryService.updateInventory(userId, productId, stock);
      return { productId, stock };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update inventory');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventory: (state) => {
      console.log('Clearing inventory state');
      state.products = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventories
      .addCase(fetchUserInventories.pending, (state) => {
        console.log('fetchUserInventories.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserInventories.fulfilled, (state, action) => {
        console.log('fetchUserInventories.fulfilled with data:', action.payload);
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchUserInventories.rejected, (state, action) => {
        console.log('fetchUserInventories.rejected with error:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to Inventory
      .addCase(addToInventory.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      // Remove from Inventory
      .addCase(removeFromInventory.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id !== action.payload);
      })
      // Update Inventory
      .addCase(updateInventory.fulfilled, (state, action) => {
        const { productId, stock } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.stock = stock;
        }
      });
  },
});

export const { clearInventory } = inventorySlice.actions;
export default inventorySlice.reducer; 