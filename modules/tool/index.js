import { createSelector, createAsyncThunk } from '@reduxjs/toolkit';

import { deserialize, serialize } from 'utils/functions';
import { selectQuery } from '../routing';
import createMapSlice, * as mapModule from './map';

// Common actions for the tool module
const actions = {
  restoreState: createAsyncThunk('tool/restoreState', (_, { getState }) => {
    const state = getState();
    const query = selectQuery(state);
    return deserialize(query.state);
  }),
};

// Slices belonging to the tool module
const mapSlice = createMapSlice(actions);

// Common selectors for the tool module
const selectors = {
  selectSerializedState: createSelector([mapModule.selectSerializedState], mapState =>
    serialize({
      [mapModule.SLICE_NAME]: mapState,
    })
  ),
};

export const toolActions = actions;
export const toolSelectors = selectors;
export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
export const mapSelectors = mapModule;
