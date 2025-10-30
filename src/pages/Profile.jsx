import React from 'react'
import Layout from '../components/Layout'

function Profile() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm">
          <p className="text-slate-600">This is a placeholder for the profile page.</p>
        </div>
      </div>
    </Layout>
  )
}

export default Profile


