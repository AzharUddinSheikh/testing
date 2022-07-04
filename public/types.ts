import { DataPublicPluginStart } from 'src/plugins/data/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface MyPluginPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MyPluginPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
}

export interface ColumnsInterface {
    id: any,
    displayAsText?: string,
    defaultSortDirection?: 'asc' | 'desc' | undefined,
    isSortable?: false
}
