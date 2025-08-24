import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../../services/favoriteService';

interface FavoriteState {
  favorites: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoriteState = {
  favorites: [],
  isLoading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await favoriteService.getUserFavorites();
      return response.productIds;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch favorites');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (productId: number, { rejectWithValue }) => {
    try {
      await favoriteService.addToFavorites(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (productId: number, { rejectWithValue }) => {
    try {
      await favoriteService.removeFromFavorites(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from favorites');
    }
  }
);

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to Favorites
      .addCase(addToFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.favorites.includes(action.payload)) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = state.favorites.filter(id => id !== action.payload);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;