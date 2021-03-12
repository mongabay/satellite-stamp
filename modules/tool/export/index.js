import { createSlice, createSelector } from '@reduxjs/toolkit';
import omit from 'lodash/omit';

export const SLICE_NAME = 'export';

export const selectSettings = state => state[SLICE_NAME];
export const selectWidth = createSelector([selectSettings], settings => settings.width);
export const selectHeight = createSelector([selectSettings], settings => settings.height);
export const selectExporting = createSelector([selectSettings], settings => settings.exporting);
export const selectMode = createSelector([selectSettings], settings => settings.mode);
export const selectModeParams = createSelector([selectSettings], settings => settings.modeParams);

export const selectSerializedState = createSelector([selectSettings], settings => {
  return omit(settings, 'exporting', 'width', 'height');
});

export default toolActions =>
  createSlice({
    name: SLICE_NAME,
    initialState: {
      exporting: false,
      mode: '1',
      modeParams: {
        /**
         * The difference between the multiple maps
         * @type {string}
         */
        difference: '',
        /**
         * IDs of the layers used for a temporal difference
         * @type {string[]}
         */
        layers: [],
        /**
         * The configuration of each map and for eaech of the layers from top left corner to bottom
         * right
         * @type {Array<Array<string>>}
         */
        dates: [['']],
      },
      width: 900,
      height: 600,
    },
    reducers: {
      updateSettings(state, action) {
        for (const [key, value] of Object.entries(action.payload)) {
          state[key] = value;
        }
      },
      updateExporting(state, action) {
        state.exporting = action.payload;
      },
      updateModeParams(state, action) {
        state.modeParams = action.payload;
      },
    },
    extraReducers: {
      [toolActions.restoreState.fulfilled]: (state, action) => {
        const stateToRestore = action.payload[SLICE_NAME] || {};

        return {
          ...state,
          ...stateToRestore,
        };
      },
      [toolActions.updateMode.toString()]: (state, action) => {
        state.mode = action.payload;

        switch (action.payload) {
          case '1':
            state.modeParams.difference = '';
            state.modeParams.layers = [];
            state.modeParams.dates = [['']];
            return;

          case '2-vertical':
          case '2-horizontal':
            state.modeParams.difference = 'spatial';
            state.modeParams.layers = [];
            state.modeParams.dates = [['', '']];
            return;

          case '4':
            state.modeParams.difference = 'spatial';
            state.modeParams.layers = [];
            state.modeParams.dates = [['', '', '', '']];
            return;

          default:
        }
      },
      [toolActions.updateMapDifference.toString()]: (state, action) => {
        state.modeParams.difference = action.payload;
        state.modeParams.layers = [];
        state.modeParams.dates = [state.modeParams.dates[0].map(() => '')];
      },
    },
  });
