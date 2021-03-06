/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { withProps, compose } = require('recompose');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const PropTypes = require('prop-types');

const { isDashboardEditing } = require('../selectors/dashboard');
const { isLoggedIn } = require('../selectors/security');
const { dashboardHasWidgets, getWidgetsDependenciesGroups } = require('../selectors/widgets');
const { showConnectionsSelector, dashboardResource, isDashboardLoading } = require('../selectors/dashboard');
const { dashboardSelector } = require('./widgetbuilder/commons');

const { createWidget, toggleConnection } = require('../actions/widgets');
const { triggerShowConnections, triggerSave } = require('../actions/dashboard');

const withDashboardExitButton = require('./widgetbuilder/enhancers/withDashboardExitButton');
const LoadingSpinner = require('../components/misc/LoadingSpinner');

const Builder =
    compose(
        connect(dashboardSelector, { toggleConnection, triggerShowConnections }),
        withProps(({ availableDependencies = [] }) => ({
            availableDependencies: availableDependencies.filter(d => d !== "map")
        })),
        withDashboardExitButton
    )(require('./widgetbuilder/WidgetTypeBuilder'));

const Toolbar = compose(
    connect(
        createSelector(
            showConnectionsSelector,
            isLoggedIn,
            dashboardResource,
            dashboardHasWidgets,
            getWidgetsDependenciesGroups,
            (showConnections, logged, resource, hasWidgets, groups = []) => ({
                showConnections,
                hasConnections: groups.length > 0,
                hasWidgets,
                canEdit: (resource ? resource.canEdit : true),
                canSave: logged && hasWidgets && (resource ? resource.canEdit : true)
            })
        ),
        {
            onShowConnections: triggerShowConnections,
            onToggleSave: triggerSave,
            onAddWidget: createWidget
        }
    ),
    withProps(({
        onAddWidget = () => { },
        onToggleSave = () => { },
        hasWidgets,
        canSave,
        canEdit,
        hasConnections,
        showConnections,
        onShowConnections = () => { }
    }) => ({
        buttons: [{
            glyph: 'plus',
            tooltipId: 'dashboard.editor.addACardToTheDashboard',
            bsStyle: 'primary',
            visible: canEdit,
            onClick: () => onAddWidget()
        }, {
            glyph: 'floppy-disk',
            tooltipId: 'dashboard.editor.save',
            bsStyle: 'primary',
            tooltipPosition: 'right',
            visible: !!canSave,
            onClick: () => onToggleSave(true)
        }, {
            glyph: showConnections ? 'bulb-on' : 'bulb-off',
            tooltipId: showConnections ? 'dashboard.editor.hideConnections' : 'dashboard.editor.showConnections',
            bsStyle: showConnections ? 'success' : 'primary',
            visible: !!hasWidgets && !!hasConnections,
            onClick: () => onShowConnections(!showConnections)
        }]
    }))
)(require('../components/misc/toolbar/Toolbar'));

const SaveDialog = require('./dashboard/SaveDialog');

const { setEditing, setEditorAvailable } = require('../actions/dashboard');


class DashboardEditorComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        editing: PropTypes.bool,
        loading: PropTypes.bool,
        limitDockHeight: PropTypes.bool,
        fluid: PropTypes.bool,
        zIndex: PropTypes.number,
        dockSize: PropTypes.number,
        position: PropTypes.string,
        onMount: PropTypes.func,
        onUnmount: PropTypes.func,
        setEditing: PropTypes.func,
        dimMode: PropTypes.string,
        src: PropTypes.string,
        style: PropTypes.object
    };
    static defaultProps = {
        id: "dashboard-editor",
        editing: false,
        dockSize: 500,
        loading: true,
        limitDockHeight: true,
        zIndex: 10000,
        fluid: false,
        dimMode: "none",
        position: "left",
        onMount: () => { },
        onUnmount: () => { },
        setEditing: () => { }
    };
    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }
    render() {
        return this.props.editing
            ? <div className="dashboard-editor de-builder"><Builder enabled={this.props.editing} onClose={() => this.props.setEditing(false)} catalog={this.props.catalog} /></div>
            : (<div className="ms-vertical-toolbar dashboard-editor de-toolbar" id={this.props.id}>
                <SaveDialog />
                <Toolbar transitionProps={false} btnGroupProps={{ vertical: true }} btnDefaultProps={{ tooltipPosition: 'right', className: 'square-button-md', bsStyle: 'primary' }} />
                {this.props.loading ? <LoadingSpinner style={{ position: 'fixed', bottom: 0}} /> : null}
            </div>);
    }
}

const Plugin = connect(
    createSelector(
        isDashboardEditing,
        isDashboardLoading,
        (editing, loading) => ({ editing, loading }),
    ), {
        setEditing,
        onMount: () => setEditorAvailable(true),
        onUnmount: () => setEditorAvailable(false)
    }
)(DashboardEditorComponent);
module.exports = {
    DashboardEditorPlugin: Plugin,
    reducers: {
        dashboard: require('../reducers/dashboard')
    },
    epics: require('../epics/dashboard')
};
