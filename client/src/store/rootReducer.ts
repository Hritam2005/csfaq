import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
// Future placeholders for full implementation
// import notificationReducer from './slices/notificationSlice';
// import chatReducer from './slices/chatSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
});
