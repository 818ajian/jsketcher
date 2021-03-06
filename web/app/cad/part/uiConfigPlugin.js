import CoreActions from '../actions/coreActions';
import OperationActions from '../actions/operationActions';
import HistoryActions from '../actions/historyActions';
import menuConfig from './menuConfig';
import ObjectExplorer from '../craft/ui/ObjectExplorer';
import React from 'react';
import OperationHistory from '../craft/ui/OperationHistory';
import Expressions from '../expressions/Expressions';

export function activate({services, streams}) {
  streams.ui.controlBars.left.value = ['menu.file', 'menu.craft', 'menu.boolean', 'menu.primitives', 'Donate', 'GitHub'];
  streams.ui.controlBars.right.value = [
    ['Info', {label: null}],
    ['RefreshSketches', {label: null}],
    ['ShowSketches', {label: 'sketches'}], ['DeselectAll', {label: null}], ['ToggleCameraMode', {label: null}]
  ];

  streams.ui.toolbars.headsUp.value = ['PLANE', 'EditFace', 'EXTRUDE', 'CUT', 'REVOLVE', '-', 'FILLET', '-', 'INTERSECTION', 'SUBTRACT', 'UNION'];
  streams.ui.toolbars.headsUpQuickActions.value = ['Save', 'StlExport'];
  
  services.action.registerActions(CoreActions);
  services.action.registerActions(OperationActions);
  services.action.registerActions(HistoryActions);

  services.menu.registerMenus(menuConfig);

  services.ui.registerFloatView('project', ObjectExplorer, 'Model', 'cubes');
  services.ui.registerFloatView('history', OperationHistory, 'Modifications', 'history');
  services.ui.registerFloatView('expressions', Expressions, 'Expressions', 'percent');
}