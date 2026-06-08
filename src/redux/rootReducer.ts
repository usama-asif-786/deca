import { combineReducers } from 'redux';
import { themeReducer } from './theme/reducer';

export const rootReducer = combineReducers({
  theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
