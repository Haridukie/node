import React, { useState, useEffect, useRef } from 'react';
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-zoom'
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../components/custom-datepicker-styles.css';
import rightarrow from '../assets/arrow-right.svg';
import calendar from '../assets/calendar.svg';
import dropdown from '../assets/dropdown.svg';
import filter from '../assets/Filter.svg';
import time from '../assets/time.svg';
import zoomin from '../assets/zoomin.svg';
import zoomout from '../assets/zoomout.svg';
import drag from '../assets/drag.png';
import home from '../assets/reset.svg';
import { format } from 'date-fns';
import './LineChart.css'
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartZoomPlugin from 'chartjs-plugin-zoom';
import { ChartType } from 'chart.js/auto';
import io from 'socket.io-client';

Chart.register(zoomPlugin);

Chart.register(...registerables);




const Dropdown = () => {
    const [selectedOption, setSelectedOption] = useState('System Health Checks');
  
    const dropdownRef = useRef<HTMLDivElement | null>(null); 
  
    return (
      <div className="custom-dropdown" ref={dropdownRef}>
        <div className="dropdown-header">
          <span className="dropdown-text">{selectedOption}</span>
          <img src={dropdown} alt="dropdown" />
        </div>
      </div>
    );
  };


  const TimeSchedule = ({ selectedTime, onTimeSelect }: { selectedTime: string, onTimeSelect: (time: string) => void }) => {
    const [showOptions, setShowOptions] = useState(false);
  
    const options = ['Past 1 hour', 'Past 3 hour', 'Past 6 hour'];
  
    const timeScheduleRef = useRef<HTMLDivElement | null>(null);
  
    const handleTimeScheduleToggle = () => {
      setShowOptions(!showOptions);
    };
  
    const handleTimeSelect = (time: string) => {
      setShowOptions(false);
      onTimeSelect(time);
    };
  
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (timeScheduleRef.current && !timeScheduleRef.current.contains(event.target as Node)) {
          setShowOptions(false);
        }
      };
  
      window.addEventListener('click', handleOutsideClick);
  
      return () => {
        window.removeEventListener('click', handleOutsideClick);
      };
    }, []);
  
    return (
      <div className="custom-time-schedule" ref={timeScheduleRef}>
        <div className="time-schedule-header" onClick={handleTimeScheduleToggle}>
          <img src={calendar} alt="calendar" style={{ cursor: 'pointer' }} />
          <span className="time-schedule-text">{selectedTime}</span>
          <img src={dropdown} alt="dropdown" style={{ cursor: 'pointer', marginLeft: ".371vh", marginRight: "0" }} />
        </div>
        {showOptions && (
          <div className="options-container-tm">
            <ul className="options-list-tm">
              {options.map((option, index) => (
                <li key={index} onClick={() => handleTimeSelect(option)}>
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  



const Timeinterval = ({ selectedOption, onOptionSelect }: { selectedOption: string, onOptionSelect: (option: string) => void}) => {
  const [showOptions, setShowOptions] = useState(false);

  const options = ['1 Min', '5 Min', '15 Min'];

  const timeIntervalRef = useRef<HTMLDivElement | null>(null);

  const handleDropdownClick = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionSelect = (option: string) => {
    setShowOptions(false);
    onOptionSelect(option);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (timeIntervalRef.current && !timeIntervalRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="custom-dropdown-tm" ref={timeIntervalRef}>
      <div className="dropdown-header-tm" onClick={handleDropdownClick}>
        <img src={time} alt="clock" style={{ cursor: 'pointer' }} />
        <span className="dropdown-tm-text">{selectedOption}</span>
        <img src={dropdown} alt="dropdown" style={{ cursor: 'pointer', marginLeft: ".371vh", marginRight: "0" }} />
      </div>
      {showOptions && (
        <div className="options-container-tm">
          <ul className="options-list-tm">
            {options.map((option, index) => (
              <li key={index} onClick={() => handleOptionSelect(option)}>
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const LineChart = ({ onDataFetched }: { onDataFetched: (data: any[]) => void }) => {
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [apiData, setApiData] = useState<any[]>([]);

  const [chartData, setChartData] = useState<any>({
    chartLabels: [] as string[],
    chartDataPoints: [] as number[],
    outlierDataPoints: [] as number[],
    outlierDataTimePoints: [] as string[],
  });
  const [selectedOption, setSelectedOption] = useState('1 Min');
  const [selectedTime, setSelectedTime] = useState('Past 1 hour');
  const canvasRef = useRef<any>(null);
  const chartRef = useRef<any>(null);


  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    fetchDataFromAPI(option, selectedTime);
  };

  const handleTimeSelect = (option: string) => {
    setSelectedTime(option);
    fetchDataFromAPI(selectedOption, option);
  };

  const hasMounted = useRef(false);

  useEffect(() => {
    // Code to run when the component is mounted
    if (!hasMounted.current) {
      fetchDataFromAPI(selectedOption, selectedTime);
      hasMounted.current = true;
      console.log("Default 1 hour ( 1 Min tag) data retrieval")
    }
  }, []); 


  
  
  
  const fetchDataFromAPI = (option: string, time: string) => {

    console.log(option); 
    console.log(time);

    if (time && option) {

      fetch(`https://adapiserver.ddns.net/newmethod/${time}/${option}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        .then((responseData) => {

          console.log("API response:", responseData);

          // Extracting data from the API response
          const chartLabels = responseData.data.map((item: any) => item._time);
          
          const chartDataPoints = responseData.data.map((item: any) => item._value);

          // Calculate chart data points for the outlier data (with points)
          const outlierDataPoints = responseData.data.map((item:any) => item.outlier_point);
          
          // Pass the fetched data to the parent component
          
          onDataFetched(responseData.data);
          // console.log(responseData.data)

          // Update the chartData state with the API response for the graph
          setChartData({
            chartLabels,
            chartDataPoints,
            outlierDataPoints,
          });

          // setTimeout(() => {
          //   establishWebSocketConnection( time, option);
          // }, 90000);
          establishWebSocketConnection( time, option);
          
        })
        
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
    else {
      console.log('Invalid time or option selected.');
    }
  };


  const [socket, setSocket] = useState<WebSocket | null>(null); 
  const [datas, setData] = useState([]);
    
  const establishWebSocketConnection = ( time: string, option: string) => {

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }

    const url = `wss://adapiserver.ddns.net//time/${time}/${option}`;

    const newSocket = new WebSocket(url);

    newSocket.onopen = () => {
      console.log(`WebSocket connection established`);
    };

    newSocket.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);


      //setData(receivedData.data);

      setChartData((prevChartData:any) => {

        //console.log(receivedData)
        const times = receivedData.map((item:any) => item._time);
        const values = receivedData.map((item:any) => item._value);
        const out_values = receivedData.map((item:any) => item.outlier_point);
        //console.log(times,values,out_values)
        // Add the new data to the end
        const updatedChartLabels = [...prevChartData.chartLabels, ...times];
        const updatedChartDataPoints = [...prevChartData.chartDataPoints, ...values];
        const updatedOutlierDataPoints = [...prevChartData.outlierDataPoints, ...out_values];
  
        // Remove the first data
        updatedChartLabels.shift();
        updatedChartDataPoints.shift();
        updatedOutlierDataPoints.shift();
        // console.log("ChartUpdated Time",updatedChartLabels);
        // console.log("ChartUpdated Points",updatedChartDataPoints);
        // console.log("ChartUpdated Outlier",updatedOutlierDataPoints);
        return {
          chartLabels: updatedChartLabels,
          chartDataPoints: updatedChartDataPoints,
          outlierDataPoints: updatedOutlierDataPoints,
        };
      });
      
      onDataFetched(receivedData);
      // console.log(receivedData);
      
    };

    newSocket.onclose = (event) => {
      console.log(`WebSocket connection closed`);
    };

    setSocket(newSocket);
  };

 
  
  useEffect(() => {
    const canvas = document.querySelector('canvas');

    if (canvas) {
      canvas.id = 'myChart';
      const canvasHeightStyle = canvas.style.height; 
      
      // console.log(`Height (from style): ${canvasHeightStyle}`);
      // Remove "px" suffix and parse to a number
      const numericCanvasHeight = parseInt(canvasHeightStyle, 10); // Using parseInt with base 10
      
      setCanvasHeight(numericCanvasHeight);
      // console.log(canvas.id)
    }

    const chart = chartRef.current;
    //console.log('ChartRef', chartRef.current);

    if (chart) {
      // console.log('ChartJS', chart);
      const chartInstance = chartRef.current.chartInstance;
      // console.log(chartInstance);
      if (chartInstance) {
        // console.log('ChartInstance', chartInstance);
        // Modify chart options or update the chart as needed.
      }
    }
    
  }, []);



  // console.log('graph',canvasHeight)
  const fontPercentage=0.0312;
  const borderWidthPercentage = 0.007; 
  const pointRadiusPercentage = 0.012; 

  const fontsize = canvasHeight * fontPercentage
  const borderWidth = canvasHeight * borderWidthPercentage;
  const pointRadius = canvasHeight * pointRadiusPercentage;
  // console.log("font",fontsize)

  const paddingtop = .02667; 
  const paddingright = 0.09778; 
  const paddingbottom = 0.04889; 
  const paddingleft = 0.04889; 

  const dynamicPadding = {
    top: canvasHeight * paddingtop,
    right: canvasHeight * paddingright,
    bottom: canvasHeight * paddingbottom,
    left: canvasHeight * paddingleft, 
  };
  

  // console.log('paddings',dynamicPadding)


  const handleReset = () => {
    console.log("Reset Button");
    if (chartRef.current) {
      console.log("Entered");
      const chart = chartRef.current;
      chart.resetZoom(); 
      console.log("Done");
    }
    else{
      console.log("Not Working");
    }
  };

  const handleZoomIn = () => {
    console.log("ZoomIn Button");
    if (chartRef.current) {
      console.log("Entered");
      const chart = chartRef.current;
      const zoomLevel = 1.2; 
      chart.zoom(zoomLevel, 'none') 
      console.log("Done");
    }
    else{
      console.log("Not Working");
    }
  };

  const handleZoomOut = () => {
    console.log("ZoomOut Button");
    if (chartRef.current) {
      console.log("Entered");
      const chart = chartRef.current;
      const zoomLevel = 1 / 1.2;
      chart.zoom(zoomLevel, 'none') 
      console.log("Done");
    }
    else{
      console.log("Not Working");
    }
  };



  const options = {

    
    plugins: {

      afterDraw: (chart:any) => {
        if (chart.tooltip?._active?.length) {
          let x = chart.tooltip._active[0].element.x;
          let yAxis = chart.scales.y;
          let ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, yAxis.top);
          ctx.lineTo(x, yAxis.bottom);
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#ff0000';
          ctx.stroke();
          ctx.restore();
        }
      },
      
      tooltip: {
        
        usePointStyle: true,
        family: 'Poppins',
        enabled: true,
        backgroundColor: '#FAFAFA',
        titleColor: '#7A7A7A',
        bodyColor: '#0F60FF',
        bodySpacing: 2,
        bodyAlign: 'center' as "center" | "left" | "right" | undefined,
        bodyFont: {
          family: 'Poppins',
          weight: 'bold',
          size: 16
       },
       callbacks: {
        label: function (context:any) {
          const point = context.dataset.data[context.dataIndex];
          const value = parseFloat(point);
          
          return `${value.toFixed(2)}%`;
        }
      },
      
      },
      legend: {
        display: false
      },
      zoom: {
        zoom: {
          // wheel: {
          //   enabled: true,
          // },
          // pinch: {
          //   enabled: true
          // },
          // drag: {
          //   enabled: true
          // },
          mode: 'x' as 'x' | 'y' | 'xy',
        },
        pan: {
          enabled: true,
          mode: 'x' as 'x' | 'y' | 'xy',
        },
        sensitivity: 0.5,
        max: 5, 
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestamp', 
          font: {
            family: 'Poppins',
            size: fontsize,
          },
          color: '#242533', 
          
        },
        ticks: {
          display: true,
          font: {
            family: 'Poppins',
            size: fontsize,
          },
          // max: 5,
          callback: function (value:any, index:any, values:any) {
            // Parse the ISO 8601 timestamp
            const timestamp = chartData?.chartLabels[value];
            const date = new Date(timestamp);
        
            // Check if it's 15, 30, 45, or 0 minutes past the hour
            const minutes = date.getUTCMinutes();
            if (minutes === 0) {
              const formattedHours = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : date.getUTCHours();
              const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
              const formattedSeconds = date.getUTCSeconds() < 10 ? `0${date.getUTCSeconds()}` : date.getUTCSeconds();
              return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
          } else if (minutes === 15 || minutes === 30 || minutes === 45) {
              return `${minutes}min`;
          } else {
              return ''; 
          }
        },
        
          autoSkip: false, 
          maxRotation: 0, 
          minRotation: 0 
        },
        
        beginAtZero: true,
        grid: {
          display: false,
          color: "#ddd"
        }
        
      },
      y: {
        title: {
          display: true,
          text: 'Percentage', 
          font: {
            family: 'Poppins',
            size: fontsize,
          },
          color: '#242533',
        },
        // beginAtZero: true,
        grid: {
          display: false, 
          color: "#ddd" 
        },
        ticks: {
          font: {
            family: 'Poppins',
            size: fontsize,
          },
          callback: function (value:any) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value.toFixed(0);
          },
          count: 5,
          
        }
      }
    },

    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: dynamicPadding
    }   
  };


  const data = {
    labels: chartData.chartLabels,
                datasets: [
                  {
                    label: "Outlier",
                    backgroundColor: "#0F6FFF",
                    borderColor: "#0F6FFF",
                    data: chartData.outlierDataPoints.map((value: any, index:any) => value > 0 ? value : null), 
                    pointRadius: pointRadius,
                    pointBackgroundColor: "#0F60FF",
                    pointBorderColor: "#0F60FF",
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#0F6FFF",
                    pointHoverBorderColor: "#FFFFFF",
                    pointHitRadius: 10,
                    showLine: false,
                },
                {
                  label: "Point",
                  backgroundColor: "rgb(255, 99, 132)",
                  borderColor: "#45AFEE", 
                  data: chartData.chartDataPoints,
                  tension: 0,
                  fill: false,
                  pointRadius: 0,
                  pointHoverRadius: 0,
                  pointHitRadius: 0,
                  borderWidth: borderWidth,
                },
              ],
  }
  
  
  




  return (
    <div className='container1'>

      {/* TIMEINTERVAL AND DATEPICKER */}
      <div className="DataCalendar">

        <div className="top-bar-left" >
          <Dropdown />
        </div>

        <span className="top-bar" >

          <button className="time-interval" >
            <TimeSchedule selectedTime={selectedTime} onTimeSelect={handleTimeSelect}/>
          </button>
          
          <button className="time-interval" >
            <Timeinterval selectedOption={selectedOption} onOptionSelect={handleOptionSelect}/>
          </button>
          <button className="toggles" onClick={handleZoomIn}>
            <img src={zoomin} alt="Zoomin"/>
            <span className="tooltiptext zoomin">Zooming In</span>  
          </button>
          <button className="toggles" onClick={handleZoomOut}>
            <img src={zoomout} alt="Zoomout"/>
            <span className="tooltiptext zoomout">Zooming Out</span>
          </button>
          <button className="toggles" >
            <img src={drag} alt="Drag"/>
            <span className="tooltiptext drag">Panning</span>
          </button>
          <button className="toggles" onClick={handleReset}>
            <img src={home} alt="Reset"/>
            <span className="tooltiptext reset">Reset Zoom</span>
          </button>
        </span>

      </div>

      {/* LINE GRAPH CODE */}
      <div className="chart-container" style={{ display: 'flex',alignItems: 'center', justifyContent: "center", flexDirection: 'column' }}>
      
        <div className="graph">
          <Line
            ref={chartRef} 
            data={data} 
            options={options}   
          /> 
        </div>
      </div>

    </div>
  );
};

export default LineChart;

