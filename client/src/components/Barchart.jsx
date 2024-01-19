import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

const BarChart = () => {
    const [selectedMonth, setSelectedMonth] = useState(5); // June (0-indexed)
    const [barChartData, setBarChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

    useEffect(() => {
        fetchBarChartData();
    }, [selectedMonth]);

    const fetchBarChartData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/barChart?month=${selectedMonth}`);
            const data = response.data.data;

            if (data && Array.isArray(data)) {
                const barChartData = data.map((item) => ({
                    rangeLabel: getRangeLabel(item.range),
                    count: item.count,
                }));

                // Log the barChartData
                console.log("Fetched Bar Chart Data:", barChartData);

                setBarChartData(barChartData);
            } else {
                console.error("Invalid or undefined data format:", data);
            }
        } catch (error) {
            console.error("Error fetching bar chart data:", error.message);
        } finally {
            setLoading(false);
        }
    };


    const getRangeLabel = (range) => {
        return `${range.min}-${range.max}`;
    };

    useEffect(() => {
        if (!loading && barChartData.length > 0) {
            drawBarChart();
        }
    }, [loading, barChartData, selectedMonth]);

    const drawBarChart = () => {
        console.log("Drawing Bar Chart"); 
        const ctx = chartRef.current;

        if (!ctx) {
            console.error("Canvas element not found.");
            return;
        }

        const chartData = {
            labels: barChartData.map((range) => range.rangeLabel),
            datasets: [
                {
                    label: `Bar Chart Stats - ${getMonthName(selectedMonth)}`,
                    data: barChartData.map((range) => range.count),
                    backgroundColor: "rgba(75,192,192,0.6)",
                    borderColor: "rgba(75,192,192,1)",
                    borderWidth: 1,
                },
            ],
        };

        // const chartOptions = {
        //     scales: {
        //         x: {
        //             type: 'category',
        //             labels: barChartData.map((range) => range.rangeLabel),
        //             scaleLabel: {
        //                 display: true,
        //                 labelString: "Price Range",
        //             },
        //         },
        //         y: {
        //             type: 'linear', // Change the scale type to 'linear'
        //             beginAtZero: true,
        //             ticks: {
        //                 stepSize: 20,
        //                 max: 80,
        //             },
        //             title: {
        //                 display: true,
        //                 text: "Number of Items",
        //             },
        //         },
        //     },
        // };
        // const chartOptions = {
        //     scales: {
        //         x: {
        //             type: 'category',
        //             labels: barChartData.map((range) => range.rangeLabel),
        //             scaleLabel: {
        //                 display: true,
        //                 labelString: "Price Range",
        //             },
        //         },
        //         y: {
        //             beginAtZero: true,
        //         },
        //     },
        // };

        const chartOptions = {
            scales: {
                x: {
                    type: 'category',
                    labels: barChartData.map((range) => range.rangeLabel),
                    scaleLabel: {
                        display: true,
                        labelString: "Price Range",
                    },
                },
                y: {
                    beginAtZero: true,
                    stepSize: 20, // Set the desired step size
                    ticks: {
                        callback: function (value) {
                            return value; // Adjust the formatting if needed
                        },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Number of Items",
                    },
                },
            },
        };


        console.log("Chart Data:", chartData);
        console.log("Chart Options:", chartOptions);

        // Destroy the previous chart if it exists
        if (window.myBarChart) {
            window.myBarChart.destroy();
        }

        // Create a new chart
        window.myBarChart = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: chartOptions,
        });
    };



    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value, 10));
    };

    const getMonthName = (month) => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        return monthNames[month];
    };

    return (
        <div className="container mx-auto my-8 p-8 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Transactions Bar Chart</h1>
            <div className="mb-4">
                <label className="mr-4">Select Month:</label>
                <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="border rounded p-2"
                >
                    {Array.from({ length: 10 }, (_, index) => (
                        <option key={index} value={index}>
                            {getMonthName(index)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <canvas ref={chartRef} width="800" height="400"></canvas>
                )}
            </div>
        </div>
    );
};

export default BarChart;
