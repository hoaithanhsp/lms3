import { mockProvider } from './mockProvider';
import { sheetProvider } from './sheetProvider';
import { DataProvider } from './dataProvider';

const useSheet = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.length > 0;

console.log(`Using ${useSheet ? 'Google Sheet' : 'Mock'} Provider`);

const dataProvider: DataProvider = useSheet ? sheetProvider : mockProvider;

export default dataProvider;