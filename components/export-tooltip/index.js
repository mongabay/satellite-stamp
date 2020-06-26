import { connect } from 'react-redux';

import { toolActions, exportSelectors, exportActions, mapSelectors } from 'modules/tool';
import Component from './component';

export default connect(
  state => ({
    width: exportSelectors.selectWidth(state),
    height: exportSelectors.selectHeight(state),
    mode: exportSelectors.selectMode(state),
    modeParams: exportSelectors.selectModeParams(state),
    temporalDiffLayers: mapSelectors.selectExportTemporalDiffLayers(state),
    exporting: exportSelectors.selectExporting(state),
    idle: mapSelectors.selectIdle(state),
  }),
  {
    updateSettings: exportActions.updateSettings,
    updateExporting: exportActions.updateExporting,
    updateMode: toolActions.updateMode,
    updateDifference: toolActions.updateMapDifference,
    updateModeParams: exportActions.updateModeParams,
  }
)(Component);
