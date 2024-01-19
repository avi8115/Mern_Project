// client/src/App.js
import React from "react";
import TransactionsTable from "./components/TransactionsTable";
import Statistics from "./components/Statistics";
import BarChart from "./components/Barchart";

function App() {
  return (
    <div>
      <TransactionsTable />
      <Statistics />
      <BarChart/>
    </div>
  );
}

export default App;
