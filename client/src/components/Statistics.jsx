import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistics = () => {
    const [selectedMonth, setSelectedMonth] = useState("June");
    const [statistics, setStatistics] = useState({
        totalSaleAmount: 0,
        totalSoldItems: 0,
        totalNotSoldItems: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, [selectedMonth]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/statistics?month=${selectedMonth}`);
            const data = response.data;

            setStatistics({
                totalSaleAmount: data.totalSaleAmount,
                totalSoldItems: data.totalSoldItems,
                totalNotSoldItems: data.totalNotSoldItems,
            });
        } catch (error) {
            console.error("Error fetching statistics:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    return (
        <div className="container mx-auto my-8 p-8 bg-orange-100">
            <h1 className="text-2xl flex justify-center font-bold mb-4">Transactions Statistics</h1>
            <div className="mb-4">
                <label className="mr-4">Select Month:</label>
                <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="border rounded p-2"
                >
                    {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                    ].map((month) => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <h4>Statistics - {selectedMonth}</h4>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <p>Total Sale: ${statistics.totalSaleAmount}</p>
                        <p>Total Sold Items: {statistics.totalSoldItems}</p>
                        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Statistics;
