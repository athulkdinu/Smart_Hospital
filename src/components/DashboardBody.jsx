import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserInjured,
  faCalendarCheck,
  faRupeeSign,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardBody = () => {
  const data = [
    { month: "Jan", patients: 120 },
    { month: "Feb", patients: 150 },
    { month: "Mar", patients: 90 },
    { month: "Apr", patients: 170 },
    { month: "May", patients: 130 },
    { month: "Jun", patients: 200 },
  ];

  const stats = [
    {
      title: "Total Patients",
      value: "1,248",
      icon: faUserInjured,
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Appointments Today",
      value: "56",
      icon: faCalendarCheck,
      color: "from-green-500 to-green-700",
    },
    {
      title: "Revenue",
      value: "₹3.2L",
      icon: faRupeeSign,
      color: "from-yellow-500 to-yellow-700",
    },
    {
      title: "Active Doctors",
      value: "24",
      icon: faStethoscope,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md flex items-center gap-4`}
          >
            <div className="bg-white/20 p-3 rounded-lg">
              <FontAwesomeIcon icon={item.icon} size="2x" />
            </div>
            <div>
              <p className="text-sm opacity-80">{item.title}</p>
              <h3 className="text-xl font-bold">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Patient Trends (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="patients"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardBody;
