import { connect } from 'react-redux';

import {
  toolActions,
  toolSelectors,
  exportSelectors,
  exportActions,
  mapSelectors,
  mapActions,
} from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
    mode: exportSelectors.selectMode(state),
    modeParams: exportSelectors.selectModeParams(state),
    temporalDiffLayers: mapSelectors.selectExportTemporalDiffLayers(state),
    animatedLayerStartDate: toolSelectors.selectAnimatedLayerStartDates(state),
    animatedLayerEndDate: toolSelectors.selectAnimatedLayerEndDates(state),
    exporting: exportSelectors.selectExporting(state),
    idle: mapSelectors.selectIdle(state),
  }),
  {
    updateSettings: exportActions.updateSettings,
    updateExporting: exportActions.updateExporting,
    updateMode: toolActions.updateMode,
    updateDifference: toolActions.updateMapDifference,
    updateModeParams: exportActions.updateModeParams,
    updateLayer: mapActions.updateLayer,
    updateBasemapParams: mapActions.updateBasemapParams,
    updateProgress: exportActions.updateProgress,
  }
)(Component);
