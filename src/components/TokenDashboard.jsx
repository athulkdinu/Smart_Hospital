import React, { useEffect, useState } from "react";
import {
  getAllDoctorAPI,
  getAllPatientAPI,
  getAllTokenAPI,
} from "../services/allAPI";

const TokenDashboard = () => {
  const [tokens, setTokens] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorRes, patientRes, tokenRes] = await Promise.all([
        getAllDoctorAPI(),
        getAllPatientAPI(),
        getAllTokenAPI(),
      ]);

      setDoctors(doctorRes?.data || []);
      setPatients(patientRes?.data || []);
      setTokens(tokenRes?.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayTokens = tokens.filter((t) => t.date === today);

  const filteredTokens = tokens.filter(
    (t) =>
      t.patientName?.toLowerCase().includes(search.toLowerCase()) &&
      (filterDoctor ? t.doctorName === filterDoctor : true)
  );

  return (
    <div className="p-8 w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🎫 Token Dashboard
        </h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition-all duration-200"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
          <p className="text-gray-500 text-sm">Total Tokens</p>
          <h3 className="text-3xl font-semibold text-blue-600 mt-2">
            {tokens.length}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
          <p className="text-gray-500 text-sm">Today's Tokens</p>
          <h3 className="text-3xl font-semibold text-green-600 mt-2">
            {todayTokens.length}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
          <p className="text-gray-500 text-sm">Active Doctors</p>
          <h3 className="text-3xl font-semibold text-purple-600 mt-2">
            {doctors.filter((d) => d.available).length}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search by patient name..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-1/2"
          >
            <option value="">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.name}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Token Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-3 px-6 text-left font-medium">#</th>
              <th className="py-3 px-6 text-left font-medium">Patient</th>
              <th className="py-3 px-6 text-left font-medium">Doctor</th>
              <th className="py-3 px-6 text-left font-medium">Date</th>
              <th className="py-3 px-6 text-left font-medium">Status</th>
              <th className="py-3 px-6 text-left font-medium">Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token, idx) => (
                <tr
                  key={token.id}
                  className="hover:bg-gray-50 transition-colors border-t"
                >
                  <td className="py-3 px-6">{idx + 1}</td>
                  <td className="py-3 px-6">{token.patientName}</td>
                  <td className="py-3 px-6">{token.doctorName}</td>
                  <td className="py-3 px-6">{token.date}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (token.status || 'Pending').toLowerCase() === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : (token.status || 'Pending').toLowerCase() === 'skipped'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {(token.status || 'Pending')}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-600">
                    {new Date(token.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No tokens found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenDashboard;
