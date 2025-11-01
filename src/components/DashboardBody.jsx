import React, { useEffect, useState } from "react";
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
  BarChart,
  Bar,
} from "recharts";
import {
  getAllPatientAPI,
  getAllDoctorAPI,
  getAllAppointmentAPI,
} from "../services/allAPI";

const DashboardBody = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          getAllPatientAPI(),
          getAllDoctorAPI(),
          getAllAppointmentAPI(),
        ]);

        if (patientsRes.status === 200) setPatients(patientsRes.data);
        if (doctorsRes.status === 200) setDoctors(doctorsRes.data);
        if (appointmentsRes.status === 200) setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Computed Stats
  const totalPatients = patients.length;
  const activeDoctors = doctors.filter((d) => d.available).length;
  const totalAppointments = appointments.length;

  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter((a) => a.date === today).length;

  // ✅ Data for Charts
  const appointmentsByDoctor = doctors.map((doc) => ({
    name: doc.name,
    appointments: appointments.filter((a) => a.doctorId === doc.id).length,
  }));

  // Sort by appointment count (for neatness)
  appointmentsByDoctor.sort((a, b) => b.appointments - a.appointments);

  const appointmentsOverTime = appointments.map((a) => ({
    date: a.date,
    count: appointments.filter((x) => x.date === a.date).length,
  }));

  // Remove duplicate dates for the line chart
  const uniqueAppointmentsOverTime = Array.from(
    new Map(appointmentsOverTime.map((item) => [item.date, item])).values()
  );

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: faUserInjured,
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Today's Appointments",
      value: todaysAppointments,
      icon: faCalendarCheck,
      color: "from-green-500 to-green-700",
    },
    {
      title: "Total Appointments",
      value: totalAppointments,
      icon: faRupeeSign,
      color: "from-yellow-500 to-yellow-700",
    },
    {
      title: "Active Doctors",
      value: activeDoctors,
      icon: faStethoscope,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard</h2>

      {/* ✅ Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl bg-linear-to-br ${item.color} text-white shadow-md flex items-center gap-4`}
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

      {/* ✅ Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart – Appointments Over Time */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Appointments Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uniqueAppointmentsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart – Appointments per Doctor */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Appointments by Doctor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsByDoctor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#10B981" barSize={40} radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardBody;
