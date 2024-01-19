import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionsTable = () => {
    const [selectedMonth, setSelectedMonth] = useState("March");
    const [searchText, setSearchText] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3001/listTransactions?month=${selectedMonth}&search=${searchText}&page=${currentPage}`
            );
            setTransactions(response.data.data);
        } catch (error) {
            console.error("Error fetching transactions:", error.message);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth, searchText, currentPage]);

    const handleMonthChange = (e) => {
        const monthNames = [
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
        ];

        const selectedMonth = monthNames.indexOf(e.target.value) + 1; // Get numeric representation
        setSelectedMonth(selectedMonth);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return (
        <div className="container mx-auto p-8 bg-gray-100">
            <div className="flex justify-center">
                <h1 className="text-2xl align-center font-bold mb-4 ">Transactions Dashboard</h1>
            </div>
            <div className="flow-root">
                <div className="flow-left mb-4">
                    <label className=" flex-end mr-4">Select Month:</label>
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

                <div className="mb-4 flow-right">
                    <label className="mr-4">Search Transaction:</label>
                    <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        className="border rounded p-2"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto scroll-smooth sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div className="overflow-hidden scroll-smooth scroll-bar">
                            <table className="min-w-half text-wrap text-sm font-light ">
                                <thead className="border-b font-medium dark:border-neutral-500">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">
                                            ID
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Description
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Sold
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Date of Sold
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Image
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions &&
                                        transactions.map((transaction, index) => (
                                            <tr
                                                key={transaction._id}
                                                className={`border-b dark:border-neutral-500 ${index % 2 === 0 ? "bg-green-100" : "bg-blue-100"
                                                    }`}
                                            >
                                                <td className="whitespace-wrap px-6 py-4">{transaction.id}</td>
                                                <td className="whitespace-wrap px-6 py-4">{transaction.title}</td>
                                                <td className="whitespace-wrap px-6 py-4">{transaction.description}</td>
                                                <td className="whitespace-wrap px-6 py-4">{transaction.category}</td>
                                                <td className="whitespace-wrap px-6 py-4">{transaction.price}</td>
                                                <td className="whitespace-wrap px-6 py-4">{transaction.sold ? "YES" : "NO"}</td>
                                                <td className="whitespace-wrap px-6 py-4">{transaction.dateOfSale}</td>
                                                <td className="whitespace-wrap px-6 py-4">
                                                    <img
                                                        className="bg-cover bg-center"
                                                        style={{
                                                            width: "300px",
                                                            height: "100px",
                                                            borderRadius: "50%",
                                                        }}
                                                        src={transaction.image}
                                                        alt={transaction.title}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between">
                <button
                    onClick={handlePrevPage}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Previous
                </button>
                <span className="text-lg"> Page {currentPage} </span>
                <button
                    onClick={handleNextPage}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TransactionsTable;
