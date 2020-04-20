import {
  ChoiceGroup,
  DefaultButton,
  Dialog,
  DialogType,
  IconButton,
  Label,
  Panel,
  PanelType,
  PrimaryButton
} from 'office-ui-fabric-react';
import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { loadGETheme } from '../../../themes';
import { AppTheme } from '../../../types/enums';
import { ISettingsProps, ISettingsState } from '../../../types/settings';
import * as authActionCreators from '../../services/actions/auth-action-creators';
import * as permissionsActionCreators from '../../services/actions/permissions-action-creator';
import * as themeActionCreators from '../../services/actions/theme-action-creator';
import { Permission } from '../query-runner/request/permissions';

class Settings extends Component<ISettingsProps, ISettingsState> {
  constructor(props: ISettingsProps) {
    super(props);
    this.state = {
      hideThemeChooserDialog: true,
      items: [],
      selectedPermissions: [],
      panelIsOpen: false
    };
  }

  public componentDidMount = () => {
    const {
      intl: { messages }
    }: any = this.props;

    const items: any = [
      {
        key: 'office-dev-program',
        text: messages['Office Dev Program'],
        href: 'https://developer.microsoft.com/en-us/office/dev-program',
        target: '_blank',
        iconProps: {
          iconName: 'CommandPrompt',
        },
      },
      {
        key: 'change-theme',
        text: messages['Change theme'],
        iconProps: {
          iconName: 'Color',
        },
        onClick: () => this.toggleThemeChooserDialogState(),
      }
    ];

    this.setState({ items });
  }

  public toggleThemeChooserDialogState = () => {
    this.setState({ hideThemeChooserDialog: !this.state.hideThemeChooserDialog });
  }

  public handleSignOut = () => {
    this.props.actions!.signOut();
  }

  public handleChangeTheme = (selectedTheme: any) => {
    const newTheme: AppTheme = selectedTheme.key;
    this.props.actions!.changeTheme(newTheme);
    loadGETheme(newTheme);
  }

  public togglePermissionsPanel = () => {
    this.setState({ panelIsOpen: !this.state.panelIsOpen, selectedPermissions: []});
  }

  public setPermissions = (permissions: []) => {
    this.setState({ selectedPermissions: permissions });
  }

  public handleConsent = () => {
    this.props.actions!.consentToScopes(this.state.selectedPermissions);
  }

  private getSelectionDetails(): string {
    const { selectedPermissions } = this.state;
    const selectionCount = selectedPermissions.length;

    switch (selectionCount) {
      case 0:
        return '';
      case 1:
        return '1 selected: ' + selectedPermissions[0];
      default:
        return `${selectionCount} selected`;
    }
  }

  private onRenderFooterContent = () => {
    const { selectedPermissions } = this.state;
    return (
      <div>
        <Label>{this.getSelectionDetails()}</Label>
        <PrimaryButton disabled={selectedPermissions.length === 0} onClick={() => this.handleConsent()}>
          <FormattedMessage id='Consent' />
        </PrimaryButton>
        <DefaultButton onClick={() => this.togglePermissionsPanel()}>
          <FormattedMessage id='Cancel' />
        </DefaultButton>
      </div>
    );
  }

  public render() {

    const {
      intl: { messages },
      appTheme,
      authenticated,
    }: any = this.props;

    const { hideThemeChooserDialog, items, panelIsOpen } = this.state;
    const menuOptions: any = [...items];

    if (authenticated) {
      menuOptions.push(
        {
          key: 'change-theme',
          text: messages['view all permissions'],
          iconProps: {
            iconName: 'AzureKeyVault',
          },
          onClick: () => this.togglePermissionsPanel(),
        },
        {
          key: 'sign-out',
          text: messages['sign out'],
          iconProps: {
            iconName: 'SignOut',
          },
          onClick: () => this.handleSignOut(),
        }
      );
    }

    const menuProperties = {
      shouldFocusOnMount: true,
      alignTargetEdge: true,
      items: menuOptions
    };

    return (
      <div>
        <IconButton
          ariaLabel='More actions'
          role='button'
          styles={{
            label: { marginBottom: -20 },
            icon: { marginBottom: -20 }
          }}
          menuIconProps={{ iconName: 'Settings' }}
          title='More actions'
          menuProps={menuProperties} />
        <div>
          <Dialog
            hidden={hideThemeChooserDialog}
            onDismiss={() => this.toggleThemeChooserDialogState()}
            dialogContentProps={{
              type: DialogType.normal,
              title: messages['Change theme'],
              isMultiline: false,
            }}
          >

            <ChoiceGroup
              label='Pick one theme'
              defaultSelectedKey={appTheme}
              options={[
                {
                  key: AppTheme.Light,
                  iconProps: { iconName: 'Light' },
                  text: messages.Light
                },
                {
                  key: AppTheme.Dark,
                  iconProps: { iconName: 'CircleFill' },
                  text: messages.Dark
                },
                {
                  key: AppTheme.HighContrast,
                  iconProps: { iconName: 'Contrast' },
                  text: messages['High Contrast'],
                }
              ]}
              onChange={(event, selectedTheme) => this.handleChangeTheme(selectedTheme)}
            />
          </Dialog>

          <Panel
            isOpen={panelIsOpen}
            onDismiss={() => this.togglePermissionsPanel}
            type={PanelType.medium}
            closeButtonAriaLabel='Close'
            headerText={messages.Permissions}
            onRenderFooterContent={this.onRenderFooterContent}
            isFooterAtBottom={true}
          >
            <Permission panel={true} setPermissions={this.setPermissions} />
          </Panel>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch): object {
  return {
    actions: bindActionCreators({
      ...themeActionCreators,
      ...authActionCreators,
      ...permissionsActionCreators,
    }, dispatch)
  };
}

function mapStateToProps(state: any) {
  return {
    authenticated: !!state.authToken,
    appTheme: state.theme,
  };
}

// @ts-ignore
const IntlSettings = injectIntl(Settings);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IntlSettings);
