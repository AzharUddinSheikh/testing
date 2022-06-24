import React, { useState, createContext, useContext, useCallback } from 'react';
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
  EuiDataGrid,
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

interface ColumnsInterface {
    id: any,
    displayAsText?: string,
    defaultSortDirection?: 'asc' | 'desc' | undefined,
    isSortable?: false
}

const DataContext = createContext<any>(undefined);

export const MyPluginApp = ({ basename, notifications, http, navigation, data }: MyPluginAppDeps) => {
  // Use React hooks to manage state.
  const [hits, setHits] = useState<Array<Record<string, any>>>();
  const [dataHit, setDataHit] = useState<string | any[]>([]);
  const raw_data: string | any[] = [];
  
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
      
      const dataHit = searchResponse.hits.hits;
      if (dataHit) {
        for (let i = 0; i < dataHit.length; i++) {
          const {_source} = dataHit[i];
          raw_data.push({
              firstName: _source.customer_first_name,
              lastName: _source.customer_last_name,
              email: _source.email,
              date: _source.order_date,
              amount : _source.taxless_total_price,
              location: _source.geoip.city_name,
              products : [...(_source.products).map( (p : any) => p.product_name)],
          })
        }
      }

      setHits(dataHit);
      setDataHit(raw_data);
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

  const RenderCellValue = ({ rowIndex, columnId } : any) => {
    const data = useContext(DataContext);
    return data[rowIndex][columnId] ? data[rowIndex][columnId] : null;
  }

  const columns : ColumnsInterface[] = [
    {
      id: 'firstName',
      displayAsText: 'First Name',
      defaultSortDirection: 'asc',
    },
    {
      id: 'lastName',
      displayAsText: 'Last Name',
      isSortable: false,
    },
    {
      id: 'email',
      displayAsText: 'Email Address',
      isSortable: false,
    },
    {
      id: 'date',
      displayAsText: 'Order Date',
      isSortable: false,
    },
    {
      id: 'amount',
      displayAsText: 'Total Amount',
      isSortable: false,
    },
    {
      id: 'location',
      displayAsText: 'Location',
      isSortable: false,
    },
    {
      id: 'products',
      displayAsText: 'Product Items',
      isSortable: false,
    }
  ];

  // sorting
  const [sortingColumns, setSortingColumns] = useState([]);
  const onSort = useCallback(
    (sortingColumns) => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  const [visibleColumns, setVisibleColumns] = useState(
    columns.map(({ id }) => id) 
  );

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
                    <EuiButton style={{marginBottom:'15px'}} type="primary" size="s" onClick={onSearchHandler}>
                        <FormattedMessage id="myPlugin.buttonText" defaultMessage="Search data" />
                    </EuiButton>
                    { hits && 
                    <DataContext.Provider value={dataHit}>
                      <EuiDataGrid
                        aria-label="Data Table"
                        columns={columns}
                        columnVisibility={{ visibleColumns, setVisibleColumns }}
                        rowCount={dataHit.length}
                        sorting={{ columns: sortingColumns, onSort }}
                        inMemory={{ level: 'sorting' }}
                        renderCellValue={RenderCellValue}
                      />
                    </DataContext.Provider>}
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
