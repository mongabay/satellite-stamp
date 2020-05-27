import { configureStore, combineReducers } from '@reduxjs/toolkit';

import routingReducer from 'modules/routing';
import { mapReducer, exportReducer } from 'modules/tool';

export default preloadedState =>
  configureStore({
    preloadedState,
    reducer: combineReducers({
      routing: routingReducer,
      map: mapReducer,
      export: exportReducer,
    }),
  });
