import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import download from '../assets/btn-dw.svg';
import toggle from '../assets/toggleexit.svg';
import * as XLSX from 'xlsx'; 
import './Data.css';
import axios from 'axios';
import {Chart, registerables} from 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
import exit from '../assets/closearrow.svg';
import dropdown from '../assets/Dpdw_blue.svg';

Chart.register(...registerables);



const DataTable = ({ tableData }: { tableData: any[] }) => {

  interface RowData {
    id: number;
    _value: string;
    _time: string;
    _point: string;
    outlier_point: string;
    status: string;
  }
  const [filteredData, setFilteredData] = useState<any[]>([]);

  //console.log(tableData)
  

  // Number of rows to display per page
  const rowsPerPage = 5;

  // State to keep track of the current page number
  const [currentPage, setCurrentPage] = useState(1);
  //console.log("tableData:", tableData);

  // Calculate the total number of pages based on the filtered data
  useEffect(() => {
    const newFilteredData = tableData.filter((row) => row.outlier_point > 0);
    setFilteredData(newFilteredData);
  }, [tableData]);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);


  // Calculate the current viewable page range
  const [viewablePageRange, setViewablePageRange] = useState([1, 2]);

  // Function to handle clicking on the "Previous" button
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Function to handle clicking on the "Next" button
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Update the viewable page range when the currentPage changes
useEffect(() => {
  if (currentPage === 1) {
    setViewablePageRange([1, 2]);
  } else if (currentPage === totalPages) {
    setViewablePageRange([totalPages - 1, totalPages]);
  } else {
    setViewablePageRange([currentPage, currentPage + 1]);
  }
}, [currentPage, totalPages]);


  // Function to handle clicking on the "Download XLS" button
  const handleDownloadXLS = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TableData');
    // Generate XLSX binary data
    const excelFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // Convert binary data to a Blob
    const dataBlob = new Blob([excelFile], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // Create a URL for the Blob
    const dataUrl = URL.createObjectURL(dataBlob);
    // Create a link element to initiate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'AnomalyPointSheet.xlsx';
    // Append the link element to the DOM
    document.body.appendChild(downloadLink);
    // Click the link to initiate the download
    downloadLink.click();
    // Clean up by removing the link element
    document.body.removeChild(downloadLink);
  };

  // State to keep track of the selected row data and whether the sidebar is open
  const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null);
  // State to store the user's feedback on whether it's an anomaly (yes or no)
  const [feedback, setFeedback] = useState('');
  // State to track the submission status
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(false);
  // const [processNames, setProcessNames] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  // const [timestamps, setTimestamps] = useState([]);
  const [processData, setProcessData] = useState<any[]>([]);
const [processNames, setProcessNames] = useState<string[]>([]);
const [timestamps, setTimestamps] = useState<string[]>([]);


  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowOptions(false);
  };

  const handleDropdownClick = () => {
    setShowOptions(!showOptions);
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Function to handle clicking on a table row
  const handleTableRowClick = (rowData: RowData) => {
    console.log(rowData)
    setSelectedRowData(rowData);
    setIsSidebarOpen(true);
  };

  // Function to handle closing the sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProcess(false); // Reset the selected process
    setSelectedOption("");
    setFeedback(""); // Clear the feedback
    setSubmissionStatus(""); 
  };
  // Function to handle changes in the feedback (yes or no)
  const handleFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(event.target.value);
  };

  // Function to handle saving the changes
  const handleSaveChanges = (timestamp:any) => {
    // You can handle saving the feedback here (e.g., send it to a server, update state, etc.)
    console.log('Feedback:', feedback);
  
    // Create an object to send to the server
      const dataToSend = {
        feedback,
        time: timestamp,
        // selected_interval: selectedInterval, // Include the selected interval
      };
      console.log(dataToSend)
  
    // Make an HTTP POST request to your server
    axios.post(`https://adapiserver.ddns.net/store-feedback/${feedback}/${timestamp}`, dataToSend)
      .then((response: { data: any; }) => {
        console.log('Feedback saved:', response.data);
        if (!showQuestionForm) {
          setSubmissionStatus(`Feedback submitted as ${feedback}!`);
          setShowQuestionForm(true);
        } else {
          // Logic to handle resubmission or any other actions
          setShowQuestionForm(false);
        }
      })
      .catch((error: any) => {
        console.error('Error saving feedback:', error);
      });
  };

  const handleResubmitClick = () => {
    setSelectedProcess(false); 
    setFeedback(""); 
    setSubmissionStatus("");
  };

  const handleSubmitClick = (selectedOption:string, feedback:string) => {
    console.log("Getting it");
  
    if (selectedOption && feedback) {
      const selectedProcessEntry = processData.find(
        (entry) => entry.processName === selectedOption
      );
  
      if (selectedProcessEntry) {
        const selectedTimestamp = selectedProcessEntry.timestamp;
        console.log("Selected Option:", selectedOption);
        console.log("Timestamp:", selectedTimestamp);
        console.log("Feedback:", feedback);
  
        const url = `http://localhost:8000/submit_feedback/${selectedTimestamp}/${feedback}/${selectedOption}`;
  
        fetch(url, {
          method: 'POST',
        })
          .then((response) => {
            if (response.ok) {
              setSubmissionStatus('Submitted the feedback successfully');
              setSelectedProcess(true);
            } else {
              console.error('Failed to submit feedback:', response.statusText);
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      } else {
        // Handle the case where the selectedOption doesn't match any entry in processData
        console.error('Invalid selected processName');
      }
    } else {
      // Handle the case where either selectedOption or feedback is missing
      console.error('Please select both processName and feedback');
    }
  };
  
  

  function calculateActualIndex(currentPage:number, indexInPage:number) {
    return (currentPage - 1) * rowsPerPage + indexInPage + 1;
  }

const data:any = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: [],
  }],
};

const updatePieChart = (rowData: any) => {
  if (rowData && rowData.top_5 && rowData.top_5.length >= 5) {
    const top5Data = rowData.top_5.slice(0, 5);
    const pieChartData = top5Data.map((item: any) => item.value);
    const labels = top5Data.map((item: any) => item.process_name);

    if (data.datasets && data.datasets[0]) {
      data.labels = labels;
      data.datasets[0].data = pieChartData;
      data.datasets[0].backgroundColor = ['#62B2FD', '#9F97F7', '#FFB44F', '#F99BAB', '#9BDFC4'];
    }
  }
};

const options = {
  plugins: {
    tooltip: {
      enabled: true,
      // backgroundColor: '#FAFAFA', 
      usePointStyle: true,
        family: 'Poppins',
        backgroundColor: 'white',
        titleColor: '#7A7A7A',
        bodyColor: '#242424',
        bodySpacing: 2,
        bodyAlign: 'center' as "center" | "left" | "right" | undefined,
        bodyFont: {
          family: 'Poppins',
          weight: 'bold',
          size: 20
       },
       titleFont: {
        family: 'Poppins',
        weight: 'bold',
        size: 14, 
    },
    callbacks: {
      label: function (context:any) {
        const point = context.dataset.data[context.dataIndex];
        const value = parseFloat(point);
        
        return `${value.toFixed(2)}%`;
      }
    },
    boxShadow: '0px 2.555555582046509px 5.111111164093018px'
    },
    legend: {
      display: false
    },
  }
}

updatePieChart(selectedRowData);

const updateProcessNames = (rowData: any) => {
  if (rowData && rowData.top_5 && rowData.top_5.length >= 5) {
    const top5Data = rowData.top_5.slice(0, 5);
    
    const newProcessData = top5Data.map((item: any) => ({
      processName: item.command,
      timestamp: item.time
    }));

    const processNamesArray = newProcessData.map((item: any) => item.processName);
    const timestampsArray = newProcessData.map((item: any) => item.timestamp);

    setProcessData(newProcessData);
    setProcessNames(processNamesArray);
    setTimestamps(timestampsArray);
  } else {
    setProcessData([]);
    setProcessNames([]);
    setTimestamps([]);
  }
};


useEffect(() => {
  updateProcessNames(selectedRowData);
}, [selectedRowData]);






  return (
    <div className='container2'>
      
      {/* ... */}
      {isSidebarOpen && selectedRowData && (
              <div className='sidebar-container'>
                {/* Backdrop for the sidebar */}
                <div className='sidebar-backdrop' onClick={handleCloseSidebar} />

                {/* Sidebar content */}
                  <div className='sidebar'>
                    {/* Display the details of the selected row here */}
                    <button className="exit" onClick={handleCloseSidebar}>
                      <img src={exit} alt="clock" style={{ cursor: 'pointer' , width: '100%', height: '100%'}} />
                    </button>
                    <div className='insights'>
                      <span className="title-container">
                        <p className='title'>ANOMALY INSIGHTS</p>
                        {/* <hr className="title-line" /> */}
                      </span>
                      {/* <h2>{selectedRowData._value}{' '}Point{' '}{filteredData.indexOf(selectedRowData) + 1}</h2> */}
                      <div style={{ display: 'flex', justifyContent: "center"}}>
                        <div className='piegraph'>
                          <Pie data={data} options={options}> </Pie>
                        </div>
                      </div>
                      <div className='pointvalue'>
                      <div className="text-container">
                        <p className="black-text">Detected Point</p>
                        <p className="grey-text">{selectedRowData._value} Point {filteredData.indexOf(selectedRowData) + 1}</p>
                      </div>
                      <div className="text-container">
                        <p className="black-text">Timestamp</p>
                        <p className="grey-text">{selectedRowData._time}</p>
                      </div>
                      <div className="text-container">
                        <p className="black-text">Status</p>
                        <p className="grey-text">{selectedRowData.status}</p>
                      </div>

                      <div>
                      <p className="fd-title">FEEDBACK LOOP</p>
                      
                      {!selectedProcess ? (
                        <div className="quickspot">
                          <div className="inner-spot">
                            <p className="topic-spot">Select process from the dropdown:</p>

                            <div className="pn-dropdown" ref={dropdownRef}>
                              <div className="pn-header" onClick={handleDropdownClick}>
                                <span className="pn-text">{selectedOption || "Select Process Name"}</span>
                                <img src={dropdown} alt="dropdown" style={{ cursor: 'pointer' }} />
                              </div>
                              {showOptions && (
                                <div className="pn-options">
                                  <ul className="pnop-list">
                                    {processNames.map((option, index) => (
                                      <li key={index} onClick={() => handleOptionSelect(option)}>
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            {selectedOption && (
                              <div>
                                <label>
                                  <input
                                    type="radio"
                                    value="Yes"
                                    checked={feedback === 'Yes'}
                                    onChange={handleFeedbackChange}
                                    disabled={!selectedOption}
                                  />
                                  True Positive
                                </label>
                                
                                <label>
                                  <input
                                    type="radio"
                                    value="No"
                                    checked={feedback === 'No'}
                                    onChange={handleFeedbackChange}
                                    disabled={!selectedOption}
                                  />
                                  False Positive
                                </label>
                                {/* Submit button is visible when process name is selected */}
                                <button disabled={!selectedOption || !feedback} className='submit-btn' onClick={() => handleSubmitClick(selectedOption, feedback)}>Submit</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : selectedProcess && feedback ? (
                        <div className='feedback-status'>
                          <div className='status-holder'>                          
                            <p className='feedback-message'>{submissionStatus}</p>
                            <button className='resubmit-link' onClick={handleResubmitClick} style={{ cursor: 'pointer' }}>
                              Re-submit ?
                            </button>
                          </div>
                        </div>
                      ) : null}

                      
                    </div>

                      </div>
                    </div>
                  </div>
              </div>
            )}

	    {/* Apply a gray background to the page content when the sidebar is open */}
      <div className={isSidebarOpen ? 'page-content-gray' : 'page-content'}>
        <div className="tabletop">
          <p className="activity" >Activity Log</p>
          {/* <button className="btn-download" onClick={handleDownloadXLS} disabled>
            Download XLS
            <img src={download} alt="Download"/>
          </button> */}
        </div>

        <div className="t-table">
          {/* Data table */}
          <div className="datatable" >
            <table>
              <thead>
                <tr className='table-head'>
                <th><span>S.No</span></th>
                <th><span>Detected Point</span></th>
                <th><span>Timestamp</span></th>
                <th><span>Status</span></th>
                </tr>
              </thead>
              <tbody>
              {filteredData
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .map((row, indexInPage) => (
                  <tr key={indexInPage} onClick={() => handleTableRowClick(row)}>
                    <td>{'#' + calculateActualIndex(currentPage, indexInPage)}</td>
                    <td>{parseFloat(row._value).toFixed(2)}%</td>
                    <td>{row._time}</td>
                    <td>Medium</td>
                    {/* <td className={`status-${row.status ? row.status.toLowerCase() : ''}`}>{row.status}</td> */}
                  </tr>
                ))}


              </tbody>
            </table>
          </div>

          <span className='pagination'>
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              <FontAwesomeIcon icon={faChevronLeft} />
              {currentPage === 1 ? '' : ' Previous |'}
            </button>
            {viewablePageRange.map((pageNumber) => (
              <button
                key={pageNumber}
                className={currentPage === pageNumber ? 'active' : ''}
                onClick={() => setCurrentPage(pageNumber)}
                disabled={pageNumber === 1 || pageNumber === 2}
                style={{ margin: '5px' }} 
              >
                {pageNumber}
              </button>
            ))}
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              {totalPages > 1 ? '| Next' :''}
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </span>

          </div>
        </div>
        
    </div>
  );
};

export default DataTable;



