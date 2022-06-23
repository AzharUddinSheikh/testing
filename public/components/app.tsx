import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  formatDate, 
  EuiBasicTable, 
  EuiLink, 
  EuiHealth,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';
import { DataPublicPluginStart } from 'src/plugins/data/public';

interface MyPluginAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export const MyPluginApp = ({ basename, notifications, http, navigation, data }: MyPluginAppDeps) => {
  // Use React hooks to manage state.
  const [hits, setHits] = useState<Array<Record<string, any>>>();

  const onSearchHandler = async () => {
    
    // Use the core http service to make a response to the server API.
    const searchSource = await data.search.searchSource.create();
    const [indexPattern] = await data.indexPatterns.find('kibana_sample_data_ecommerce');
    const filters = data.query.filterManager.getFilters();
    const timefilter = data.query.timefilter.timefilter.createFilter(indexPattern);
    
    if (timefilter) {
      filters.push(timefilter);
    }
    try {
      const searchResponse = await searchSource
        .setField('index', indexPattern)
        .setField('filter', filters)
        .fetch();
      
      setHits(searchResponse.hits.hits);
      // if (hits) {
      //   for (let i = 0; i < hits.length; i++) {
      //     const {_source} = hits[i];
      //   }
      // }

      notifications.toasts.addSuccess(
          i18n.translate('myPlugin.dataUpdated', {
            defaultMessage: 'Data Updated',
          })
      );
    } catch (e) {
        notifications.toasts.addDanger(
          i18n.translate('myPlugin.dataUpdated', {
            defaultMessage: 'First, Add Data In Index',
          })
        );
    }
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          />
          <EuiPage restrictWidth="1000px">
            <EuiPageBody>
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="myPlugin.helloWorldText"
                      defaultMessage="{name}"
                      values={{ name: PLUGIN_NAME }}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentHeader>
                  <EuiTitle>
                    <h2>
                      <FormattedMessage
                        id="myPlugin.congratulationsTitle"
                        defaultMessage="Congratulations, you have successfully created a new Kibana Plugin!"
                      />
                    </h2>
                  </EuiTitle>
                </EuiPageContentHeader>
                <EuiPageContentBody>
                  <EuiText>
                    <p>
                      <FormattedMessage
                        id="myPlugin.content"
                        defaultMessage="Look through the generated code and check out the plugin development documentation."
                      />
                    </p>
                    <EuiHorizontalRule />
                    <EuiButton type="primary" size="s" onClick={onSearchHandler}>
                        <FormattedMessage id="myPlugin.buttonText" defaultMessage="Search data" />
                    </EuiButton>
                    {hits && <pre>{JSON.stringify(hits, null, 2)}</pre>}
                  </EuiText>
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
