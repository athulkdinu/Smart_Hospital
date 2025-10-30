import React, { useState } from 'react'
import { motion } from "framer-motion";

import { useNavigate, Link } from 'react-router-dom'
import { patients } from '../data/fakeData'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const newPatient = {
      id: patients.length + 1,
      name: formData.name,
      loginId: formData.email,
      password: formData.password,
      role: 'Patient',
    }

    patients.push(newPatient)
    localStorage.setItem('user', JSON.stringify(newPatient))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-200">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          🧾 Patient Registration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Full Name" onChange={handleChange} required className="input-style" />
          <input name="age" type="number" placeholder="Age" onChange={handleChange} required className="input-style" />
          <select name="gender" onChange={handleChange} required className="input-style">
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input name="email" type="email" placeholder="Email (Login ID)" onChange={handleChange} required className="input-style" />
          <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} required className="input-style" />
          <input name="address" placeholder="Address" onChange={handleChange} required className="input-style" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="input-style" />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required className="input-style" />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
          </motion.button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
