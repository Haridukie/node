import React, {useState} from 'react';
import LineChart from './LineChart';
import DataTable from './Data';
import './Group.css'


const Group = () => {
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const handleDataFetched = (data: any[]) => {
    // Updating fetchedData state with the fetched data
    console.log(data)
    if (data.length === 1 || data.length === 2) {
      setFetchedData((prevFetchedData) => {
        // Remove the first item and add the new data at the end
        const updatedData = [...prevFetchedData.slice(1), data[0]];
        //console.log(updatedData); // Log the updated data before setting the state
        return updatedData;
      });
    } else  if (data.length > 3) {
      // If data length is not one, just set it as is
      setFetchedData(data);
    }
  };

  // console.log('fetcheddata',fetchedData)
  
  
  return (
    <div className='group-container'>
        <LineChart onDataFetched={handleDataFetched} /> 
        <DataTable  tableData={fetchedData}/> 
    </div>
  );
};

export default Group;

