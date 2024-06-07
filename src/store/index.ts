import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '~store/slices/counter.slice';
import userReducer from '~store/slices/user.slice';
import keywordReducer from '~store/slices/keyword.slice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    users: userReducer,
    keyword: keywordReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
